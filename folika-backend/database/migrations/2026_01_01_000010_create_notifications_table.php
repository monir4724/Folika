<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['vaccine_reminder', 'plan_reminder', 'weather_alert', 'disease_result', 'market_update', 'community', 'system'])->default('system');
            $table->enum('channel', ['push', 'sms', 'both'])->default('both');
            $table->string('title');
            $table->text('body');
            $table->json('data_json')->nullable();
            $table->string('fcm_token')->nullable();
            $table->string('mobile', 20)->nullable();
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->timestamp('scheduled_at')->useCurrent();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'scheduled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_queue');
    }
};
