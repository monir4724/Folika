<?php

namespace App\Exceptions;

class SmsDeliveryException extends ApiException
{
    public function __construct(string $message = 'Failed to deliver SMS to mobile number.', int $statusCode = 502)
    {
        parent::__construct($message, 'sms_failed', $statusCode);
    }
}
