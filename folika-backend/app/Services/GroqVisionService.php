<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GroqVisionService
{
    protected ?string $apiKey;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key', env('GROQ_API_KEY', 'mock_groq_api_key'));
        $this->model = config('services.groq.vision_model', 'llama-3.2-90b-vision-preview');
    }

    /**
     * Analyze disease from stored image URL/path.
     */
    public function analyzeDiseaseImage(string $imageUrl, string $category = 'crop', array $symptoms = []): array
    {
        $bytes = $this->resolveImageBytes($imageUrl);
        if ($bytes === null) {
            return $this->getMockOrRuleBasedDiagnosis($category, $symptoms);
        }

        return $this->analyzeImageBytes($bytes['data'], $bytes['mime'], $category, $symptoms);
    }

    /**
     * Analyze disease directly from uploaded file path.
     */
    public function analyzeDiseaseFile(string $absolutePath, string $mime, string $category = 'crop', array $symptoms = []): array
    {
        if (!is_readable($absolutePath)) {
            return $this->getMockOrRuleBasedDiagnosis($category, $symptoms);
        }

        $data = file_get_contents($absolutePath);
        if ($data === false) {
            return $this->getMockOrRuleBasedDiagnosis($category, $symptoms);
        }

        return $this->analyzeImageBytes($data, $mime ?: 'image/jpeg', $category, $symptoms);
    }

    protected function analyzeImageBytes(string $binary, string $mime, string $category, array $symptoms): array
    {
        if ($this->shouldUseMock()) {
            return $this->getMockOrRuleBasedDiagnosis($category, $symptoms);
        }

        $categoryBn = match ($category) {
            'fish' => 'মৎস্য',
            'livestock' => 'প্রাণিসম্পদ',
            default => 'ফসল',
        };

        $symptomsText = $symptoms
            ? implode(', ', array_map('strval', $symptoms))
            : 'উপলব্ধ নয়';

        $prompt = "তুমি বাংলাদেশের একজন কৃষি বিজ্ঞানী। এই ছবিটি {$categoryBn} ({$category}) সম্পর্কিত। "
            . "ছবি দেখে কোন ফসল/প্রাণি/মাছ এবং কোন রোগ তা শনাক্ত করো। "
            . "কৃষকের লক্ষণ: {$symptomsText}. "
            . "শুধুমাত্র বৈধ JSON রিটার্ন করো (অন্য কোনো টেক্সট নয়) এই কীগুলো দিয়ে:\n"
            . "crop_name (বাংলায় ফসল/প্রাণির নাম, যেমন: ধান, টমেটো, রুই মাছ, গরু),\n"
            . "disease_name (বাংলায় রোগের নাম, ইংরেজি বন্ধনীতে বৈজ্ঞানিক/ইংরেজি নাম),\n"
            . "confidence_pct (0-100 সংখ্যা),\n"
            . "severity (low|medium|high|critical),\n"
            . "description_bn (রোগের সংক্ষিপ্ত বর্ণনা বাংলায়),\n"
            . "treatment_notes (তাৎক্ষণিক করণীয় বাংলায়),\n"
            . "organic_treatment (জৈব চিকিৎসা বাংলায়),\n"
            . "chemical_treatment (রাসায়নিক/ঔষধ চিকিৎসা বাংলায়).";

        try {
            $base64 = base64_encode($binary);
            $dataUri = 'data:' . $mime . ';base64,' . $base64;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(45)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => $prompt],
                            ['type' => 'image_url', 'image_url' => ['url' => $dataUri]],
                        ],
                    ],
                ],
                'temperature' => 0.2,
                'max_tokens' => 1200,
                'response_format' => ['type' => 'json_object'],
            ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                $parsed = is_string($content) ? json_decode($content, true) : null;
                if (is_array($parsed) && !empty($parsed['disease_name'])) {
                    return $this->normalizeResult($parsed, $category);
                }
                Log::warning('[GROQ VISION] Invalid JSON content: ' . substr((string)$content, 0, 200));
            } else {
                Log::warning('[GROQ VISION API FAILED] Status: ' . $response->status() . ' Body: ' . $response->body());
            }
        } catch (\Throwable $e) {
            Log::error('[GROQ VISION EXCEPTION] ' . $e->getMessage());
        }

        return $this->getMockOrRuleBasedDiagnosis($category, $symptoms);
    }

    protected function normalizeResult(array $parsed, string $category): array
    {
        $cropName = trim((string)($parsed['crop_name'] ?? ''));
        $diseaseName = trim((string)$parsed['disease_name']);
        if ($cropName && !str_contains($diseaseName, $cropName)) {
            $diseaseName = $cropName . ' — ' . $diseaseName;
        }

        $severity = $parsed['severity'] ?? 'medium';
        if (!in_array($severity, ['low', 'medium', 'high', 'critical'], true)) {
            $severity = 'medium';
        }

        return [
            'crop_name' => $cropName ?: ($category === 'crop' ? 'ফসল' : ($category === 'fish' ? 'মাছ' : 'প্রাণি')),
            'disease_name' => $diseaseName,
            'confidence_pct' => min(100, max(0, (float)($parsed['confidence_pct'] ?? 85))),
            'severity' => $severity,
            'description_bn' => $parsed['description_bn'] ?? $parsed['treatment_notes'] ?? '',
            'treatment_notes' => $parsed['treatment_notes'] ?? 'আক্রান্ত অংশ আলাদা রাখুন ও স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।',
            'organic_treatment' => $parsed['organic_treatment'] ?? 'জৈব পদ্ধতি অনুসরণ করুন।',
            'chemical_treatment' => $parsed['chemical_treatment'] ?? 'অনুমোদিত ওষুধ/বালাইনাশক ব্যবহার করুন।',
            'provider' => 'groq',
            'model' => $this->model,
        ];
    }

    protected function shouldUseMock(): bool
    {
        return empty($this->apiKey) || $this->apiKey === 'mock_groq_api_key';
    }

    /**
     * @return array{data: string, mime: string}|null
     */
    protected function resolveImageBytes(string $imageUrl): ?array
    {
        if (str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
            $path = parse_url($imageUrl, PHP_URL_PATH);
            if (is_string($path) && str_contains($path, '/storage/')) {
                $relative = ltrim(substr($path, strpos($path, '/storage/') + strlen('/storage/')), '/');
                if (Storage::disk('public')->exists($relative)) {
                    return [
                        'data' => Storage::disk('public')->get($relative),
                        'mime' => Storage::disk('public')->mimeType($relative) ?: 'image/jpeg',
                    ];
                }
            }
            try {
                $resp = Http::timeout(15)->get($imageUrl);
                if ($resp->successful()) {
                    return ['data' => $resp->body(), 'mime' => $resp->header('Content-Type') ?: 'image/jpeg'];
                }
            } catch (\Throwable $e) {
                Log::warning('[GROQ VISION] Could not fetch URL: ' . $e->getMessage());
            }
            return null;
        }

        if (Storage::disk('public')->exists($imageUrl)) {
            return [
                'data' => Storage::disk('public')->get($imageUrl),
                'mime' => Storage::disk('public')->mimeType($imageUrl) ?: 'image/jpeg',
            ];
        }

        $publicPath = public_path(ltrim($imageUrl, '/'));
        if (is_readable($publicPath)) {
            return [
                'data' => file_get_contents($publicPath),
                'mime' => mime_content_type($publicPath) ?: 'image/jpeg',
            ];
        }

        return null;
    }

    protected function getMockOrRuleBasedDiagnosis(string $category, array $symptoms): array
    {
        $symptomsText = implode(' ', array_map('strval', $symptoms));

        if ($category === 'crop') {
            if (str_contains($symptomsText, 'ব্লাস্ট') || str_contains($symptomsText, 'blast') || str_contains($symptomsText, 'বাদামি')) {
                return [
                    'crop_name' => 'ধান',
                    'disease_name' => 'ধান — ব্লাস্ট রোগ (Rice Blast)',
                    'confidence_pct' => 94.20,
                    'severity' => 'high',
                    'description_bn' => 'পাতায় হীরার আকৃতির দাগ ও শীষ শুকিয়ে যাওয়া লক্ষণ দেখা যায়।',
                    'treatment_notes' => 'জমিতে ২-৩ ইঞ্চি পানি ধরে রাখুন। অতিরিক্ত ইউরিয়া বন্ধ রাখুন।',
                    'organic_treatment' => 'গাছের গোড়ায় ছাই ও পটাশ সার প্রয়োগ করুন।',
                    'chemical_treatment' => 'ট্রাইসাইক্লাজল (০.৭৫ গ্রাম/লিটার) বিকেলে স্প্রে করুন।',
                    'provider' => 'fallback',
                ];
            }

            return [
                'crop_name' => 'ধান',
                'disease_name' => 'ধান — পাতা পোড়া রোগ (Brown Spot)',
                'confidence_pct' => 89.50,
                'severity' => 'medium',
                'description_bn' => 'পাতায় বাদামি বৃত্তাকার দাগ দেখা যায়।',
                'treatment_notes' => 'সুষম সার ও পটাশ সার প্রয়োগ করুন।',
                'organic_treatment' => 'গোবর সার ও নিম তেলের মিশ্রণ ব্যবহার করুন।',
                'chemical_treatment' => 'ম্যানকোজেব (২ গ্রাম/লিটার) স্প্রে করুন।',
                'provider' => 'fallback',
            ];
        }

        if ($category === 'fish') {
            return [
                'crop_name' => 'রুই মাছ',
                'disease_name' => 'মাছ — ক্ষত রোগ (EUS)',
                'confidence_pct' => 91.00,
                'severity' => 'high',
                'description_bn' => 'মাছের দেহে ক্ষত ও আলসার দেখা যায়।',
                'treatment_notes' => 'পুকুরে চুন দিন। জাল টানা সাময়িক বন্ধ রাখুন।',
                'organic_treatment' => 'লবণ ও চুন মিশিয়ে পুকুরে ছিটান।',
                'chemical_treatment' => 'পটাশিয়াম পারম্যাঙ্গানেট স্প্রে করুন।',
                'provider' => 'fallback',
            ];
        }

        return [
            'crop_name' => 'গরু',
            'disease_name' => 'গরু — খুর ও মুখ রোগ (FMD)',
            'confidence_pct' => 95.00,
            'severity' => 'critical',
            'description_bn' => 'মুখ ও খুরে ফোস্কা ও জ্বরের লক্ষণ।',
            'treatment_notes' => 'আক্রান্ত পশু আলাদা রাখুন।',
            'organic_treatment' => 'মুখ পরিষ্কার রাখুন ও পুষ্টিকর খাদ্য দিন।',
            'chemical_treatment' => 'ভেটেরিনারির পরামর্শে ওষুধ প্রয়োগ করুন।',
            'provider' => 'fallback',
        ];
    }
}
