<?php

namespace App\Domain\Attendance\Support;

use Illuminate\Http\UploadedFile;

class AttendanceFileStorage
{
    public static function storeImage(UploadedFile $file, string $directory): string
    {
        $filename = time().'_'.preg_replace('/\s+/', '_', $file->getClientOriginalName());
        $path = base_path($directory);

        if (! is_dir($path)) {
            mkdir($path, 0755, true);
        }

        $file->move($path, $filename);

        return $directory.'/'.$filename;
    }

    public static function storeBase64Signature(?string $dataUrl, string $directory, string $prefix = 'sig'): ?string
    {
        if (empty($dataUrl) || ! str_starts_with($dataUrl, 'data:')) {
            return null;
        }

        [$meta, $contents] = explode(',', $dataUrl, 2);
        $ext = preg_match('/data:image\/(jpeg|jpg)/i', $meta) ? 'jpg' : 'png';
        $filename = time()."_{$prefix}.{$ext}";
        $path = base_path($directory);

        if (! is_dir($path)) {
            mkdir($path, 0755, true);
        }

        file_put_contents($path.'/'.$filename, base64_decode($contents));

        return $directory.'/'.$filename;
    }
}
