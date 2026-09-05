<?php

namespace App\Http\Controllers\Api\Community;

use App\Http\Controllers\Controller;
use App\Http\Requests\Community\StoreForumPostRequest;
use App\Http\Resources\ForumPostResource;
use App\Models\ForumPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumPostController extends Controller
{
    /**
     * List forum posts with category filter & search
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->input('category');
        $search = $request->input('search');

        $query = ForumPost::with(['user', 'replies.user'])
            ->where('status', 'active');

        if ($category && in_array($category, ['crop', 'fish', 'livestock', 'market', 'general', 'official_notice'])) {
            $query->where('category', $category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('body', 'LIKE', "%{$search}%");
            });
        }

        $posts = $query->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => ForumPostResource::collection($posts),
        ]);
    }

    /**
     * Create forum post
     */
    public function store(StoreForumPostRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $validated['user_id'] = $user->id;

        // Only officers or admins can mark is_official
        if (isset($validated['is_official']) && $validated['is_official'] && !in_array($user->role, ['extension_officer', 'ngo_worker'])) {
            $validated['is_official'] = false;
        }

        $post = ForumPost::create($validated);
        $post->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Post published successfully.',
            'data' => new ForumPostResource($post),
        ], 201);
    }

    /**
     * Show single post with replies
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $post = ForumPost::with(['user', 'replies.user'])
            ->where('id', $id)
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new ForumPostResource($post),
        ]);
    }

    /**
     * Soft delete user's own post
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $post = ForumPost::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $post->update(['status' => 'deleted']);

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully.',
        ]);
    }
}
