<?php

namespace App\Rules;

use App\Enums\SessionStatusEnum;
use Illuminate\Contracts\Validation\Rule;

class SessionStatusRule implements Rule
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
        $allowed_status = SessionStatusEnum::all();
        return in_array($value, $allowed_status);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'Le champs statut de la session de invalide !';
    }
}
