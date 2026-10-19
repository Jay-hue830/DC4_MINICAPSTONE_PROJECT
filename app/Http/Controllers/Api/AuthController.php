<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data): User {
            $user = User::query()->create([
                'name' => trim($data['first_name'].' '.$data['last_name']),
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => User::ROLE_SENIOR_CITIZEN,
            ]);

            $user->seniorCitizen()->create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'birth_date' => $data['birth_date'],
                'sex' => $data['sex'],
                'contact_number' => $data['contact_number'],
                'address' => $data['address'],
                'barangay' => $data['barangay'],
            ]);

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $token = $user->createToken($request->validated('device_name') ?? 'auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        // Revoke only the token used for this request.
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ], 200);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ], 200);
    }
}
