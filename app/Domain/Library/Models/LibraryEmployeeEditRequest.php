<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryEmployeeEditRequest extends Model
{
    protected $table = 'library_employee_edit_requests';

    protected $fillable = [
        'employee_id',
        'lastname',
        'firstname',
        'middle_initial',
        'employee_id_value',
        'designation',
        'program',
        'year_start_work',
        'birth_date',
        'mobile_number',
        'address',
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_number',
        'emergency_address',
        'formal_picture',
        'status',
        'admin_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(LibraryEmployee::class, 'employee_id');
    }
}
