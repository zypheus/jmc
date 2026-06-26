<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_fine_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('fine_per_day', 8, 2);
            $table->decimal('max_fine', 8, 2)->nullable();
            $table->integer('grace_period_days');
            $table->integer('loan_duration_days');
            $table->date('effective_from');
            $table->decimal('student_fine_per_day', 8, 2)->nullable();
            $table->decimal('student_max_fine', 8, 2)->nullable();
            $table->unsignedInteger('student_grace_period_days')->nullable();
            $table->unsignedInteger('student_loan_duration_days')->nullable();
            $table->decimal('employee_fine_per_day', 8, 2)->nullable();
            $table->decimal('employee_max_fine', 8, 2)->nullable();
            $table->unsignedInteger('employee_grace_period_days')->nullable();
            $table->unsignedInteger('employee_loan_duration_days')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_fine_settings');
    }
};
