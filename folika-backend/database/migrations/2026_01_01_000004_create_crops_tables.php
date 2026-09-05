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
        Schema::create('crops_master', function (Blueprint $table) {
            $table->id();
            $table->string('name_bn');
            $table->string('name_en');
            $table->enum('category', ['grain', 'vegetable', 'fruit', 'spice', 'oilseed', 'fiber'])->default('grain');
            $table->json('suitable_aez')->nullable();
            $table->json('suitable_seasons')->nullable();
            $table->decimal('avg_yield_per_bigha', 8, 2)->default(0);
            $table->decimal('avg_price_per_kg', 8, 2)->default(0);
            $table->string('image_url')->nullable();
            $table->timestamps();
        });

        Schema::create('crop_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->enum('land_shape', ['rectangular', 'triangular', 'irregular'])->default('rectangular');
            $table->decimal('land_length_m', 10, 2)->nullable();
            $table->decimal('land_width_m', 10, 2)->nullable();
            $table->decimal('land_area_sqm', 12, 2)->default(0);
            $table->decimal('land_area_bigha', 10, 2)->default(0);
            $table->decimal('land_area_shatok', 10, 2)->default(0);
            $table->foreignId('crop_id')->constrained('crops_master')->cascadeOnDelete();
            $table->enum('season', ['rabi', 'kharif_1', 'kharif_2', 'year_round'])->default('rabi');
            $table->foreignId('previous_crop_id')->nullable()->constrained('crops_master')->nullOnDelete();
            $table->string('soil_type')->nullable();
            $table->string('tillage_method')->nullable();
            $table->text('organic_fertilizer')->nullable();
            $table->text('chemical_fertilizer')->nullable();
            $table->string('sowing_method')->nullable();
            $table->decimal('row_spacing_cm', 6, 2)->nullable();
            $table->decimal('plant_spacing_cm', 6, 2)->nullable();
            $table->decimal('sowing_depth_cm', 6, 2)->nullable();
            $table->date('sowing_date')->nullable();
            $table->date('expected_harvest_date')->nullable();
            $table->text('irrigation_notes')->nullable();
            $table->text('ai_rotation_note')->nullable();
            $table->json('weather_cache')->nullable();
            $table->enum('status', ['draft', 'active', 'harvested', 'cancelled'])->default('draft');
            $table->decimal('total_cost', 12, 2)->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->decimal('net_profit', 12, 2)->storedAs('total_revenue - total_cost');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index('deleted_at');
        });

        Schema::create('crop_cost_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_plan_id')->constrained('crop_plans')->cascadeOnDelete();
            $table->enum('item_type', ['input', 'labor', 'irrigation', 'transport', 'other'])->default('input');
            $table->string('item_name');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit')->default('কেজি');
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->timestamps();

            $table->index('crop_plan_id');
        });

        Schema::create('crop_revenue_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_plan_id')->constrained('crop_plans')->cascadeOnDelete();
            $table->string('item_name');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit')->default('কেজি');
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->timestamps();

            $table->index('crop_plan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crop_revenue_items');
        Schema::dropIfExists('crop_cost_items');
        Schema::dropIfExists('crop_plans');
        Schema::dropIfExists('crops_master');
    }
};
