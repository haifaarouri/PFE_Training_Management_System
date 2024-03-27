<?php

namespace App\Rules;

use App\Enums\StateEnum;
use Illuminate\Contracts\Validation\Rule;

class RoomStateRule implements Rule
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
        $allowed_states = StateEnum::all();
        return in_array($value, $allowed_states);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'Le champs Etat de la Salle est invalide';
    }
}
