<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Division;
use App\Models\Upazila;
use Database\Seeders\AezSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LocationController extends Controller
{
    /**
     * Get all Bangladesh divisions
     */
    public function divisions(): JsonResponse
    {
        $divisions = Division::all(['id', 'name_bn', 'name_en']);
        return response()->json([
            'success' => true,
            'data' => $divisions,
        ]);
    }

    /**
     * Get districts by division ID
     */
    public function districts(int $divisionId): JsonResponse
    {
        $districts = District::where('division_id', $divisionId)->get(['id', 'division_id', 'name_bn', 'name_en']);
        return response()->json([
            'success' => true,
            'data' => $districts,
        ]);
    }

    /**
     * Get upazilas by district ID
     */
    public function upazilas(int $districtId): JsonResponse
    {
        $upazilas = Upazila::where('district_id', $districtId)->get(['id', 'district_id', 'name_bn', 'name_en', 'aez_code']);
        return response()->json([
            'success' => true,
            'data' => $upazilas,
        ]);
    }

    /**
     * Get AEZ Details by upazila ID
     */
    public function aez(int $upazilaId): JsonResponse
    {
        $upazila = Upazila::with('district.division')->findOrFail($upazilaId);
        $aezCode = $upazila->aez_code ?? 4;
        $aezData = AezSeeder::getAezData($aezCode);

        return response()->json([
            'success' => true,
            'data' => [
                'upazila' => [
                    'id' => $upazila->id,
                    'name_bn' => $upazila->name_bn,
                    'name_en' => $upazila->name_en,
                    'district' => $upazila->district?->name_bn,
                    'division' => $upazila->district?->division?->name_bn,
                ],
                'aez_code' => $aezCode,
                'aez_details' => $aezData,
            ],
        ]);
    }

    public function resolve(Request $request): JsonResponse
    {
        $fold = static function (?string $s): string {
            $s = mb_strtolower(trim((string) $s));
            $s = preg_replace('/division|district|zila|zilla|upazila|upozila|thana|বিভাগ|জেলা|উপজেলা|থানা/u', '', $s);
            return preg_replace('/[\s\-_.\',]/u', '', $s) ?? '';
        };

        $match = static function ($query, ?string $raw) use ($fold) {
            $needle = $fold($raw);
            if ($needle === '' || strlen($needle) < 3) {
                return null;
            }
            return $query->get()->first(function ($row) use ($fold, $needle) {
                $en = $fold($row->name_en);
                $bn = $fold($row->name_bn);
                return $en === $needle || $bn === $needle
                    || (strlen($en) >= 4 && (str_contains($en, $needle) || str_contains($needle, $en)))
                    || (strlen($bn) >= 4 && (str_contains($bn, $needle) || str_contains($needle, $bn)));
            });
        };

        $division = $match(Division::query(), $request->query('division'));
        $districtQuery = District::query();
        if ($division) {
            $districtQuery->where('division_id', $division->id);
        }
        $district = $match($districtQuery, $request->query('district'));
        $upazilaQuery = Upazila::query();
        if ($district) {
            $upazilaQuery->where('district_id', $district->id);
        }
        $upazila = $match($upazilaQuery, $request->query('upazila'));
        if ($upazila && ! $district) {
            $district = $upazila->district ?: District::find($upazila->district_id);
            $division = $division ?: ($district?->division ?: Division::find($district?->division_id));
        }

        return response()->json([
            'success' => true,
            'data' => [
                'division' => $division ? ['id' => $division->id, 'name_bn' => $division->name_bn, 'name_en' => $division->name_en] : null,
                'district' => $district ? ['id' => $district->id, 'name_bn' => $district->name_bn, 'name_en' => $district->name_en] : null,
                'upazila' => $upazila ? ['id' => $upazila->id, 'name_bn' => $upazila->name_bn, 'name_en' => $upazila->name_en] : null,
            ],
        ]);
    }

    /**
     * Reverse-geocode GPS coordinates to division / district / upazila names.
     */
    public function reverse(Request $request): JsonResponse
    {
        $lat = (float) $request->query('lat');
        $lon = (float) $request->query('lon');

        $names = [
            'division' => null,
            'district' => null,
            'upazila' => null,
            'display' => null,
            'candidates' => [],
            'lat' => $lat,
            'lon' => $lon,
        ];

        if ($lat && $lon) {
            $google = $this->reverseGoogle($lat, $lon);
            $osm = $this->reverseNominatim($lat, $lon);
            $normalized = $this->normalizeBangladeshAdmin($google, $osm);
            $names = array_merge($names, array_filter([
                'division' => $normalized['division'] ?? null,
                'district' => $normalized['district'] ?? null,
                'upazila' => $normalized['upazila'] ?? null,
                'display' => $normalized['display'] ?? null,
            ], fn ($v) => $v !== null && $v !== ''));
            $names['candidates'] = array_values(array_unique(array_filter(array_merge(
                $normalized['candidates'] ?? [],
                $google['candidates'] ?? [],
                $osm['candidates'] ?? []
            ))));
            $names['lat'] = $lat;
            $names['lon'] = $lon;
        }

        return response()->json([
            'success' => true,
            'data' => $names,
        ]);
    }

    private function normalizeBangladeshAdmin(array $google, array $osm): array
    {
        $texts = array_values(array_filter(array_merge(
            [$google['display'] ?? null, $osm['display'] ?? null],
            $google['candidates'] ?? [],
            $osm['candidates'] ?? [],
            [$google['division'] ?? null, $google['district'] ?? null, $google['upazila'] ?? null],
            [$osm['division'] ?? null, $osm['district'] ?? null, $osm['upazila'] ?? null]
        )));

        $division = null;
        $district = null;
        $upazila = null;

        foreach ($texts as $text) {
            $text = trim((string) $text);
            if ($text === '') {
                continue;
            }
            foreach (preg_split('/[,|]+/', $text) as $part) {
                $part = trim($part);
                if ($part === '') {
                    continue;
                }
                if (preg_match('/^(.+?)\s+Division$/i', $part, $m)) {
                    $division = $division ?? trim($m[1]).' Division';
                } elseif (preg_match('/^(.+?)\s+District$/i', $part, $m)) {
                    $district = $district ?? trim($m[1]).' District';
                } elseif (preg_match('/^(.+?)\s+(?:Upazila|Thana)$/i', $part, $m)) {
                    $upazila = $upazila ?? trim($m[1]).' Upazila';
                }
            }
        }

        $rawDistrict = $google['district'] ?? $osm['district'] ?? null;
        $rawUpazila = $google['upazila'] ?? $osm['upazila'] ?? null;

        if ($rawDistrict && preg_match('/upazila|thana|উপজেলা|থানা/i', (string) $rawDistrict)) {
            $upazila = $upazila ?? $rawDistrict;
        } elseif ($rawDistrict && ! $district) {
            $district = $rawDistrict;
        }

        if ($rawUpazila && preg_match('/upazila|thana|উপজেলা|থানা/i', (string) $rawUpazila)) {
            $upazila = $upazila ?? $rawUpazila;
        }

        if (! $division) {
            $division = $google['division'] ?? $osm['division'] ?? null;
        }

        return [
            'division' => $division,
            'district' => $district,
            'upazila' => $upazila,
            'display' => $google['display'] ?? $osm['display'] ?? null,
            'candidates' => array_values(array_unique(array_filter($texts))),
        ];
    }

    private function reverseGoogle(float $lat, float $lon): array
    {
        $key = (string) config('services.google_maps.api_key');
        if ($key === '') {
            return [];
        }
        try {
            $response = Http::timeout(8)->get('https://maps.googleapis.com/maps/api/geocode/json', [
                'latlng' => $lat . ',' . $lon,
                'language' => 'en',
                'key' => $key,
            ]);
            if (! $response->successful()) {
                return [];
            }
            $json = $response->json();
            if (($json['status'] ?? '') !== 'OK' || empty($json['results'])) {
                return [];
            }
            $candidates = [];
            $division = null;
            $district = null;
            $upazila = null;
            foreach ($json['results'] as $result) {
                $map = [];
                foreach ($result['address_components'] ?? [] as $comp) {
                    $long = $comp['long_name'] ?? '';
                    foreach ($comp['types'] ?? [] as $type) {
                        $map[$type] = $long;
                    }
                }
                $division = $division ?: ($map['administrative_area_level_1'] ?? null);
                $district = $district ?: ($map['administrative_area_level_2'] ?? null);
                $upa = $map['administrative_area_level_3']
                    ?? $map['administrative_area_level_4']
                    ?? $map['sublocality_level_1']
                    ?? $map['sublocality']
                    ?? null;
                if ($upa) {
                    $candidates[] = $upa;
                    $upazila = $upazila ?: $upa;
                }
                foreach (['locality', 'neighborhood', 'political', 'sublocality_level_2'] as $k) {
                    if (! empty($map[$k])) {
                        $candidates[] = $map[$k];
                    }
                }
                if (! empty($result['formatted_address'])) {
                    $candidates[] = $result['formatted_address'];
                }
            }

            return [
                'division' => $division,
                'district' => $district,
                'upazila' => $upazila,
                'display' => $json['results'][0]['formatted_address'] ?? null,
                'candidates' => $candidates,
            ];
        } catch (\Throwable $e) {
            return [];
        }
    }

    private function reverseNominatim(float $lat, float $lon): array
    {
        try {
            $response = Http::timeout(6)
                ->withHeaders(['User-Agent' => 'FolikaAgriculture/1.0'])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'lat' => $lat,
                    'lon' => $lon,
                    'format' => 'json',
                    'addressdetails' => 1,
                    'zoom' => 14,
                    'accept-language' => 'en,bn',
                ]);
            if (! $response->successful()) {
                return [];
            }
            $json = $response->json();
            $addr = $json['address'] ?? [];
            $keys = [
                'municipality', 'city_district', 'suburb', 'town', 'village', 'hamlet',
                'neighbourhood', 'quarter', 'city', 'county', 'state_district', 'state',
            ];
            $candidates = [];
            foreach ($keys as $k) {
                if (! empty($addr[$k])) {
                    $candidates[] = $addr[$k];
                }
            }
            if (! empty($json['display_name'])) {
                $candidates[] = $json['display_name'];
            }

            return [
                'division' => $addr['state'] ?? $addr['region'] ?? null,
                'district' => $addr['county'] ?? $addr['state_district'] ?? $addr['city_district'] ?? null,
                'upazila' => $addr['municipality'] ?? $addr['town'] ?? $addr['suburb'] ?? $addr['village'] ?? null,
                'display' => $json['display_name'] ?? null,
                'candidates' => $candidates,
            ];
        } catch (\Throwable $e) {
            return [];
        }
    }
}
