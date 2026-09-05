<?php

namespace App\Http\Controllers\Api\Community;

use App\Http\Controllers\Controller;
use App\Http\Requests\Community\StoreForumReplyRequest;
use App\Http\Resources\ForumReplyResource;
use App\Models\ForumPost;
use App\Models\ForumReply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumReplyController extends Controller
{
    /**
     * Post a reply to forum discussion
     */
    public function store(int $postId, StoreForumReplyRequest $request): JsonResponse
    {
        $post = ForumPost::where('id', $postId)->where('status', 'active')->firstOrFail();
        $user = $request->user();

        $reply = ForumReply::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'body' => $request->validated('body'),
            'is_expert' => in_array($user->role, ['extension_officer', 'ngo_worker']),
            'upvotes' => 0,
            'status' => 'active',
        ]);

        $post->increment('reply_count');
        $reply->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Reply posted successfully.',
            'data' => new ForumReplyResource($reply),
        ], 201);
    }

    /**
     * Delete reply
     */
    public function destroy(int $replyId, Request $request): JsonResponse
    {
        $reply = ForumReply::where('id', $replyId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $reply->update(['status' => 'deleted']);
        $reply->post?->decrement('reply_count');

        return response()->json([
            'success' => true,
            'message' => 'Reply deleted successfully.',
        ]);
    }
}
