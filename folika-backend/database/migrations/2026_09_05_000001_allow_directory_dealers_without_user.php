<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dealers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('dealers', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });

        DB::statement('ALTER TABLE dealers MODIFY user_id BIGINT UNSIGNED NULL');

        Schema::table('dealers', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            if (! Schema::hasColumn('dealers', 'owner_name')) {
                $table->string('owner_name')->nullable()->after('shop_name');
            }
            if (! Schema::hasColumn('dealers', 'product_name')) {
                $table->string('product_name')->nullable()->after('owner_name');
            }
            if (! Schema::hasColumn('dealers', 'sector')) {
                $table->string('sector', 32)->nullable()->after('product_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('dealers', function (Blueprint $table) {
            if (Schema::hasColumn('dealers', 'owner_name')) {
                $table->dropColumn(['owner_name', 'product_name', 'sector']);
            }
            $table->dropForeign(['user_id']);
        });
        DB::statement('ALTER TABLE dealers MODIFY user_id BIGINT UNSIGNED NOT NULL');
        Schema::table('dealers', function (Blueprint $table) {
            $table->unique('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
