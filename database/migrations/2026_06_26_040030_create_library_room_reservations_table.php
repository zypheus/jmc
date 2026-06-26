<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_room_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('library_rooms')->cascadeOnDelete();
            $table->string('status');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('patron_email');
            $table->unsignedTinyInteger('number_of_students');
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_room_reservations');
    }
};
