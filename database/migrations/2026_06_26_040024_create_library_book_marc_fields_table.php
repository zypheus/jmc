<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_book_marc_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('library_books')->cascadeOnDelete();
            $table->string('tag', 3);
            $table->string('subfield', 1)->nullable();
            $table->string('indicator1', 1)->nullable();
            $table->string('indicator2', 1)->nullable();
            $table->unsignedInteger('occurrence');
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_book_marc_fields');
    }
};
