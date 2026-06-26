<?php

namespace App\Domain\Library\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LibraryFileStorage
{
    public static function storeUploaded(UploadedFile $file, string $directory): string
    {
        $filename = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();

        $path = $file->storeAs(trim($directory, '/'), $filename, 'public');
        PublicStoragePublisher::publish($path);

        return $path;
    }

    public static function storeBase64Signature(?string $dataUrl, string $directory): ?string
    {
        if (! filled($dataUrl) || ! str_starts_with($dataUrl, 'data:image')) {
            return null;
        }

        [$meta, $content] = explode(',', $dataUrl, 2);
        $extension = str_contains($meta, 'png') ? 'png' : 'jpg';
        $filename = Str::uuid()->toString().'.'.$extension;
        $path = trim($directory, '/').'/'.$filename;

        Storage::disk('public')->put($path, base64_decode($content));
        PublicStoragePublisher::publish($path);

        return $path;
    }
}
