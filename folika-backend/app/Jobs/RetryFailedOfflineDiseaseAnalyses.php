<?php

namespace App\Jobs;

use App\Models\DiseaseDetection;
use App\Services\GroqVisionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RetryFailedOfflineDiseaseAnalyses implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(GroqVisionService $visionService): void
    {
        Log::info('[JOB START] RetryFailedOfflineDiseaseAnalyses');

        $pending = DiseaseDetection::whereIn('status', ['pending', 'failed'])
            ->limit(20)
            ->get();

        foreach ($pending as $detection) {
            $result = $visionService->analyzeDiseaseImage(
                $detection->image_url,
                $detection->category,
                $detection->symptoms_json ?? []
            );

            $detection->update([
                'disease_name' => $result['disease_name'],
                'confidence_pct' => $result['confidence_pct'],
                'severity' => $result['severity'],
                'treatment_notes' => $result['treatment_notes'],
                'ai_result_json' => $result,
                'status' => 'analyzed',
                'analyzed_at' => now(),
            ]);
        }

        Log::info("[JOB COMPLETE] RetryFailedOfflineDiseaseAnalyses: analyzed {$pending->count()} items.");
    }
}
