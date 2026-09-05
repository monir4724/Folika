<?php

namespace App\Http\Controllers\Api\Community;

use App\Http\Controllers\Controller;
use App\Http\Requests\Community\ReportRequest;
use App\Models\Report;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Report offensive/spam post or reply for moderation
     */
    public function store(ReportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['reporter_id'] = $request->user()->id;
        $validated['status'] = 'pending';

        $report = Report::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thank you. Your report has been submitted for moderation review.',
            'report_id' => $report->id,
        ], 201);
    }
}
