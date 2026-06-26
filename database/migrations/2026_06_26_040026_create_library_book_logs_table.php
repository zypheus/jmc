<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_book_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('library_books')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('library_students')->nullOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained('library_employees')->nullOnDelete();
            $table->string('patron_name')->nullable();
            $table->string('status');
            $table->string('circulation_type', 20);
            $table->unsignedTinyInteger('renew_count');
            $table->dateTime('last_renewed_at')->nullable();
            $table->dateTime('timestamp')->nullable();
            $table->date('due_date')->nullable();
            $table->dateTime('returned_date')->nullable();
            $table->decimal('fine_incurred', 8, 2)->nullable();
            $table->decimal('fine_original', 8, 2)->nullable();
            $table->decimal('fine_balance', 8, 2)->nullable();
            $table->decimal('fine_paid_total', 8, 2)->nullable();
            $table->decimal('fine_waived_total', 8, 2)->nullable();
            $table->timestamp('fine_cleared_at')->nullable();
            $table->string('fine_clearance_type', 32)->nullable();
            $table->text('fine_clearance_note')->nullable();
            $table->foreignId('fine_cleared_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_book_logs');
    }
};
