<?php

namespace Database\Seeders;

use App\Domain\Library\Models\LibraryRoom;
use Illuminate\Database\Seeder;

class LibraryRoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['name' => 'Discussion Room', 'description' => 'For small group discussions and collaboration.', 'capacity' => 8],
            ['name' => 'Audio Visual Room', 'description' => 'For multimedia presentations and class viewing sessions.', 'capacity' => 20],
            ['name' => 'Research Room', 'description' => 'Quiet room for thesis and research consultations.', 'capacity' => 10],
            ['name' => 'Learning Commons Pod', 'description' => 'Open collaborative pod for peer tutoring and review.', 'capacity' => 6],
        ];

        foreach ($rooms as $room) {
            LibraryRoom::query()->updateOrCreate(
                ['name' => $room['name']],
                $room
            );
        }
    }
}
