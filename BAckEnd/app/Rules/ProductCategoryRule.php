<?php

namespace App\Rules;

use App\Enums\ProductCategory;
use Illuminate\Contracts\Validation\Rule;

class ProductCategoryRule implements Rule
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
        $allowed_categories = ProductCategory::all();
        return in_array($value, $allowed_categories);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'Le champs catégrie est invalide !';
    }
}