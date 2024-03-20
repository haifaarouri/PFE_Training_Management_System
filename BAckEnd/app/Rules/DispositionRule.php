<?php

namespace App\Rules;

use App\Enums\DispositionEnum;
use Illuminate\Contracts\Validation\Rule;

class DispositionRule implements Rule
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
        $allowed_dispositions = DispositionEnum::all();
        return in_array($value, $allowed_dispositions);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'Le champs Disposition est invalide !';
    }
}
