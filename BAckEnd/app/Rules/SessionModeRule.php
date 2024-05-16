<?php

namespace App\Rules;

use App\Enums\SessionModeEnum;
use Illuminate\Contracts\Validation\Rule;

class SessionModeRule implements Rule
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
        $allowed_modes = SessionModeEnum::all();
        return in_array($value, $allowed_modes);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'Le champs mode de la session est invalide !';
    }
}
