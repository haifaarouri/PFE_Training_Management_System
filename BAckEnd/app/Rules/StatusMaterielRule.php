<?php

namespace App\Rules;

use App\Enums\StatusMateriel;
use Illuminate\Contracts\Validation\Rule;

class StatusMaterielRule implements Rule
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
        $allowed_status = StatusMateriel::all();
        return in_array($value, $allowed_status);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'L\'état du matériel est invalide !';
    }
}
