<?php

namespace App\Domain\Library\Imports;

use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Support\MiddleInitial;
use Maatwebsite\Excel\Concerns\ToModel;

class LibraryStudentsImport implements ToModel
{
    public function model(array $row)
    {
        return new LibraryStudent([
            'id_number' => $row[0] ?? null,
            'lastname' => $row[1] ?? '',
            'firstname' => $row[2] ?? '',
            'middle_initial' => MiddleInitial::normalize($row[3] ?? null),
            'birthday' => $row[4] ?? null,
            'qrcode' => $row[5] ?? null,
            'course' => $row[6] ?? null,
            'year' => $row[7] ?? null,
            'mobile_number' => $row[8] ?? null,
            'address' => $row[9] ?? null,
        ]);
    }
}
