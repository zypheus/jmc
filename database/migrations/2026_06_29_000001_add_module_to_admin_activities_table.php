<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_activities', function (Blueprint $table): void {
            $table->string('module', 32)->default('library')->index()->after('user_id');
        });

        DB::table('admin_activities')->whereNull('module')->update(['module' => 'library']);
    }

    public function down(): void
    {
        Schema::table('admin_activities', function (Blueprint $table): void {
            $table->dropColumn('module');
        });
    }
};
