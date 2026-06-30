<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_employee_edit_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('library_employees')->cascadeOnDelete();
            $table->string('lastname')->nullable();
            $table->string('firstname')->nullable();
            $table->string('middle_initial')->nullable();
            $table->string('employee_id_value')->nullable();
            $table->string('designation')->nullable();
            $table->string('program')->nullable();
            $table->string('year_start_work')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('mobile_number')->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('emergency_contact_number')->nullable();
            $table->text('emergency_address')->nullable();
            $table->string('formal_picture')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected']);
            $table->text('admin_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_employee_edit_requests');
    }
};
