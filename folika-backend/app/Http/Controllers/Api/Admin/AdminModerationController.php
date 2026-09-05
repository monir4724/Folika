<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminModerationController extends Controller
{
    /**
     * List moderation reports
     */
    public function reports(Request $request): JsonResponse
    {
        $status = $request->input('status', 'pending');
        $reports = Report::with('reporter:id,name,mobile')
            ->where('status', $status)
            ->latest('id')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }

    /**
     * Resolve or action a report
     */
    public function resolveReport(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:reviewed,actioned',
            'action_taken' => 'nullable|in:hide_content,delete_content,none',
        ]);

        $report = Report::findOrFail($id);
        $actionTaken = $request->input('action_taken');

        if ($actionTaken === 'hide_content' || $actionTaken === 'delete_content') {
            $newStatus = $actionTaken === 'hide_content' ? 'hidden' : 'deleted';
            if ($report->target_type === 'post') {
                ForumPost::where('id', $report->target_id)->update(['status' => $newStatus]);
            } else {
                ForumReply::where('id', $report->target_id)->update(['status' => $newStatus]);
            }
        }

        $report->update(['status' => $request->input('status')]);

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $request->user()->id,
            'action' => 'resolve_report',
            'target_type' => 'report',
            'target_id' => $report->id,
            'details_json' => ['action_taken' => $actionTaken],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report resolved.',
        ]);
    }

    /**
     * Post official notice from Admin
     */
    public function storeNotice(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'is_pinned' => 'nullable|boolean',
        ]);

        $notice = ForumPost::create([
            'user_id' => 1, // System official user
            'category' => 'official_notice',
            'title' => $request->input('title'),
            'body' => $request->input('body'),
            'is_official' => true,
            'is_pinned' => (bool)$request->input('is_pinned', true),
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Official notice published to community.',
            'data' => $notice,
        ], 201);
    }
}
