<?php

namespace Database\Seeders;

use App\Domain\Library\Models\LibraryRole;
use Illuminate\Database\Seeder;

class LibraryRoleSeeder extends Seeder
{
    public function run(): void
    {
        LibraryRole::query()->updateOrCreate(
            ['id' => 1],
            ['description' => 'student']
        );

        LibraryRole::query()->updateOrCreate(
            ['id' => 2],
            ['description' => 'faculty']
        );
    }
}
