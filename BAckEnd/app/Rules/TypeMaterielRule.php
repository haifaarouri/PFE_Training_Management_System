<?php

namespace App\Rules;

use App\Enums\TypeMateriel;
use Illuminate\Contracts\Validation\Rule;

class TypeMaterielRule implements Rule
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
        $allowed_types = TypeMateriel::all();
        return in_array($value, $allowed_types);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'Type du matériel est invalide !';
    }
}
