<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 64)->index();
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('action_url', 2048)->nullable();
            $table->string('icon', 32)->default('info');
            $table->nullableMorphs('subject');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('activity_last_seen_at')->nullable()->after('remember_token');
            $table->timestamp('notification_last_seen_at')->nullable()->after('activity_last_seen_at');
            $table->string('profile_picture', 512)->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'activity_last_seen_at',
                'notification_last_seen_at',
                'profile_picture',
            ]);
        });

        Schema::dropIfExists('admin_activities');
    }
};
