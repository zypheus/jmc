<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Support\PerPage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminActivityController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->input('category', 'patron');
        if (! in_array($category, ['patron', 'library_staff'], true)) {
            $category = 'patron';
        }

        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = AdminActivity::query()
            ->with('user')
            ->latest();

        if ($category === 'patron') {
            $query->patronNotifications();
        } else {
            $query->staffActivities();
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $activities = $query
            ->paginate(PerPage::resolve($request, 30))
            ->withQueryString();

        return Inertia::render('Library/Admin/Activities/Index', [
            'activities' => $activities,
            'category' => $category,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
        ]);
    }

    public function recent(Request $request)
    {
        $user = $request->user();
        $since = $user?->notification_last_seen_at;

        $activities = AdminActivity::query()
            ->patronNotifications()
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn (AdminActivity $a) => [
                'id' => $a->id,
                'type' => $a->type,
                'title' => $a->title,
                'body' => $a->body,
                'action_url' => $a->action_url,
                'icon' => $a->icon,
                'created_at' => $a->created_at?->timezone('Asia/Manila')->format('M j, g:i A'),
                'is_unread' => ! $since || $a->created_at->gt($since),
            ]);

        $unreadCount = AdminActivity::query()
            ->patronNotifications()
            ->when($since, fn ($q) => $q->where('created_at', '>', $since))
            ->count();

        return response()->json([
            'unread_count' => $unreadCount,
            'activities' => $activities,
        ]);
    }

    public function markSeen(Request $request)
    {
        $request->user()?->update(['notification_last_seen_at' => now()]);

        return response()->json(['success' => true]);
    }
}
