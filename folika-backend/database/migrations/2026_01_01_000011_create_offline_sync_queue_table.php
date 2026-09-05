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
        Schema::create('offline_sync_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('action_type', [
                'create_crop_plan',
                'create_fish_plan',
                'create_livestock_plan',
                'create_post',
                'create_reply',
                'disease_detection'
            ]);
            $table->json('payload_json');
            $table->enum('status', ['pending', 'synced', 'failed'])->default('pending');
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offline_sync_queue');
    }
};
