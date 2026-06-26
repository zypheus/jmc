<?php

namespace App\Http\Controllers\Library\Concerns;

use App\Domain\Library\Support\PublicAssetPath;
use Carbon\Carbon;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

trait ComposesLibraryIdCard
{
    protected function idCardImageManager(): ImageManager
    {
        return new ImageManager(new Driver);
    }

    protected function idCardTemplate(string $side): ImageInterface
    {
        $path = PublicAssetPath::resolve("images/id_templates/{$side}.png")
            ?? base_path("images/id_templates/{$side}.png");

        return $this->idCardImageManager()->read($path);
    }

    protected function drawIdCardText(ImageInterface $img, string $text, int $x, int $y, int $size, string $color = '#000', string $align = 'center', string $valign = 'top'): void
    {
        $fontPathBold = public_path('fonts/arialbd.ttf');
        $fontPathRegular = public_path('fonts/arial.ttf');
        $fontPath = file_exists($fontPathBold) ? $fontPathBold : $fontPathRegular;

        $img->text($text, $x, $y, function ($font) use ($fontPath, $size, $color, $align, $valign) {
            $font->filename($fontPath);
            $font->size($size);
            $font->color($color);
            $font->align($align);
            $font->valign($valign);
        });
    }

    /**
     * @param  array{photo:?string,full_name:string,subtitle:?string,id_number:?string}  $data
     */
    protected function composeIdCardFront(ImageInterface $img, array $data): ImageInterface
    {
        $manager = $this->idCardImageManager();
        $photoPath = PublicAssetPath::resolve($data['photo'] ?? null);
        if ($photoPath) {
            $profile = $manager->read($photoPath)->scale(1045, 1045);
            $img->place($profile, 'center', 5, -390);
        }

        $this->drawIdCardText($img, $data['full_name'], 1100, 2090, 150);

        if (! empty($data['subtitle'])) {
            $this->drawIdCardText($img, trim($data['subtitle']), 1100, 2355, 150);
        }

        if (! empty($data['id_number'])) {
            $this->drawIdCardText($img, trim($data['id_number']), 1090, 1890, 100);
        }

        return $img;
    }

    /**
     * @param  array{
     *     qrcode:string,
     *     signature:?string,
     *     emergency_person:?string,
     *     emergency_relationship:?string,
     *     emergency_number:?string,
     *     birth_date:?string
     * }  $data
     */
    protected function composeIdCardBack(ImageInterface $img, array $data): ImageInterface
    {
        $manager = $this->idCardImageManager();

        $qrPng = QrCode::format('png')
            ->size(900)
            ->margin(0)
            ->generate($data['qrcode']);
        $qrImage = $manager->read((string) $qrPng);
        $img->place($qrImage, 'top-left', 655, 435);

        $signaturePath = PublicAssetPath::resolve($data['signature'] ?? null);
        if ($signaturePath) {
            $signature = $manager->read($signaturePath)->scale(500, 600);
            $img->place($signature, 'center', -30, 1200);
        }

        if (! empty($data['emergency_person'])) {
            $this->drawIdCardText($img, $data['emergency_person'], 1100, 1650, 100);
        }
        if (! empty($data['emergency_relationship'])) {
            $this->drawIdCardText($img, $data['emergency_relationship'], 1100, 1750, 100);
        }
        if (! empty($data['emergency_number'])) {
            $this->drawIdCardText($img, $data['emergency_number'], 1100, 1850, 100);
        }

        if (! empty($data['birth_date'])) {
            $formattedDate = Carbon::parse($data['birth_date'])->format('m-d-Y');
            $this->drawIdCardText($img, $formattedDate, 3000, 800, 300);
        }

        return $img;
    }
}
