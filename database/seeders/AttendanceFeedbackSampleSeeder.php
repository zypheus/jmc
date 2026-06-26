<?php

namespace Database\Seeders;

use App\Domain\Attendance\Models\AttendanceFeedback;
use App\Domain\Attendance\Models\AttendanceStudent;
use Illuminate\Database\Seeder;

class AttendanceFeedbackSampleSeeder extends Seeder
{
    public function run(): void
    {
        $students = AttendanceStudent::query()
            ->whereIn('qrcode', ['AS-00000001', 'AS-00000002', 'AS-00000003', 'AS-00000004', 'AS-00000005'])
            ->orderBy('qrcode')
            ->get();

        if ($students->isEmpty()) {
            return;
        }

        $ratings = ['excellent', 'good', 'medium', 'poor', 'very_bad', 'good', 'excellent'];

        foreach ($ratings as $index => $rating) {
            $student = $students[$index % $students->count()];

            AttendanceFeedback::query()->create([
                'student_id' => $student->id,
                'rating' => $rating,
                'declined' => false,
            ]);
        }
    }
}
