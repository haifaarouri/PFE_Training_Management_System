<?php

namespace App\Rules;

use App\Enums\CandidatType;
use Illuminate\Contracts\Validation\Rule;

class CandidatTypeRule implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $allowed_types = CandidatType::all();
        return in_array($value, $allowed_types);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'le type du candidat est invalide !';
    }
}
