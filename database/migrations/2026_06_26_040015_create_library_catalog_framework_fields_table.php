<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_catalog_framework_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('framework_id')->constrained('library_catalog_frameworks')->cascadeOnDelete();
            $table->foreignId('marc_field_id')->constrained('library_marc_fields')->cascadeOnDelete();
            $table->boolean('visible');
            $table->boolean('required');
            $table->unsignedInteger('sort_order');
            $table->string('book_column')->nullable();
            $table->string('default_value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_catalog_framework_fields');
    }
};
