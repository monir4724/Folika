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
        Schema::create('livestock_breeds_master', function (Blueprint $table) {
            $table->id();
            $table->enum('animal_type', ['cow', 'buffalo', 'goat', 'sheep', 'chicken', 'duck', 'other'])->default('cow');
            $table->string('breed_name');
            $table->enum('purpose', ['meat', 'milk', 'egg', 'dual'])->default('milk');
            $table->string('origin')->nullable();
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();
        });

        Schema::create('livestock_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->enum('shed_shape', ['rectangular', 'L_shape', 'other'])->default('rectangular');
            $table->decimal('shed_length_m', 10, 2)->nullable();
            $table->decimal('shed_width_m', 10, 2)->nullable();
            $table->decimal('shed_area_sqm', 12, 2)->default(0);
            $table->enum('animal_type', ['cow', 'buffalo', 'goat', 'sheep', 'chicken', 'duck', 'other'])->default('cow');
            $table->foreignId('breed_id')->nullable()->constrained('livestock_breeds_master')->nullOnDelete();
            $table->enum('purpose', ['meat', 'milk', 'egg', 'dual'])->default('milk');
            $table->unsignedSmallInteger('animal_count')->default(1);
            $table->unsignedSmallInteger('max_capacity')->default(1);
            $table->unsignedTinyInteger('rearing_months')->default(12);
            $table->string('housing_type')->nullable();
            $table->string('floor_type')->nullable();
            $table->string('ventilation_type')->nullable();
            $table->string('water_supply_type')->nullable();
            $table->string('feed_type')->nullable();
            $table->decimal('daily_feed_kg', 8, 2)->default(0);
            $table->decimal('daily_water_l', 8, 2)->default(0);
            $table->text('supplement_used')->nullable();
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled'])->default('draft');
            $table->decimal('total_cost', 12, 2)->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->decimal('net_profit', 12, 2)->storedAs('total_revenue - total_cost');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index('deleted_at');
        });

        Schema::create('vaccine_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livestock_plan_id')->constrained('livestock_plans')->cascadeOnDelete();
            $table->string('vaccine_name');
            $table->string('vaccine_name_bn');
            $table->string('frequency')->nullable();
            $table->date('due_date');
            $table->timestamp('completed_at')->nullable();
            $table->boolean('reminder_sent')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['due_date', 'reminder_sent']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccine_schedules');
        Schema::dropIfExists('livestock_plans');
        Schema::dropIfExists('livestock_breeds_master');
    }
};
