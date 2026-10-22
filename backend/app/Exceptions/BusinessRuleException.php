<?php

namespace App\Exceptions;

use Exception;

/**
 * Thrown when a request breaks a business rule (insufficient stock, overpayment, etc).
 * Rendered as HTTP 422 with the message, instead of a 500.
 */
class BusinessRuleException extends Exception
{
}
