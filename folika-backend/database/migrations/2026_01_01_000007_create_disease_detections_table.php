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
        Schema::create('disease_detections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('category', ['crop', 'fish', 'livestock'])->default('crop');
            $table->string('image_url');
            $table->unsignedInteger('image_size_kb')->nullable();
            $table->json('symptoms_json')->nullable();
            $table->json('ai_result_json')->nullable();
            $table->string('disease_name')->nullable();
            $table->decimal('confidence_pct', 5, 2)->nullable();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->nullable();
            $table->text('treatment_notes')->nullable();
            $table->enum('status', ['pending', 'analyzed', 'failed', 'offline_queued'])->default('pending');
            $table->timestamp('analyzed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disease_detections');
    }
};
