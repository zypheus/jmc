<?php

namespace App\Domain\Library\Services;

use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryStudent;
use RuntimeException;

class OpacPatronResolver
{
    public function __construct(private readonly LibraryPatronLookupService $lookup) {}

    public function resolve(string $token): LibraryStudent|LibraryEmployee
    {
        $result = $this->lookup->resolve($token);

        if ($result['patron'] instanceof LibraryStudent || $result['patron'] instanceof LibraryEmployee) {
            return $result['patron'];
        }

        if (in_array($result['status'], [
            LibraryPatronLookupService::STATUS_PENDING_STUDENT,
            LibraryPatronLookupService::STATUS_PENDING_EMPLOYEE,
        ], true)) {
            throw new RuntimeException('This library registration is still pending approval.');
        }

        throw new RuntimeException('Patron ID or QR code was not found.');
    }

    /**
     * @return array{type: string, name: string, identifier: string|null, course: string|null, department: string|null}
     */
    public function serialize(LibraryStudent|LibraryEmployee $patron): array
    {
        $isStudent = $patron instanceof LibraryStudent;

        return [
            'type' => $isStudent ? 'student' : 'employee',
            'name' => trim("{$patron->lastname}, {$patron->firstname}"),
            'identifier' => $isStudent ? $patron->id_number : $patron->employee_id,
            'course' => $isStudent ? $patron->course : null,
            'department' => $patron instanceof LibraryEmployee ? $patron->department : null,
        ];
    }
}
