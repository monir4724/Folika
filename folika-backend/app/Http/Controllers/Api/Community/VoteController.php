<?php

namespace App\Http\Controllers\Api\Community;

use App\Http\Controllers\Controller;
use App\Http\Requests\Community\VotePostRequest;
use App\Models\ForumPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class VoteController extends Controller
{
    /**
     * Upvote or Downvote a forum post
     */
    public function vote(int $postId, VotePostRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $post = ForumPost::where('id', $postId)->where('status', 'active')->firstOrFail();
        $voteType = $request->validated('vote_type');

        $existingVote = DB::table('post_votes')
            ->where('user_id', $userId)
            ->where('post_id', $postId)
            ->first();

        if ($existingVote) {
            if ($existingVote->vote_type === $voteType) {
                // Remove vote if clicked same button again
                DB::table('post_votes')
                    ->where('user_id', $userId)
                    ->where('post_id', $postId)
                    ->delete();

                $voteType === 'up' ? $post->decrement('upvotes') : $post->decrement('downvotes');
                $userVote = null;
            } else {
                // Change vote
                if ($voteType === 'up') {
                    $post->increment('upvotes');
                    $post->decrement('downvotes');
                } else {
                    $post->increment('downvotes');
                    $post->decrement('upvotes');
                }
                DB::table('post_votes')
                    ->where('user_id', $userId)
                    ->where('post_id', $postId)
                    ->update([
                        'vote_type' => $voteType,
                    ]);
                $userVote = $voteType;
            }
        } else {
            DB::table('post_votes')->insert([
                'user_id' => $userId,
                'post_id' => $postId,
                'vote_type' => $voteType,
                'created_at' => now(),
            ]);
            $voteType === 'up' ? $post->increment('upvotes') : $post->increment('downvotes');
            $userVote = $voteType;
        }

        $post->refresh();

        return response()->json([
            'success' => true,
            'data' => [
                'upvotes' => $post->upvotes,
                'downvotes' => $post->downvotes,
                'user_vote' => $userVote,
            ],
        ]);
    }
}
