<?php

namespace App\Domain\Library\Support;

use Illuminate\Support\Facades\File;

class PublicStoragePublisher
{
    public static function storageRoot(): string
    {
        return storage_path('app/public');
    }

    public static function publicRoot(): string
    {
        return public_path('storage');
    }

    /**
     * True when public/storage already points at storage/app/public (symlink).
     */
    public static function isLinked(): bool
    {
        $link = self::publicRoot();
        $root = self::storageRoot();

        if (! file_exists($link)) {
            return false;
        }

        if (is_link($link)) {
            return realpath($link) === realpath($root);
        }

        return is_dir($link) && realpath($link) === realpath($root);
    }

    /**
     * Try symlink() only — no exec() (works on some hosts; disabled on many shared plans).
     */
    public static function trySymlink(): bool
    {
        if (self::isLinked() || file_exists(self::publicRoot())) {
            return self::isLinked();
        }

        if (! function_exists('symlink')) {
            return false;
        }

        try {
            return @symlink(self::storageRoot(), self::publicRoot());
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Mirror one file so asset('storage/...') works without a symlink.
     */
    public static function publish(string $relativePath): string
    {
        $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
        $source = self::storageRoot().'/'.$relativePath;

        if (! is_file($source)) {
            throw new \RuntimeException("File not found on public disk: {$relativePath}");
        }

        self::trySymlink();

        if (self::isLinked()) {
            return $relativePath;
        }

        $target = self::publicRoot().'/'.$relativePath;
        $dir = dirname($target);
        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        if (! is_file($target) || filesize($target) !== filesize($source) || filemtime($target) < filemtime($source)) {
            File::copy($source, $target);
        }

        return $relativePath;
    }

    /**
     * Copy everything under storage/app/public into public/storage (for Hostinger / no symlink).
     */
    public static function publishAll(): int
    {
        self::trySymlink();
        if (self::isLinked()) {
            return 0;
        }

        $root = self::storageRoot();
        if (! is_dir($root)) {
            return 0;
        }

        $count = 0;
        foreach (File::allFiles($root) as $file) {
            $relative = str_replace('\\', '/', substr($file->getPathname(), strlen($root) + 1));
            self::publish($relative);
            $count++;
        }

        return $count;
    }
}
