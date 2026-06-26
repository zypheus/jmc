<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->nullable()->constrained('library_roles')->nullOnDelete();
            $table->string('firstname');
            $table->string('lastname');
            $table->string('middle_initial')->nullable();
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            $table->string('designation')->nullable();
            $table->string('program', 64)->nullable();
            $table->string('year_start_work', 16)->nullable();
            $table->string('employee_id');
            $table->date('birth_date')->nullable();
            $table->string('mobile_number', 32)->nullable();
            $table->string('sex', 20)->nullable();
            $table->string('civil_status', 50)->nullable();
            $table->string('blood_type', 5)->nullable();
            $table->string('tin_id_number')->nullable();
            $table->string('philhealth_number')->nullable();
            $table->string('sss_number')->nullable();
            $table->string('hdmf_number')->nullable();
            $table->string('qrcode')->nullable();
            $table->string('formal_picture')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('emergency_contact_number')->nullable();
            $table->text('emergency_address')->nullable();
            $table->text('address')->nullable();
            $table->string('employee_signature')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_employees');
    }
};
