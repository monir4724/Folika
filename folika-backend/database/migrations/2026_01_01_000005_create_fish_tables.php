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
        Schema::create('fish_species_master', function (Blueprint $table) {
            $table->id();
            $table->string('name_bn');
            $table->string('name_en');
            $table->enum('water_layer', ['surface', 'middle', 'bottom'])->default('surface');
            $table->decimal('min_depth_m', 4, 2)->default(1.5);
            $table->unsignedTinyInteger('growth_months')->default(6);
            $table->decimal('avg_weight_kg', 6, 2)->default(1.0);
            $table->decimal('avg_price_per_kg', 8, 2)->default(200);
            $table->decimal('feed_rate_pct', 5, 2)->default(3.0);
            $table->enum('disease_risk', ['low', 'medium', 'high'])->default('medium');
            $table->json('suitable_aez')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();
        });

        Schema::create('fish_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('pond_length_m', 10, 2)->nullable();
            $table->decimal('pond_width_m', 10, 2)->nullable();
            $table->decimal('pond_depth_m', 6, 2)->nullable();
            $table->decimal('pond_area_sqm', 12, 2)->default(0);
            $table->decimal('pond_volume_m3', 12, 2)->default(0);
            $table->text('location_desc')->nullable();
            $table->unsignedTinyInteger('culture_duration_months')->default(12);
            $table->decimal('lime_kg', 8, 2)->default(0);
            $table->decimal('organic_fertilizer_kg', 8, 2)->default(0);
            $table->boolean('probiotic_used')->default(false);
            $table->boolean('oxygen_checked')->default(false);
            $table->string('nearest_supplier')->nullable();
            $table->enum('status', ['draft', 'active', 'harvested', 'cancelled'])->default('draft');
            $table->decimal('total_cost', 12, 2)->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->decimal('net_profit', 12, 2)->storedAs('total_revenue - total_cost');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index('deleted_at');
        });

        Schema::create('fish_species_selections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fish_plan_id')->constrained('fish_plans')->cascadeOnDelete();
            $table->foreignId('species_id')->constrained('fish_species_master')->cascadeOnDelete();
            $table->enum('water_layer', ['surface', 'middle', 'bottom'])->default('surface');
            $table->integer('quantity')->default(0);
            $table->decimal('stocking_density_per_sqm', 6, 2)->nullable();
            $table->timestamps();

            $table->index('fish_plan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fish_species_selections');
        Schema::dropIfExists('fish_plans');
        Schema::dropIfExists('fish_species_master');
    }
};
