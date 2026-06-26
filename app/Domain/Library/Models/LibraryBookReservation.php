<?php

namespace App\Domain\Library\Models;

use App\Domain\Library\Services\BookReservationNotifier;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LibraryBookReservation extends Model
{
    protected $table = 'library_book_reservations';

    public const STATUS_PENDING = 'pending';

    public const STATUS_READY = 'ready';

    public const STATUS_FULFILLED = 'fulfilled';

    public const STATUS_CANCELLED = 'cancelled';

    private static bool $staleExpiredThisRequest = false;

    protected $fillable = [
        'book_id',
        'student_id',
        'status',
        'reserved_at',
        'ready_at',
        'ready_notified_at',
        'fulfilled_at',
        'cancelled_at',
    ];

    protected $casts = [
        'reserved_at' => 'datetime',
        'ready_at' => 'datetime',
        'ready_notified_at' => 'datetime',
        'fulfilled_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(LibraryBook::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(LibraryStudent::class);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_READY]);
    }

    public function holdStartsAt(): Carbon
    {
        if ($this->status === self::STATUS_READY) {
            return ($this->ready_at ?? $this->reserved_at)->copy()->timezone('Asia/Manila');
        }

        return $this->reserved_at->copy()->timezone('Asia/Manila');
    }

    public function expiresAt(): Carbon
    {
        return $this->holdStartsAt()->copy()->addDays(LibrarySetting::reservationHoldDays());
    }

    public function isExpired(): bool
    {
        return now('Asia/Manila')->greaterThan($this->expiresAt());
    }

    public static function expireStale(): int
    {
        if (self::$staleExpiredThisRequest) {
            return 0;
        }

        self::$staleExpiredThisRequest = true;

        return self::runExpiry();
    }

    public static function runExpiry(): int
    {
        $days = LibrarySetting::reservationHoldDays();
        $cutoff = now('Asia/Manila')->subDays($days);
        $expired = 0;

        $reservations = static::query()
            ->active()
            ->where(function ($query) use ($cutoff) {
                $query->where(function ($ready) use ($cutoff) {
                    $ready->where('status', self::STATUS_READY)
                        ->where(function ($q) use ($cutoff) {
                            $q->where('ready_at', '<=', $cutoff)
                                ->orWhere(function ($q2) use ($cutoff) {
                                    $q2->whereNull('ready_at')->where('reserved_at', '<=', $cutoff);
                                });
                        });
                })->orWhere(function ($pending) use ($cutoff) {
                    $pending->where('status', self::STATUS_PENDING)
                        ->where('reserved_at', '<=', $cutoff);
                });
            })
            ->get();

        foreach ($reservations as $reservation) {
            if (self::cancelExpired($reservation)) {
                $expired++;
            }
        }

        return $expired;
    }

    protected static function cancelExpired(self $reservation): bool
    {
        return (bool) DB::transaction(function () use ($reservation) {
            $reservation = static::query()->lockForUpdate()->find($reservation->id);

            if (! $reservation || ! in_array($reservation->status, [self::STATUS_PENDING, self::STATUS_READY], true)) {
                return false;
            }

            if (! $reservation->isExpired()) {
                return false;
            }

            $wasReady = $reservation->status === self::STATUS_READY;
            $bookId = (int) $reservation->book_id;

            $reservation->update([
                'status' => self::STATUS_CANCELLED,
                'cancelled_at' => now('Asia/Manila'),
            ]);

            if ($wasReady) {
                $book = LibraryBook::query()->lockForUpdate()->find($bookId);
                if ($book && $book->availability === 'On Hold' && ! static::activeForBookWithoutExpiry($bookId)) {
                    $book->update(['availability' => 'Available']);
                }
            }

            return true;
        });
    }

    protected static function activeForBookWithoutExpiry(int $bookId): ?self
    {
        return static::query()
            ->where('book_id', $bookId)
            ->active()
            ->orderBy('reserved_at')
            ->first();
    }

    public static function activeForBook(int $bookId): ?self
    {
        static::expireStale();

        return static::activeForBookWithoutExpiry($bookId);
    }

    public static function blocksRenewal(int $bookId): bool
    {
        static::expireStale();

        return static::query()
            ->where('book_id', $bookId)
            ->active()
            ->exists();
    }

    public static function reserveForStudent(LibraryStudent $student, LibraryBook $book): self
    {
        static::expireStale();

        if ($book->archived_at !== null) {
            throw new RuntimeException('This copy is not available for reservation.');
        }

        if ($book->isReserved()) {
            throw new RuntimeException('This copy is for room use only and cannot be reserved for checkout.');
        }

        return DB::transaction(function () use ($student, $book) {
            $book = LibraryBook::query()->lockForUpdate()->findOrFail($book->id);

            if (static::activeForBookWithoutExpiry((int) $book->id)) {
                throw new RuntimeException('Another patron has already reserved this copy.');
            }

            $duplicate = static::query()
                ->where('book_id', $book->id)
                ->where('student_id', $student->id)
                ->active()
                ->exists();

            if ($duplicate) {
                throw new RuntimeException('You have already reserved this copy.');
            }

            $isBorrowed = $book->availability === 'Borrowed';
            $status = $isBorrowed ? self::STATUS_PENDING : self::STATUS_READY;
            $now = now('Asia/Manila');

            $reservation = static::create([
                'book_id' => $book->id,
                'student_id' => $student->id,
                'status' => $status,
                'reserved_at' => $now,
                'ready_at' => $status === self::STATUS_READY ? $now : null,
            ]);

            if ($status === self::STATUS_READY) {
                $book->update(['availability' => 'On Hold']);
            }

            app(BookReservationNotifier::class)->notifyIfReady($reservation);

            return $reservation;
        });
    }

    public function markReady(): void
    {
        if ($this->status !== self::STATUS_PENDING) {
            return;
        }

        $this->update([
            'status' => self::STATUS_READY,
            'ready_at' => now('Asia/Manila'),
        ]);

        app(BookReservationNotifier::class)->notifyIfReady($this);
    }

    public static function activatePendingForBook(LibraryBook $book): void
    {
        static::expireStale();

        $pending = static::query()
            ->where('book_id', $book->id)
            ->where('status', self::STATUS_PENDING)
            ->orderBy('reserved_at')
            ->lockForUpdate()
            ->first();

        if (! $pending) {
            $book->availability = 'Available';

            return;
        }

        if ($pending->isExpired()) {
            self::cancelExpired($pending);
            $book->availability = 'Available';

            return;
        }

        $pending->markReady();
        $book->availability = 'On Hold';
    }

    public static function fulfillForBookAndStudent(int $bookId, int $studentId): void
    {
        static::query()
            ->where('book_id', $bookId)
            ->where('student_id', $studentId)
            ->where('status', self::STATUS_READY)
            ->update([
                'status' => self::STATUS_FULFILLED,
                'fulfilled_at' => now('Asia/Manila'),
            ]);
    }

    public static function copyBlockedForStudent(LibraryBook $book, ?int $studentId): ?string
    {
        static::expireStale();

        $hold = static::activeForBookWithoutExpiry((int) $book->id);
        if (! $hold) {
            return null;
        }

        if ($studentId && (int) $hold->student_id === (int) $studentId) {
            return null;
        }

        return 'This copy is reserved for another patron.';
    }
}
