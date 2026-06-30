<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('library_book_reservations', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
        });

        Schema::table('library_book_reservations', function (Blueprint $table) {
            $table->foreignId('student_id')->nullable()->change();
            $table->foreignId('employee_id')
                ->nullable()
                ->after('student_id')
                ->constrained('library_employees')
                ->cascadeOnDelete();
            $table->timestamp('ready_notified_at')->nullable()->after('ready_at');

            $table->foreign('student_id')->references('id')->on('library_students')->cascadeOnDelete();
            $table->index(['employee_id', 'status']);
        });
    }

    public function down(): void
    {
        DB::table('library_book_reservations')->whereNull('student_id')->delete();

        Schema::table('library_book_reservations', function (Blueprint $table) {
            $table->dropIndex(['employee_id', 'status']);
            $table->dropForeign(['employee_id']);
            $table->dropForeign(['student_id']);
            $table->dropColumn(['employee_id', 'ready_notified_at']);
        });

        Schema::table('library_book_reservations', function (Blueprint $table) {
            $table->foreignId('student_id')->nullable(false)->change();
            $table->foreign('student_id')->references('id')->on('library_students')->cascadeOnDelete();
        });
    }
};
