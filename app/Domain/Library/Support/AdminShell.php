<?php

namespace App\Domain\Library\Support;

use App\Domain\Library\Models\AdminActivity;
use App\Models\User;
use Illuminate\Http\Request;

class AdminShell
{
    /**
     * @return array<string, mixed>|null
     */
    public static function authUser(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->fullName(),
            'email' => $user->email,
            'role' => $user->getRoleNames()->first(),
            'isAdmin' => $user->getRoleNames()->first() === 'library_admin',
            'initials' => $user->initials(),
            'avatarUrl' => $user->profilePictureUrl(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function adminActivity(?User $user): ?array
    {
        if (! $user || ! $user->hasAnyRole(['library_admin', 'library_staff'])) {
            return null;
        }

        $since = $user->notification_last_seen_at;

        $activities = AdminActivity::query()
            ->patronNotifications()
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (AdminActivity $activity) => [
                'id' => $activity->id,
                'title' => $activity->title,
                'body' => $activity->body,
                'action_url' => $activity->action_url,
                'created_at' => $activity->created_at?->timezone('Asia/Manila')->diffForHumans(),
                'is_unread' => ! $since || $activity->created_at->gt($since),
            ])
            ->values()
            ->all();

        $unreadCount = AdminActivity::query()
            ->patronNotifications()
            ->when($since, fn ($q) => $q->where('created_at', '>', $since))
            ->count();

        return [
            'unreadCount' => $unreadCount,
            'activities' => $activities,
            'urls' => [
                'markSeen' => route('library.admin.activities.mark_seen'),
                'recent' => route('library.admin.activities.recent'),
            ],
        ];
    }

    /**
     * Props consumed by the React admin shell on Blade pages.
     *
     * @return array<string, mixed>
     */
    public static function pageProps(Request $request): array
    {
        $user = $request->user();

        return [
            'auth' => [
                'user' => self::authUser($user),
            ],
            'routeName' => $request->route()?->getName(),
            'adminActivity' => self::adminActivity($user),
        ];
    }
}
