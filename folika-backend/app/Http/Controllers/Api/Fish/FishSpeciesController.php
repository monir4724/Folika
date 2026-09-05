<?php

namespace App\Http\Controllers\Api\Fish;

use App\Http\Controllers\Controller;
use App\Http\Resources\FishSpeciesResource;
use App\Models\FishSpeciesMaster;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FishSpeciesController extends Controller
{
    /**
     * Get all master fish species
     */
    public function index(Request $request): JsonResponse
    {
        $layer = $request->input('water_layer');
        $query = FishSpeciesMaster::query();

        if ($layer && in_array($layer, ['surface', 'middle', 'bottom'])) {
            $query->where('water_layer', $layer);
        }

        $species = $query->get();

        return response()->json([
            'success' => true,
            'data' => FishSpeciesResource::collection($species),
        ]);
    }

    /**
     * Species recommendations by water layer
     */
    public function recommend(Request $request): JsonResponse
    {
        $depth = (float)($request->input('depth_m', 1.5));
        $species = FishSpeciesMaster::where('min_depth_m', '<=', $depth)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'surface' => FishSpeciesResource::collection($species->where('water_layer', 'surface')->values()),
                'middle' => FishSpeciesResource::collection($species->where('water_layer', 'middle')->values()),
                'bottom' => FishSpeciesResource::collection($species->where('water_layer', 'bottom')->values()),
            ],
        ]);
    }
}
