<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_ebooks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author');
            $table->string('publication_year')->nullable();
            $table->string('publisher')->nullable();
            $table->string('source')->nullable();
            $table->string('link')->nullable();
            $table->foreignId('program_id')->nullable()->constrained('library_programs')->nullOnDelete();
            $table->foreignId('course_id')->nullable()->constrained('library_program_courses')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_ebooks');
    }
};
