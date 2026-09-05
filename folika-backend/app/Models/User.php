<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'mobile',
        'email',
        'password_hash',
        'role',
        'farm_type',
        'division_id',
        'district_id',
        'upazila_id',
        'aez_code',
        'latitude',
        'longitude',
        'language',
        'avatar_url',
        'fcm_token',
        'is_active',
        'is_verified',
        'notify_push',
        'notify_sms',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'notify_push' => 'boolean',
            'notify_sms' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'aez_code' => 'integer',
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash ?? '';
    }

    // Relationships
    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function upazila()
    {
        return $this->belongsTo(Upazila::class);
    }

    public function cropPlans()
    {
        return $this->hasMany(CropPlan::class);
    }

    public function fishPlans()
    {
        return $this->hasMany(FishPlan::class);
    }

    public function livestockPlans()
    {
        return $this->hasMany(LivestockPlan::class);
    }

    public function diseaseDetections()
    {
        return $this->hasMany(DiseaseDetection::class);
    }

    public function forumPosts()
    {
        return $this->hasMany(ForumPost::class);
    }

    public function forumReplies()
    {
        return $this->hasMany(ForumReply::class);
    }

    public function notifications()
    {
        return $this->hasMany(NotificationQueue::class);
    }

    public function dealer()
    {
        return $this->hasOne(Dealer::class);
    }

    public function offlineSyncQueue()
    {
        return $this->hasMany(OfflineSyncQueue::class);
    }
}
