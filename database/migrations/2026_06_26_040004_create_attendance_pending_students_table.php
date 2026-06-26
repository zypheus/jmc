<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Patron fields match attendance_students except system fields:
     * no user_id, qrcode, or normalized_name (qrcode assigned on approval).
     */
    public function up(): void
    {
        Schema::create('attendance_pending_students', function (Blueprint $table) {
            $table->id();
            $table->string('student_id')->nullable();
            $table->string('firstname');
            $table->string('lastname');
            $table->string('middle_initial')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('blood_type', 10)->nullable();
            $table->string('course')->nullable();
            $table->string('year')->nullable();
            $table->string('mobile_number')->nullable();
            $table->string('profile_picture')->nullable();
            $table->string('emergency_person')->nullable();
            $table->string('emergency_relationship')->nullable();
            $table->string('emergency_number')->nullable();
            $table->text('emergency_address')->nullable();
            $table->string('student_signature')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_pending_students');
    }
};
