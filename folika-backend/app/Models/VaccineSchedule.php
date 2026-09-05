<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VaccineSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'livestock_plan_id',
        'vaccine_name',
        'vaccine_name_bn',
        'frequency',
        'due_date',
        'completed_at',
        'reminder_sent',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'completed_at' => 'datetime',
            'reminder_sent' => 'boolean',
        ];
    }

    public function livestockPlan()
    {
        return $this->belongsTo(LivestockPlan::class);
    }
}
