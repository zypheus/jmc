<?php

namespace App\Domain\Library\Services;

use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryPendingEmployee;
use App\Domain\Library\Models\LibraryPendingStudent;
use App\Domain\Library\Models\LibraryStudent;
use Illuminate\Database\Eloquent\Model;

class LibraryPatronLookupService
{
    public const STATUS_APPROVED_STUDENT = 'approved_student';

    public const STATUS_APPROVED_EMPLOYEE = 'approved_employee';

    public const STATUS_PENDING_STUDENT = 'pending_student';

    public const STATUS_PENDING_EMPLOYEE = 'pending_employee';

    public const STATUS_NOT_FOUND = 'not_found';

    /**
     * @return array{status: string, patron: Model|null}
     */
    public function resolve(string $rawToken): array
    {
        $token = trim($rawToken);

        if ($token === '') {
            return $this->result(self::STATUS_NOT_FOUND);
        }

        $student = $this->findStudent($token);
        if ($student) {
            return $this->result(self::STATUS_APPROVED_STUDENT, $student);
        }

        $employee = $this->findEmployee($token);
        if ($employee) {
            return $this->result(self::STATUS_APPROVED_EMPLOYEE, $employee);
        }

        if ($this->findPendingStudent($token)) {
            return $this->result(self::STATUS_PENDING_STUDENT);
        }

        if ($this->findPendingEmployee($token)) {
            return $this->result(self::STATUS_PENDING_EMPLOYEE);
        }

        return $this->result(self::STATUS_NOT_FOUND);
    }

    private function findStudent(string $token): ?LibraryStudent
    {
        return LibraryStudent::query()
            ->where(function ($q) use ($token) {
                $q->where('qrcode', $token)
                    ->orWhere('id_number', $token)
                    ->orWhereRaw('LOWER(TRIM(id_number)) = ?', [strtolower($token)]);
            })
            ->first();
    }

    private function findEmployee(string $token): ?LibraryEmployee
    {
        return LibraryEmployee::query()
            ->where(function ($q) use ($token) {
                $q->where('qrcode', $token)
                    ->orWhere('employee_id', $token)
                    ->orWhereRaw('LOWER(TRIM(employee_id)) = ?', [strtolower($token)]);
            })
            ->first();
    }

    private function findPendingStudent(string $token): bool
    {
        return LibraryPendingStudent::query()
            ->where(function ($q) use ($token) {
                $q->where('qrcode', $token)
                    ->orWhere('id_number', $token)
                    ->orWhereRaw('LOWER(TRIM(id_number)) = ?', [strtolower($token)]);
            })
            ->exists();
    }

    private function findPendingEmployee(string $token): bool
    {
        return LibraryPendingEmployee::query()
            ->where(function ($q) use ($token) {
                $q->where('qrcode', $token)
                    ->orWhere('employee_id', $token)
                    ->orWhereRaw('LOWER(TRIM(employee_id)) = ?', [strtolower($token)]);
            })
            ->exists();
    }

    /**
     * @return array{status: string, patron: Model|null}
     */
    private function result(string $status, ?Model $patron = null): array
    {
        return [
            'status' => $status,
            'patron' => $patron,
        ];
    }
}
