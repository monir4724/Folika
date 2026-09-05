<?php

namespace App\Http\Controllers\Api\Fish;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Guest / logged-out fish plans & reminders (file store — no DB, no Sanctum).
 */
class FishClientStoreController extends Controller
{
    private function dir(string $clientKey): string
    {
        return 'fish_clients/' . $clientKey;
    }

    private function validKey(string $key): bool
    {
        return (bool) preg_match('/^[a-zA-Z0-9_-]{8,80}$/', $key);
    }

    public function savePlans(Request $request): JsonResponse
    {
        $request->validate([
            'client_key' => ['required', 'string', 'min:8', 'max:80'],
            'plans' => ['required', 'array', 'max:40'],
            'active_plan_id' => ['nullable', 'string', 'max:80'],
        ]);

        $key = $request->input('client_key');
        if (!$this->validKey($key)) {
            return response()->json(['success' => false, 'message' => 'Invalid client key.'], 422);
        }

        $payload = [
            'updated_at' => now()->toIso8601String(),
            'active_plan_id' => $request->input('active_plan_id'),
            'plans' => $request->input('plans'),
        ];
        Storage::disk('local')->put($this->dir($key) . '/plans.json', json_encode($payload, JSON_UNESCAPED_UNICODE));

        return response()->json([
            'success' => true,
            'message' => 'Fish plans saved.',
            'data' => ['count' => count($payload['plans'])],
        ]);
    }

    public function loadPlans(Request $request): JsonResponse
    {
        $key = (string) $request->query('client_key', '');
        if (!$this->validKey($key)) {
            return response()->json(['success' => false, 'message' => 'Invalid client key.'], 422);
        }
        $path = $this->dir($key) . '/plans.json';
        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['success' => true, 'data' => ['plans' => [], 'active_plan_id' => null]]);
        }
        $raw = json_decode(Storage::disk('local')->get($path), true) ?: [];

        return response()->json(['success' => true, 'data' => $raw]);
    }

    public function saveReminders(Request $request): JsonResponse
    {
        $request->validate([
            'client_key' => ['required', 'string', 'min:8', 'max:80'],
            'reminders' => ['required', 'array', 'max:80'],
            'reminders.*.id' => ['required', 'string', 'max:80'],
            'reminders.*.task' => ['required', 'string', 'max:120'],
            'reminders.*.date' => ['required', 'string', 'max:20'],
            'reminders.*.plan_id' => ['nullable', 'string', 'max:80'],
            'reminders.*.domain' => ['nullable', 'string', 'max:20'],
        ]);

        $key = $request->input('client_key');
        if (!$this->validKey($key)) {
            return response()->json(['success' => false, 'message' => 'Invalid client key.'], 422);
        }

        $payload = [
            'updated_at' => now()->toIso8601String(),
            'reminders' => $request->input('reminders'),
        ];
        Storage::disk('local')->put($this->dir($key) . '/reminders.json', json_encode($payload, JSON_UNESCAPED_UNICODE));

        return response()->json([
            'success' => true,
            'message' => 'Reminders saved.',
            'data' => ['count' => count($payload['reminders'])],
        ]);
    }

    public function loadReminders(Request $request): JsonResponse
    {
        $key = (string) $request->query('client_key', '');
        if (!$this->validKey($key)) {
            return response()->json(['success' => false, 'message' => 'Invalid client key.'], 422);
        }
        $path = $this->dir($key) . '/reminders.json';
        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['success' => true, 'data' => ['reminders' => []]]);
        }
        $raw = json_decode(Storage::disk('local')->get($path), true) ?: [];

        return response()->json(['success' => true, 'data' => $raw]);
    }
}
