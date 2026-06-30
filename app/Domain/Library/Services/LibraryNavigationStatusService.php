<?php

namespace App\Domain\Library\Services;

use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryPendingEmployee;
use App\Domain\Library\Models\LibraryPendingStudent;
use App\Domain\Library\Models\LibraryRoomReservation;
use App\Models\User;

class LibraryNavigationStatusService
{
    public function canView(?User $user): bool
    {
        return $user?->hasAnyRole(['library_admin', 'super_admin']) ?? false;
    }

    /** @return array{pendingPatrons: int, pendingRooms: int, outstandingFines: int} */
    public function counts(): array
    {
        return [
            'pendingPatrons' => LibraryPendingStudent::query()->count()
                + LibraryPendingEmployee::query()->count(),
            'pendingRooms' => LibraryRoomReservation::query()
                ->where('status', 'pending')
                ->count(),
            'outstandingFines' => $this->outstandingFinesCount(),
        ];
    }

    public function outstandingFinesCount(): int
    {
        return LibraryBookLog::query()
            ->where('status', 'Checked In')
            ->where(function ($query) {
                $query->where('fine_balance', '>', 0)
                    ->orWhere(function ($innerQuery) {
                        $innerQuery->whereNull('fine_balance')->where('fine_incurred', '>', 0);
                    });
            })
            ->whereNull('fine_cleared_at')
            ->count();
    }
}
