const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../js/dealers-kaliakoir.js', 'utf8');
const arr = JSON.parse(src.replace(/^[\s\S]*?=/, '').replace(/;\s*$/, ''));

function esc(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

const rows = arr.map((d, i) => {
  const id = i + 2;
  return `            [
                'id' => ${id},
                'user_id' => null,
                'shop_name' => '${esc(d.shop)}',
                'shop_type' => 'general',
                'owner_name' => '${esc(d.name)}',
                'product_name' => '${esc(d.product)}',
                'sector' => '${esc(d.sector)}',
                'address' => '${esc(d.location)}',
                'upazila_id' => 28,
                'phone' => '${esc(d.phone)}',
                'avg_rating' => 0,
                'review_count' => 0,
                'is_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]`;
}).join(',\n');

const php = `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\DB;

class KaliakoirDealersSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
${rows}
        ];

        DB::table('dealers')->upsert($rows, ['id'], [
            'user_id', 'shop_name', 'shop_type', 'owner_name', 'product_name', 'sector',
            'address', 'upazila_id', 'phone', 'avg_rating', 'review_count', 'is_verified',
        ]);
    }
}
`;

fs.writeFileSync(__dirname + '/../folika-backend/database/seeders/KaliakoirDealersSeeder.php', php);
console.log('seeded rows', arr.length);
