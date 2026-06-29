<?php

declare(strict_types=1);

namespace App\Services\Shared;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

final class SmsModemService
{
    /** @param  list<array{number: string, message: string}>  $payload */
    public function send(array $payload): ?Response
    {
        $url = config('services.sms_modem.url');
        $apiKey = config('services.sms_modem.key');

        if (! is_string($url) || $url === '' || ! is_string($apiKey) || $apiKey === '') {
            return null;
        }

        try {
            return Http::withHeaders([
                'X-API-KEY' => $apiKey,
                'Accept' => 'application/json',
            ])->asJson()->timeout(30)->post($url, $payload);
        } catch (\Throwable $exception) {
            report($exception);

            return null;
        }
    }

    public function normalizePhilippineMobile(string $number): string
    {
        $number = preg_replace('/\s+/', '', trim($number)) ?? '';

        if ($number === '') {
            return '';
        }

        if (str_starts_with($number, '0')) {
            return '+63'.substr($number, 1);
        }

        if (str_starts_with($number, '63')) {
            return '+'.$number;
        }

        return $number;
    }
}
