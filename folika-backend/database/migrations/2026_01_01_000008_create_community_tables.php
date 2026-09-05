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
        Schema::create('forum_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('category', ['crop', 'fish', 'livestock', 'market', 'general', 'official_notice'])->default('general');
            $table->string('title');
            $table->text('body');
            $table->boolean('is_official')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->integer('upvotes')->default(0);
            $table->integer('downvotes')->default(0);
            $table->integer('reply_count')->default(0);
            $table->enum('status', ['active', 'hidden', 'deleted'])->default('active');
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index(['is_official', 'status']);
            $table->fullText(['title', 'body']);
        });

        Schema::create('forum_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('forum_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_expert')->default(false);
            $table->integer('upvotes')->default(0);
            $table->enum('status', ['active', 'hidden', 'deleted'])->default('active');
            $table->timestamps();

            $table->index('post_id');
            $table->index('user_id');
        });

        Schema::create('post_votes', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('post_id')->constrained('forum_posts')->cascadeOnDelete();
            $table->enum('vote_type', ['up', 'down']);
            $table->timestamps();

            $table->primary(['user_id', 'post_id']);
        });

        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->enum('target_type', ['post', 'reply']);
            $table->unsignedBigInteger('target_id');
            $table->enum('reason', ['spam', 'misinformation', 'abusive', 'other'])->default('other');
            $table->text('note')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'actioned'])->default('pending');
            $table->timestamps();

            $table->index('status');
            $table->index(['target_type', 'target_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
        Schema::dropIfExists('post_votes');
        Schema::dropIfExists('forum_replies');
        Schema::dropIfExists('forum_posts');
    }
};
