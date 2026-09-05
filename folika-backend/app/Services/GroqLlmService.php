<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqLlmService
{
    protected ?string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key', env('GROQ_API_KEY', 'mock_groq_api_key'));
    }

    /**
     * Get intelligent crop rotation advice based on previous crop and current target crop
     *
     * @param string|null $previousCrop
     * @param string $targetCrop
     * @param int|null $aezCode
     * @param string|null $soilType
     * @return array [advice_bn, nitrogen_balance, weed_risk, yield_boost_pct]
     */
    public function getCropRotationAdvice(?string $previousCrop, string $targetCrop, ?int $aezCode = null, ?string $soilType = null): array
    {
        if (empty($this->apiKey) || $this->apiKey === 'mock_groq_api_key' || app()->environment('local', 'testing')) {
            return $this->getRuleBasedRotationAdvice($previousCrop, $targetCrop);
        }

        try {
            $prompt = "You are an agronomy expert for Bangladesh BARC AEZ {$aezCode}. "
                    . "Farmer is rotating from previous crop '{$previousCrop}' to next crop '{$targetCrop}' on '{$soilType}' soil. "
                    . "Provide concise practical Bengali advice with scientific benefits. "
                    . "Return valid JSON with keys: advice_bn, nitrogen_balance ('positive'|'neutral'|'depleted'), weed_risk ('low'|'medium'|'high'), yield_boost_pct (integer 0-30).";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(12)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a Bangladeshi agricultural scientist. Return strictly JSON.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                $parsed = json_decode($content, true);
                if (is_array($parsed) && isset($parsed['advice_bn'])) {
                    return [
                        'advice_bn' => $parsed['advice_bn'],
                        'nitrogen_balance' => $parsed['nitrogen_balance'] ?? 'positive',
                        'weed_risk' => $parsed['weed_risk'] ?? 'low',
                        'yield_boost_pct' => (int)($parsed['yield_boost_pct'] ?? 15),
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::error("[GROQ LLM EXCEPTION] " . $e->getMessage() . " -> falling back to rule-based rotation advice");
        }

        return $this->getRuleBasedRotationAdvice($previousCrop, $targetCrop);
    }

    /**
     * Fallback rule-based rotation advice table
     */
    protected function getRuleBasedRotationAdvice(?string $previousCrop, string $targetCrop): array
    {
        $prevLower = mb_strtolower($previousCrop ?? '');
        $targetLower = mb_strtolower($targetCrop);

        // Rotating from Jute/Pulse/Mustard to Rice
        if (str_contains($prevLower, 'পাট') || str_contains($prevLower, 'jute') || str_contains($prevLower, 'মুগ') || str_contains($prevLower, 'সরিষা')) {
            return [
                'advice_bn' => "পূর্ববর্তী ফসল ({$previousCrop}) মাটিতে প্রচুর জৈব পদার্থ ও নাইট্রোজেন যুক্ত করেছে। ফলে {$targetCrop} চাষে ইউরিয়া সারের খরচ ১৫-২০% কমবে এবং মাটির উর্বরতা বৃদ্ধি পাবে।",
                'nitrogen_balance' => 'positive',
                'weed_risk' => 'low',
                'yield_boost_pct' => 18,
            ];
        }

        // Rotating Rice after Rice
        if (str_contains($prevLower, 'ধান') && str_contains($targetLower, 'ধান')) {
            return [
                'advice_bn' => "একটানা ধান চাষে মাটির নিচের স্তরে শক্ত স্তর (Hardpan) তৈরি হতে পারে এবং নির্দিষ্ট পুষ্টি উপাদান ঘাটতি হতে পারে। জমি চাষের সময় গভীরভাবে চাষ দিন এবং ট্রাইকোডার্মা ও গোবর সার ব্যবহার করুন।",
                'nitrogen_balance' => 'depleted',
                'weed_risk' => 'medium',
                'yield_boost_pct' => 5,
            ];
        }

        return [
            'advice_bn' => "সঠিক ফসল পর্যায় অনুসরণে মাটির স্বাস্থ্য ও অণুজীবের কার্যকারিতা বজায় থাকে। রোপণের পূর্বে সুষম হারে টিএসপি ও জিপসাম সার প্রয়োগ নিশ্চিত করুন।",
            'nitrogen_balance' => 'neutral',
            'weed_risk' => 'low',
            'yield_boost_pct' => 12,
        ];
    }
}
