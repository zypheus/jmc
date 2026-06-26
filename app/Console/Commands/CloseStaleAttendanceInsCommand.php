<?php

namespace App\Console\Commands;

use App\Domain\Attendance\Services\AttendanceSessionService;
use Illuminate\Console\Command;

class CloseStaleAttendanceInsCommand extends Command
{
    protected $signature = 'attendance:close-stale-ins';

    protected $description = 'Auto OUT for patrons still IN from a prior calendar day (Asia/Manila).';

    public function handle(AttendanceSessionService $sessions): int
    {
        $closed = $sessions->closeAllStaleOpenIns();
        $this->info("Inserted {$closed} automatic end-of-day OUT row(s).");

        return self::SUCCESS;
    }
}
