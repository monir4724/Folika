<?php

namespace App\Console\Commands;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RunE2EVerification extends Command
{
    protected $signature = 'folika:e2e {--save : Save the report to storage/app/folika-e2e-report.md}';

    protected $description = 'Create/verify the "Monir" test user and run an end-to-end check across every FOLIKA API domain.';

    protected array $results = [];

    public function handle(): int
    {
        $this->line('');
        $this->info('===============================================================');
        $this->info('  FOLIKA (ফলিকা) — এন্ড-টু-এন্ড যাচাইকরণ | End-to-End Verification');
        $this->info('===============================================================');
        $this->line('');

        // 1. Ensure master data is present
        if (DB::table('crops_master')->count() === 0) {
            $this->warn('Master data missing — running seeders first...');
            $this->call('db:seed', ['--force' => true]);
        }

        // 2. Create / verify the Monir test user (full-access farmer account)
        $monir = $this->ensureMonir();
        $this->line("👤  টেস্ট ইউজার: <fg=yellow>{$monir->name}</> (মোবাইল: {$monir->mobile}, রোল: {$monir->role})");
        $this->line('');

        // 3. Auth flow (OTP send + verify) then use the issued token
        $token = $this->verifyAuthFlow($monir);
        if (!$token) {
            $this->error('OTP অথেন্টিকেশন ব্যর্থ — টোকেন সরাসরি তৈরি করা হচ্ছে (fallback).');
            $token = $monir->createToken('e2e-fallback', ['*'])->plainTextToken;
        }

        // 4. Walk every domain
        $this->section('সিস্টেম ও কনফিগ | System & Config');
        $this->check('GET  /api/health', 'GET', '/api/health', null, null, 200);
        $this->check('GET  /api/config (Google Maps key exposed)', 'GET', '/api/config', null, null, 200, function ($json) {
            return !empty($json['data']['google_maps_api_key']);
        });

        $this->section('ব্যবহারকারী | User Profile');
        $this->check('GET  /api/user/profile', 'GET', '/api/user/profile', null, $token, 200);
        $this->check('GET  /api/user/summary', 'GET', '/api/user/summary', null, $token, 200);

        $this->section('অবস্থান | Location (public)');
        $this->check('GET  /api/location/divisions', 'GET', '/api/location/divisions', null, null, 200);

        $this->section('আবহাওয়া | Weather (OpenWeather + fallback)');
        $this->check('GET  /api/weather/current', 'GET', '/api/weather/current', null, $token, 200);
        $this->check('GET  /api/weather/forecast', 'GET', '/api/weather/forecast', null, $token, 200);
        $this->check('GET  /api/weather/alerts', 'GET', '/api/weather/alerts', null, $token, 200);

        $this->section('ফসল | Crop Planning');
        $this->check('GET  /api/crops/master', 'GET', '/api/crops/master', null, $token, 200);
        $cropPlanId = null;
        $this->check('POST /api/crops/plans (auto area calc)', 'POST', '/api/crops/plans', [
            'name' => 'E2E আমন জমি',
            'land_shape' => 'rectangular',
            'land_length_m' => 40,
            'land_width_m' => 30,
            'crop_id' => 1,
            'season' => 'kharif_2',
            'soil_type' => 'দোআঁশ',
        ], $token, 201, function ($json) use (&$cropPlanId) {
            $cropPlanId = $json['data']['id'] ?? null;
            return ($json['data']['land_area_sqm'] ?? 0) == 1200;
        });
        if ($cropPlanId) {
            $this->check('POST cost item', 'POST', "/api/crops/plans/{$cropPlanId}/costs", [
                'item_type' => 'input', 'item_name' => 'ইউরিয়া', 'quantity' => 20, 'unit' => 'কেজি', 'unit_price' => 27,
            ], $token, 201);
            $this->check('POST revenue item', 'POST', "/api/crops/plans/{$cropPlanId}/revenues", [
                'item_name' => 'ধান বিক্রি', 'quantity' => 100, 'unit' => 'কেজি', 'unit_price' => 38,
            ], $token, 201);
            $this->check('GET plan (net_profit generated col)', 'GET', "/api/crops/plans/{$cropPlanId}", null, $token, 200, function ($json) {
                return ($json['data']['net_profit'] ?? null) == 3260;
            });
        }

        $this->section('মৎস্য | Fish Planning');
        $this->check('GET  /api/fish/species', 'GET', '/api/fish/species', null, $token, 200);
        $this->check('POST /api/fish/calculate-layers', 'POST', '/api/fish/calculate-layers', [
            'pond_depth_m' => 1.8, 'pond_area_sqm' => 400,
        ], $token, 200);
        $fishPlanId = null;
        $this->check('POST /api/fish/plans', 'POST', '/api/fish/plans', [
            'name' => 'E2E পুকুর', 'pond_length_m' => 20, 'pond_width_m' => 15, 'pond_depth_m' => 1.5, 'culture_duration_months' => 12,
        ], $token, 201, function ($json) use (&$fishPlanId) {
            $fishPlanId = $json['data']['id'] ?? null;
            return true;
        });
        if ($fishPlanId) {
            $this->check('POST fish species selection', 'POST', "/api/fish/plans/{$fishPlanId}/species", [
                'species_id' => 1, 'water_layer' => 'surface', 'quantity' => 100,
            ], $token, 201);
        }

        $this->section('প্রাণিসম্পদ | Livestock');
        $this->check('GET  /api/livestock/breeds', 'GET', '/api/livestock/breeds', null, $token, 200);
        $this->check('POST /api/livestock/capacity-check', 'POST', '/api/livestock/capacity-check', [
            'animal_type' => 'cow', 'shed_area_sqm' => 40, 'animal_count' => 8,
        ], $token, 200);
        $lsPlanId = null;
        $this->check('POST /api/livestock/plans', 'POST', '/api/livestock/plans', [
            'name' => 'E2E ডেইরি শেড', 'shed_length_m' => 10, 'shed_width_m' => 4,
            'animal_type' => 'cow', 'purpose' => 'milk', 'animal_count' => 6,
        ], $token, 201, function ($json) use (&$lsPlanId) {
            $lsPlanId = $json['data']['id'] ?? null;
            return true;
        });
        if ($lsPlanId) {
            $this->check('GET auto-generated vaccines', 'GET', "/api/livestock/plans/{$lsPlanId}/vaccines", null, $token, 200);
        }

        $this->section('রোগ নির্ণয় | Disease Detection (Gemini + fallback)');
        $this->check('POST /api/disease/analyze', 'POST', '/api/disease/analyze', [
            'category' => 'crop',
            'image_url' => 'assets/images/sample-leaf.jpg',
            'symptoms' => ['পাতায় বাদামী দাগ', 'শীষ শুকিয়ে যাওয়া'],
        ], $token, 201);
        $this->check('GET  /api/disease/history', 'GET', '/api/disease/history', null, $token, 200);
        $this->check('GET  /api/disease/nearby-centers', 'GET', '/api/disease/nearby-centers', null, $token, 200);

        $this->section('কমিউনিটি | Community Forum');
        $this->check('GET  /api/community/posts', 'GET', '/api/community/posts', null, $token, 200);
        $postId = null;
        $this->check('POST /api/community/posts', 'POST', '/api/community/posts', [
            'category' => 'crop', 'title' => 'E2E টেস্ট পোস্ট', 'body' => 'এন্ড-টু-এন্ড যাচাইয়ের পোস্ট।',
        ], $token, 201, function ($json) use (&$postId) {
            $postId = $json['data']['id'] ?? null;
            return true;
        });
        if ($postId) {
            $this->check('POST vote (upvote)', 'POST', "/api/community/posts/{$postId}/vote", ['vote_type' => 'up'], $token, 200);
        }

        $this->section('বাজার ও ডিলার | Market & Dealers');
        $this->check('GET  /api/market/prices', 'GET', '/api/market/prices', null, $token, 200);
        $this->check('GET  /api/market/dealers', 'GET', '/api/market/dealers', null, $token, 200);

        $this->section('নোটিফিকেশন ও সিঙ্ক | Notifications & Offline Sync');
        $this->check('GET  /api/notifications', 'GET', '/api/notifications', null, $token, 200);
        $this->check('POST /api/sync (offline batch)', 'POST', '/api/sync', [
            'queue' => [[
                'client_id' => 'e2e-1',
                'action_type' => 'create_crop_plan',
                'payload' => ['name' => 'সিঙ্ক গম', 'land_shape' => 'rectangular', 'land_length_m' => 30, 'land_width_m' => 20, 'crop_id' => 2, 'season' => 'rabi'],
            ]],
        ], $token, 200);

        $this->section('অ্যাডমিন প্যানেল ও নিরাপত্তা | Admin Panel & Security');
        $adminToken = null;
        $this->check('POST /api/admin/login', 'POST', '/api/admin/login', [
            'email' => 'admin@folika.gov.bd', 'password' => 'Admin@Folika2026',
        ], null, 200, function ($json) use (&$adminToken) {
            $adminToken = $json['token'] ?? null;
            return !empty($adminToken);
        });
        if ($adminToken) {
            $this->check('GET  /api/admin/dashboard (admin token)', 'GET', '/api/admin/dashboard', null, $adminToken, 200);
        }
        // Security: a farmer token must NOT reach the admin panel
        $this->check('SECURITY: farmer blocked from admin', 'GET', '/api/admin/dashboard', null, $token, 403);

        // 5. Summary
        return $this->printSummary();
    }

    /** Ensure the Monir full-access test account exists. */
    protected function ensureMonir(): User
    {
        return User::updateOrCreate(
            ['mobile' => '01711111111'],
            [
                'name' => 'মোঃ মনিরুজ্জামান',
                'email' => 'monir@folika.gov.bd',
                'password_hash' => Hash::make('Farmer@123'),
                'role' => 'farmer',
                'farm_type' => 'mixed',
                'division_id' => 2,
                'district_id' => 1,
                'upazila_id' => 1,
                'aez_code' => 4,
                'latitude' => 24.67380000,
                'longitude' => 89.41840000,
                'language' => 'bn',
                'is_active' => true,
                'is_verified' => true,
                'notify_push' => true,
                'notify_sms' => true,
            ]
        );
    }

    /** Run the real OTP send/verify flow and return the issued token. */
    protected function verifyAuthFlow(User $monir): ?string
    {
        DB::table('otp_logs')->where('mobile', $monir->mobile)->delete();

        $send = $this->request('POST', '/api/auth/otp/send', ['mobile' => $monir->mobile, 'purpose' => 'login']);
        $otp = $send['json']['debug_otp'] ?? '123456';
        $this->record('POST /api/auth/otp/send', $send['status'] === 200, $send['status']);

        $verify = $this->request('POST', '/api/auth/otp/verify', ['mobile' => $monir->mobile, 'otp' => $otp]);
        $ok = $verify['status'] === 200 && !empty($verify['json']['token']);
        $this->record('POST /api/auth/otp/verify (token issued)', $ok, $verify['status']);

        return $verify['json']['token'] ?? null;
    }

    /** Perform a check and record PASS/FAIL. */
    protected function check(string $label, string $method, string $uri, ?array $data, ?string $token, int $expectedStatus, ?callable $assert = null): void
    {
        $res = $this->request($method, $uri, $data, $token);
        $pass = $res['status'] === $expectedStatus;
        if ($pass && $assert) {
            $pass = (bool) $assert($res['json'] ?? []);
        }
        $this->record($label, $pass, $res['status']);
    }

    protected function record(string $label, bool $pass, int $status): void
    {
        $this->results[] = ['label' => $label, 'pass' => $pass, 'status' => $status];
        $icon = $pass ? '<fg=green>PASS</>' : '<fg=red>FAIL</>';
        $this->line(sprintf('   %s  [%d]  %s', $icon, $status, $label));
    }

    protected function section(string $title): void
    {
        $this->line('');
        $this->line('── <fg=cyan>' . $title . '</> ──');
    }

    /** Dispatch an internal API request through the HTTP kernel. */
    protected function request(string $method, string $uri, ?array $data = null, ?string $token = null): array
    {
        // Reset any auth user resolved by a previous internal request so each
        // dispatch re-authenticates purely from its own bearer token.
        app('auth')->forgetGuards();

        $kernel = app(HttpKernel::class);

        $server = ['HTTP_ACCEPT' => 'application/json'];
        if ($token) {
            $server['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
        }

        $request = Request::create($uri, $method, $data ?? [], [], [], $server, $data ? json_encode($data) : null);
        if ($data) {
            $request->headers->set('Content-Type', 'application/json');
        }

        try {
            $response = $kernel->handle($request);
            $content = $response->getContent();
            $json = json_decode($content, true);
            return ['status' => $response->getStatusCode(), 'json' => is_array($json) ? $json : []];
        } catch (\Throwable $e) {
            return ['status' => 500, 'json' => ['message' => $e->getMessage()]];
        }
    }

    protected function printSummary(): int
    {
        $total = count($this->results);
        $passed = count(array_filter($this->results, fn ($r) => $r['pass']));
        $failed = $total - $passed;

        $this->line('');
        $this->info('===============================================================');
        $this->info("  ফলাফল সারসংক্ষেপ | RESULT SUMMARY");
        $this->info('===============================================================');
        $this->line("   মোট চেক (Total):   <fg=yellow>{$total}</>");
        $this->line("   সফল (Passed):      <fg=green>{$passed}</>");
        $this->line("   ব্যর্থ (Failed):     <fg=red>{$failed}</>");
        $rate = $total > 0 ? round(($passed / $total) * 100, 1) : 0;
        $this->line("   সফলতার হার (Rate): <fg=yellow>{$rate}%</>");
        $this->line('');

        if ($failed > 0) {
            $this->warn('ব্যর্থ চেকসমূহ | Failed checks:');
            foreach ($this->results as $r) {
                if (!$r['pass']) {
                    $this->line("   <fg=red>✘</> [{$r['status']}] {$r['label']}");
                }
            }
            $this->line('');
        }

        if ($this->option('save')) {
            $this->saveReport($total, $passed, $failed, $rate);
        }

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }

    protected function saveReport(int $total, int $passed, int $failed, float $rate): void
    {
        $lines = [];
        $lines[] = '# FOLIKA (ফলিকা) — End-to-End Verification Report';
        $lines[] = '';
        $lines[] = 'তারিখ / Date: ' . now()->toDayDateTimeString();
        $lines[] = 'টেস্ট ইউজার / Test user: মোঃ মনিরুজ্জামান (Monir) — 01711111111';
        $lines[] = '';
        $lines[] = "| # | Check | Status | Result |";
        $lines[] = "|---|-------|--------|--------|";
        foreach ($this->results as $i => $r) {
            $result = $r['pass'] ? 'PASS ✅' : 'FAIL ❌';
            $lines[] = '| ' . ($i + 1) . ' | ' . $r['label'] . ' | ' . $r['status'] . ' | ' . $result . ' |';
        }
        $lines[] = '';
        $lines[] = "**Total:** {$total}  |  **Passed:** {$passed}  |  **Failed:** {$failed}  |  **Success rate:** {$rate}%";

        $path = storage_path('app/folika-e2e-report.md');
        file_put_contents($path, implode("\n", $lines));
        $this->info("📄  রিপোর্ট সংরক্ষিত হয়েছে: {$path}");
    }
}
