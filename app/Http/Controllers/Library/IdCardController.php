<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryStudent;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Library\Concerns\ComposesLibraryIdCard;
use ZipArchive;

class IdCardController extends Controller
{
    use ComposesLibraryIdCard;

    public function front($id)
    {
        $student = LibraryStudent::findOrFail($id);
        $img = $this->idCardTemplate('front');

        $this->composeIdCardFront($img, [
            'photo' => $student->profile_picture,
            'full_name' => trim("{$student->firstname} {$student->lastname}"),
            'subtitle' => $student->course,
            'id_number' => $student->id_number,
        ]);

        return $img->response('png');
    }

    public function back($id)
    {
        $student = LibraryStudent::findOrFail($id);
        $img = $this->idCardTemplate('back');

        $this->composeIdCardBack($img, [
            'qrcode' => $student->qrcode,
            'signature' => $student->student_signature,
            'emergency_person' => $student->emergency_person,
            'emergency_relationship' => $student->emergency_relationship,
            'emergency_number' => $student->emergency_number,
            'birth_date' => $student->birthday,
        ]);

        return $img->response('png');
    }

    public function download($id)
    {
        $student = LibraryStudent::findOrFail($id);

        $front = $this->front($id)->getContent();
        $back = $this->back($id)->getContent();

        $zipPath = storage_path("app/temp_id_{$id}.zip");
        $frontPath = storage_path("app/front_{$id}.png");
        $backPath = storage_path("app/back_{$id}.png");

        file_put_contents($frontPath, $front);
        file_put_contents($backPath, $back);

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $zip->addFile($frontPath, "{$student->lastname}_{$student->firstname}_front.png");
            $zip->addFile($backPath, "{$student->lastname}_{$student->firstname}_back.png");
            $zip->close();
        }

        unlink($frontPath);
        unlink($backPath);

        return response()->download($zipPath, "{$student->lastname}_{$student->firstname}_ID.zip")
            ->deleteFileAfterSend(true);
    }
}
