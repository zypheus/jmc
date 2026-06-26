<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_program_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('library_programs')->cascadeOnDelete();
            $table->unsignedTinyInteger('year_level');
            $table->string('course_code', 20);
            $table->string('course_name');
            $table->timestamps();

            $table->unique(['program_id', 'year_level', 'course_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_program_courses');
    }
};
