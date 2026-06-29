<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('library_pending_students', function (Blueprint $table) {
            $table->string('email')->nullable()->after('mobile_number');
        });

        Schema::table('library_students', function (Blueprint $table) {
            $table->string('email')->nullable()->after('mobile_number');
        });
    }

    public function down(): void
    {
        Schema::table('library_pending_students', function (Blueprint $table) {
            $table->dropColumn('email');
        });

        Schema::table('library_students', function (Blueprint $table) {
            $table->dropColumn('email');
        });
    }
};
