<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_reservation_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('library_room_reservations')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('library_reservation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('library_room_reservations')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('library_feedback', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->text('comments');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_feedback');
        Schema::dropIfExists('library_reservation_logs');
        Schema::dropIfExists('library_reservation_students');
    }
};
