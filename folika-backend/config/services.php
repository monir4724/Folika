<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | FOLIKA External Integrations
    |--------------------------------------------------------------------------
    */

    'openweather' => [
        'api_key' => env('OPENWEATHER_API_KEY', 'mock_openweather_api_key'),
    ],

    'google_maps' => [
        'api_key' => env('GOOGLE_MAPS_API_KEY', ''),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY', 'mock_gemini_api_key'),
    ],

    'groq' => [
        'api_key' => env('GROQ_API_KEY', 'mock_groq_api_key'),
        'vision_model' => env('GROQ_VISION_MODEL', 'llama-3.2-90b-vision-preview'),
    ],

    'firebase' => [
        'server_key' => env('FIREBASE_SERVER_KEY', 'mock_fcm_key'),
        'project_id' => env('FIREBASE_PROJECT_ID', 'folika-app'),
    ],

    'ssl_wireless' => [
        'api_token' => env('SSL_WIRELESS_API_TOKEN', 'mock_ssl_token'),
        'sid' => env('SSL_WIRELESS_SID', 'mock_ssl_sid'),
        'url' => env('SSL_WIRELESS_URL', 'https://smsplus.sslwireless.com/api/v3/send-sms'),
    ],

];
