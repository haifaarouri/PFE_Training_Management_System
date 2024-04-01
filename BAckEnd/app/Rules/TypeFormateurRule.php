<?php

namespace App\Rules;

use App\Enums\TypeFormateur;
use Illuminate\Contracts\Validation\Rule;

class TypeFormateurRule implements Rule
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
        $allowed_types = TypeFormateur::all();
        return in_array($value, $allowed_types);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'Le type de formateur est invalide !';
    }
}
