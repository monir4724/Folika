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
        Schema::create('market_prices', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->enum('category', ['crop', 'fish', 'livestock', 'input'])->default('crop');
            $table->foreignId('district_id')->constrained('districts')->cascadeOnDelete();
            $table->decimal('price_per_kg', 8, 2);
            $table->enum('source', ['dam_api', 'admin_verified', 'community'])->default('community');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('verified')->default(false);
            $table->date('recorded_at');
            $table->timestamps();

            $table->index(['product_name', 'district_id', 'recorded_at']);
        });

        Schema::create('dealers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('shop_name');
            $table->enum('shop_type', ['seed', 'fertilizer', 'pesticide', 'equipment', 'general'])->default('general');
            $table->text('address');
            $table->foreignId('upazila_id')->constrained('upazilas')->cascadeOnDelete();
            $table->string('phone', 20);
            $table->decimal('avg_rating', 3, 2)->default(0.00);
            $table->integer('review_count')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->index('upazila_id');
            $table->index('shop_type');
        });

        Schema::create('dealer_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dealer_id')->constrained('dealers')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['dealer_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dealer_reviews');
        Schema::dropIfExists('dealers');
        Schema::dropIfExists('market_prices');
    }
};
