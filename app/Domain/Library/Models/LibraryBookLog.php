<?php

namespace App\Domain\Library\Models;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class LibraryBookLog extends Model
{
    protected $table = 'library_book_logs';

    use HasFactory;

    public const CIRCULATION_CHECKOUT = 'checkout';

    public const CIRCULATION_ROOM_USE = 'room_use';

    protected $fillable = [
        'book_id',
        'student_id',
        'employee_id',
        'patron_name',
        'status',
        'circulation_type',
        'renew_count',
        'last_renewed_at',
        'timestamp',
        'due_date',
        'returned_date',
        'fine_incurred',
        'fine_original',
        'fine_balance',
        'fine_paid_total',
        'fine_waived_total',
        'fine_cleared_at',
        'fine_clearance_type',
        'fine_clearance_note',
        'fine_cleared_by',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'due_date' => 'date',
        'returned_date' => 'datetime',
        'last_renewed_at' => 'datetime',
        'fine_incurred' => 'decimal:2',
        'fine_original' => 'decimal:2',
        'fine_balance' => 'decimal:2',
        'fine_paid_total' => 'decimal:2',
        'fine_waived_total' => 'decimal:2',
        'fine_cleared_at' => 'datetime',
    ];

    protected $appends = [
        'is_overdue',
        'days_overdue',
        'total_fine',
    ];

    /**
     * Latest log per book is Checked Out for this student (includes room use).
     */
    public static function countActiveLoansForStudent(int $studentId): int
    {
        $latestIds = DB::table('library_book_logs')
            ->selectRaw('MAX(id) as id')
            ->groupBy('book_id')
            ->pluck('id');

        if ($latestIds->isEmpty()) {
            return 0;
        }

        return (int) static::query()
            ->whereIn('id', $latestIds)
            ->where('student_id', $studentId)
            ->where('status', 'Checked Out')
            ->count();
    }

    public static function countActiveLoansForEmployee(int $employeeId): int
    {
        $latestIds = DB::table('library_book_logs')
            ->selectRaw('MAX(id) as id')
            ->groupBy('book_id')
            ->pluck('id');

        if ($latestIds->isEmpty()) {
            return 0;
        }

        return (int) static::query()
            ->whereIn('id', $latestIds)
            ->where('employee_id', $employeeId)
            ->where('status', 'Checked Out')
            ->count();
    }

    public function book()
    {
        return $this->belongsTo(LibraryBook::class, 'book_id');
    }

    public function student()
    {
        return $this->belongsTo(LibraryStudent::class, 'student_id');
    }

    public function employee()
    {
        return $this->belongsTo(LibraryEmployee::class, 'employee_id');
    }

    public function clearedBy()
    {
        return $this->belongsTo(User::class, 'fine_cleared_by');
    }

    public function fineIsCleared(): bool
    {
        return $this->fine_cleared_at !== null;
    }

    /**
     * Human label for how the book was issued (only meaningful while out; check-in rows copy the closed loan type).
     */
    public function circulationLabel(): string
    {
        $type = $this->circulation_type ?? self::CIRCULATION_CHECKOUT;

        if ($this->status === 'Checked In') {
            return 'Check in';
        }

        return $type === self::CIRCULATION_ROOM_USE ? 'Room use' : 'Check out';
    }

    /**
     * One-line description for patron-facing transaction history.
     */
    public function historySummary(): string
    {
        $type = $this->circulation_type ?? self::CIRCULATION_CHECKOUT;

        if ($this->status === 'Checked In') {
            $kind = $type === self::CIRCULATION_ROOM_USE ? 'room-use loan' : 'outside loan';

            return 'Returned ('.$kind.')';
        }

        if ($type === self::CIRCULATION_ROOM_USE) {
            return 'Room use (in library)';
        }

        return 'Checked out (outside library)';
    }

    public function patronLabel(): string
    {
        if ($this->student_id) {
            $this->loadMissing('student');
            if ($this->student) {
                return "{$this->student->lastname}, {$this->student->firstname}";
            }
        }

        if ($this->employee_id) {
            $this->loadMissing('employee');
            if ($this->employee) {
                $name = "{$this->employee->lastname}, {$this->employee->firstname}";
                if ($this->employee->middle_initial) {
                    $name .= ' '.$this->employee->middle_initial.'.';
                }

                return $name;
            }
        }

        return $this->patron_name ?? '—';
    }

    public function getTimestampManilaAttribute()
    {
        return $this->timestamp
            ? $this->timestamp->timezone('Asia/Manila')->format('Y-m-d h:i A')
            : null;
    }

    public function getIsOverdueAttribute()
    {
        if (! $this->due_date) {
            return false;
        }

        $compareDate = $this->returned_date
            ? Carbon::parse($this->returned_date)
            : Carbon::now('Asia/Manila');

        return $compareDate->gt($this->due_date);
    }

    public function getDaysOverdueAttribute()
    {
        $settings = LibraryFineSetting::latest('effective_from')->first();

        if (! $this->due_date || ! $settings) {
            return 0;
        }

        $patronTerms = $settings->patronTerms((bool) $this->employee_id);

        $compareDate = $this->returned_date
            ? Carbon::parse($this->returned_date)
            : Carbon::now('Asia/Manila');

        $graceEnd = Carbon::parse($this->due_date)
            ->addDays($patronTerms->grace_period_days);

        if ($compareDate->lte($graceEnd)) {
            return 0;
        }

        return $graceEnd->diffInDays($compareDate);
    }

    public function getTotalFineAttribute()
    {
        if ($this->returned_date) {
            if ($this->fine_cleared_at !== null) {
                return 0.0;
            }

            if ($this->fine_balance !== null) {
                return (float) $this->fine_balance;
            }

            return (float) $this->fine_incurred;
        }

        $settings = LibraryFineSetting::latest('effective_from')->first();

        if (! $settings || $this->days_overdue === 0) {
            return 0;
        }

        $patronTerms = $settings->patronTerms((bool) $this->employee_id);
        $fine = $this->days_overdue * $patronTerms->fine_per_day;

        if (! is_null($patronTerms->max_fine)) {
            $fine = min($fine, $patronTerms->max_fine);
        }

        return round($fine, 2);
    }
}
