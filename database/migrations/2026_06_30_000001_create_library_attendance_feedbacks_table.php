<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_attendance_feedbacks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->string('rating')->nullable();
            $table->boolean('declined')->default(false);
            $table->timestamps();

            $table->index('student_id');
            $table->index(['rating', 'declined']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_attendance_feedbacks');
    }
};
