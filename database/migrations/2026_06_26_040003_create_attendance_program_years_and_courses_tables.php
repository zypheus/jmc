<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_program_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('attendance_programs')->cascadeOnDelete();
            $table->unsignedTinyInteger('year_level');
            $table->timestamps();

            $table->unique(['program_id', 'year_level']);
        });

        Schema::create('attendance_program_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_year_id')->constrained('attendance_program_years')->cascadeOnDelete();
            $table->string('course_code', 20);
            $table->string('course_name');
            $table->timestamps();

            $table->unique(['program_year_id', 'course_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_program_courses');
        Schema::dropIfExists('attendance_program_years');
    }
};
