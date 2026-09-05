<?php

namespace Tests\Feature;

use App\Models\Dealer;
use App\Models\User;
use Tests\TestCase;

class CommunityAndMarketTest extends TestCase
{
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::firstOrCreate(
            ['mobile' => '01711111111'],
            ['name' => 'মোঃ মনিরুজ্জামান', 'role' => 'farmer', 'language' => 'bn', 'is_active' => true]
        );
    }

    public function test_can_post_on_community_forum_and_vote(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/community/posts', [
            'category' => 'crop',
            'title' => 'আমন ধানের ইউরিয়া সার প্রয়োগের সঠিক সময়',
            'body' => 'রোপণের কত দিন পর প্রথম কিস্তির ইউরিয়া উপরিপ্রয়োগ করা উত্তম?',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'title' => 'আমন ধানের ইউরিয়া সার প্রয়োগের সঠিক সময়',
                ]
            ]);

        $postId = $response->json('data.id');

        // Upvote post
        $voteResp = $this->actingAs($this->user, 'sanctum')->postJson("/api/community/posts/{$postId}/vote", [
            'vote_type' => 'up',
        ]);

        $voteResp->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'upvotes' => 1,
                    'user_vote' => 'up',
                ]
            ]);
    }

    public function test_can_query_market_prices_and_dealers(): void
    {
        $prices = $this->actingAs($this->user, 'sanctum')->getJson('/api/market/prices?district_id=1');
        $prices->assertStatus(200)
            ->assertJson(['success' => true]);

        $dealers = $this->actingAs($this->user, 'sanctum')->getJson('/api/market/dealers');
        $dealers->assertStatus(200)
            ->assertJson(['success' => true]);
    }
}
