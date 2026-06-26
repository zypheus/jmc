<?php

namespace Database\Seeders;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryStudent;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LibraryCirculationSampleSeeder extends Seeder
{
    private const STUDENT_QR_1 = 'S-00000001';

    private const STUDENT_QR_2 = 'S-00000002';

    private const BOOK_ACC_1 = 'GG-2024-0001';

    private const BOOK_ACC_2 = 'GG-2024-0002';

    private const BOOK_ACC_3 = 'GG-2024-0003';

    public function run(): void
    {
        DB::transaction(function (): void {
            $student1 = LibraryStudent::query()->where('qrcode', self::STUDENT_QR_1)->first();
            $student2 = LibraryStudent::query()->where('qrcode', self::STUDENT_QR_2)->first();
            $book1 = LibraryBook::query()->where('accession_no', self::BOOK_ACC_1)->first();
            $book2 = LibraryBook::query()->where('accession_no', self::BOOK_ACC_2)->first();
            $book3 = LibraryBook::query()->where('accession_no', self::BOOK_ACC_3)->first();

            if (! $student1 || ! $student2 || ! $book1 || ! $book2 || ! $book3) {
                return;
            }

            LibraryBookLog::query()->updateOrCreate(
                ['book_id' => $book1->id, 'student_id' => $student1->id, 'status' => 'Checked Out'],
                [
                    'patron_name' => "{$student1->lastname}, {$student1->firstname}",
                    'circulation_type' => LibraryBookLog::CIRCULATION_CHECKOUT,
                    'renew_count' => 0,
                    'timestamp' => Carbon::now('Asia/Manila')->subDays(12),
                    'due_date' => Carbon::now('Asia/Manila')->subDays(3)->toDateString(),
                    'returned_date' => null,
                    'fine_incurred' => 0,
                ]
            );
            $book1->update(['availability' => 'Borrowed']);

            LibraryBookLog::query()->updateOrCreate(
                ['book_id' => $book2->id, 'student_id' => $student1->id, 'status' => 'Checked Out'],
                [
                    'patron_name' => "{$student1->lastname}, {$student1->firstname}",
                    'circulation_type' => LibraryBookLog::CIRCULATION_CHECKOUT,
                    'renew_count' => 2,
                    'last_renewed_at' => Carbon::now('Asia/Manila')->subDays(1),
                    'timestamp' => Carbon::now('Asia/Manila')->subDays(5),
                    'due_date' => Carbon::now('Asia/Manila')->addDays(5)->toDateString(),
                    'returned_date' => null,
                    'fine_incurred' => 0,
                ]
            );
            $book2->update(['availability' => 'Borrowed']);

            LibraryBookLog::query()->updateOrCreate(
                ['book_id' => $book3->id, 'student_id' => $student2->id, 'status' => 'Checked Out'],
                [
                    'patron_name' => "{$student2->lastname}, {$student2->firstname}",
                    'circulation_type' => LibraryBookLog::CIRCULATION_ROOM_USE,
                    'renew_count' => 0,
                    'timestamp' => Carbon::now('Asia/Manila')->subHours(2),
                    'due_date' => null,
                    'returned_date' => null,
                    'fine_incurred' => 0,
                ]
            );
            $book3->update(['availability' => 'Borrowed']);

            LibraryBookLog::query()->updateOrCreate(
                [
                    'book_id' => $book2->id,
                    'student_id' => $student2->id,
                    'status' => 'Checked In',
                    'returned_date' => Carbon::now('Asia/Manila')->subDays(2),
                ],
                [
                    'patron_name' => "{$student2->lastname}, {$student2->firstname}",
                    'circulation_type' => LibraryBookLog::CIRCULATION_CHECKOUT,
                    'renew_count' => 1,
                    'timestamp' => Carbon::now('Asia/Manila')->subDays(9),
                    'due_date' => Carbon::now('Asia/Manila')->subDays(4)->toDateString(),
                    'fine_incurred' => 0,
                ]
            );
        });
    }
}
