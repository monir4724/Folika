<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuditController extends Controller
{
    /**
     * List audit logs with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $action = $request->input('action');
        $actorType = $request->input('actor_type');

        $query = AuditLog::latest('created_at');

        if ($action) {
            $query->where('action', $action);
        }

        if ($actorType) {
            $query->where('actor_type', $actorType);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(25),
        ]);
    }
}
