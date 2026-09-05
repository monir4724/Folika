<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Disease\AnalyzeDiseaseRequest;
use App\Http\Resources\DiseaseDetectionResource;
use App\Models\DiseaseDetection;
use App\Services\GroqVisionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DiseaseDetectionController extends Controller
{
    public function __construct(
        protected GroqVisionService $visionService
    ) {
    }

    /**
     * Submit image for AI disease diagnosis (Groq Vision).
     */
    public function analyze(AnalyzeDiseaseRequest $request): JsonResponse
    {
        $user = $request->user();
        $category = $request->validated('category');
        $symptoms = $request->validated('symptoms', []);
        $imageUrl = $request->validated('image_url');
        $imageSizeKb = null;
        $result = null;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $imageSizeKb = (int)round($file->getSize() / 1024);
            $path = $file->store('diseases', 'public');
            $imageUrl = Storage::disk('public')->url($path);
            $absolutePath = Storage::disk('public')->path($path);
            $result = $this->visionService->analyzeDiseaseFile(
                $absolutePath,
                $file->getMimeType() ?: 'image/jpeg',
                $category,
                $symptoms
            );
        } elseif (!empty($imageUrl)) {
            $result = $this->visionService->analyzeDiseaseImage($imageUrl, $category, $symptoms);
        } else {
            $imageUrl = 'assets/images/disease-sample.jpg';
            $result = $this->visionService->analyzeDiseaseImage($imageUrl, $category, $symptoms);
        }

        $detection = DiseaseDetection::create([
            'user_id' => $user->id,
            'category' => $category,
            'image_url' => $imageUrl,
            'image_size_kb' => $imageSizeKb,
            'symptoms_json' => $symptoms,
            'status' => 'pending',
        ]);

        $detection->update([
            'disease_name' => $result['disease_name'],
            'confidence_pct' => $result['confidence_pct'],
            'severity' => $result['severity'],
            'treatment_notes' => $result['treatment_notes'],
            'ai_result_json' => $result,
            'status' => 'analyzed',
            'analyzed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'রোগ নির্ণয় সম্পন্ন হয়েছে।',
            'data' => new DiseaseDetectionResource($detection->fresh()),
        ], 201);
    }

    public function history(Request $request): JsonResponse
    {
        $category = $request->input('category');
        $query = DiseaseDetection::where('user_id', $request->user()->id)->latest('id');

        if ($category && in_array($category, ['crop', 'fish', 'livestock'])) {
            $query->where('category', $category);
        }

        return response()->json([
            'success' => true,
            'data' => DiseaseDetectionResource::collection($query->paginate(15)),
        ]);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $detection = DiseaseDetection::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new DiseaseDetectionResource($detection),
        ]);
    }

    public function nearbyCenters(Request $request): JsonResponse
    {
        $user = $request->user();
        $upazilaName = $request->input('upazila')
            ?: ($user?->upazila?->name_bn ?? null)
            ?: 'ঢাকা';
        $districtName = $request->input('district')
            ?: ($user?->district?->name_bn ?? null)
            ?: 'ঢাকা';

        $centers = [
            [
                'name' => "উপজেলা কৃষি অফিস, {$upazilaName}",
                'type' => 'crop',
                'address' => "উপজেলা পরিষদ চত্বর, {$upazilaName}, {$districtName}",
                'officer_name' => 'উপজেলা কৃষি কর্মকর্তা (UAO)',
                'hotline' => '16123',
                'phone' => '01712-345678',
                'distance_km' => 3.2,
                'open_hours' => 'রবি - বৃহস্পতি: সকাল ৯টা - বিকাল ৪টা',
            ],
            [
                'name' => "উপজেলা প্রাণিসম্পদ দপ্তর ও ভেটেরিনারি হাসপাতাল",
                'type' => 'livestock',
                'address' => "হাসপাতাল রোড, {$upazilaName}, {$districtName}",
                'officer_name' => 'উপজেলা প্রাণিসম্পদ কর্মকর্তা (ULO)',
                'hotline' => '16123',
                'phone' => '01713-987654',
                'distance_km' => 2.8,
                'open_hours' => '২৪ ঘণ্টা জরুরি সেবা ও অফিস সময়',
            ],
            [
                'name' => "উপজেলা মৎস্য দপ্তর, {$upazilaName}",
                'type' => 'fish',
                'address' => "মিনি সচিবালয়, {$upazilaName}, {$districtName}",
                'officer_name' => 'সিনিয়র উপজেলা মৎস্য কর্মকর্তা (SUFO)',
                'hotline' => '16123',
                'phone' => '01714-567890',
                'distance_km' => 3.5,
                'open_hours' => 'রবি - বৃহস্পতি: সকাল ৯টা - বিকাল ৪টা',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $centers,
        ]);
    }
}
