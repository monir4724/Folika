<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiseaseDetection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category',
        'image_url',
        'image_size_kb',
        'symptoms_json',
        'ai_result_json',
        'disease_name',
        'confidence_pct',
        'severity',
        'treatment_notes',
        'status',
        'analyzed_at',
    ];

    protected function casts(): array
    {
        return [
            'symptoms_json' => 'array',
            'ai_result_json' => 'array',
            'confidence_pct' => 'decimal:2',
            'image_size_kb' => 'integer',
            'analyzed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
