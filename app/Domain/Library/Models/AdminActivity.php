<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AdminActivity extends Model
{
    protected $table = 'admin_activities';

    public const TYPE_ROOM_RESERVATION = 'room_reservation';

    public const TYPE_BOOK_RESERVATION = 'book_reservation';

    public const TYPE_PATRON_REGISTRATION = 'patron_registration';

    public const TYPE_PATRON_EDIT_REQUEST = 'patron_edit_request';

    public const TYPE_FEEDBACK = 'library_feedback';

    public const TYPE_CIRCULATION = 'circulation';

    public const TYPE_SELF_CHECKOUT = 'self_checkout';

    public const TYPE_CATALOG = 'catalog';

    public const TYPE_EBOOK = 'ebook';

    public const TYPE_PATRON = 'patron';

    public const TYPE_ROOM = 'room';

    public const TYPE_FILE = 'file';

    public const TYPE_USER = 'user';

    public const TYPE_SETTINGS = 'library_settings';

    public const TYPE_PROSPECTUS = 'prospectus';

    public const TYPE_SMS = 'sms';

    /** Types shown in the header notification bell (patron-initiated only). */
    public static function patronNotificationTypes(): array
    {
        return [
            self::TYPE_ROOM_RESERVATION,
            self::TYPE_BOOK_RESERVATION,
            self::TYPE_PATRON_REGISTRATION,
            self::TYPE_PATRON_EDIT_REQUEST,
            self::TYPE_FEEDBACK,
            self::TYPE_SELF_CHECKOUT,
        ];
    }

    public function scopePatronNotifications($query)
    {
        return $query->whereIn('type', self::patronNotificationTypes());
    }

    public function scopeStaffActivities($query)
    {
        return $query->whereNotIn('type', self::patronNotificationTypes());
    }

    public function isPatronNotification(): bool
    {
        return in_array($this->type, self::patronNotificationTypes(), true);
    }

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'action_url',
        'icon',
        'subject_type',
        'subject_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function iconClass(): string
    {
        return match ($this->icon) {
            'room' => 'text-primary',
            'book' => 'text-success',
            'patron' => 'text-info',
            'library_feedback' => 'text-warning',
            'circulation' => 'text-secondary',
            default => 'text-muted',
        };
    }
}
