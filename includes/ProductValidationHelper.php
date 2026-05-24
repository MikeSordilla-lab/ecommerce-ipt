<?php

function validate_product_fields(int $categoryId, string $name, float $price, int $stock): array
{
    $errors = [];
    $name = trim($name);

    if ($categoryId <= 0) {
        $errors[] = "Category is required.";
    }
    if ($name === "" || strlen($name) > 200) {
        $errors[] = "Name is required (max 200 chars).";
    }
    if ($price <= 0 || $price > 999999.99) {
        $errors[] = "Price must be between 0.01 and 999999.99.";
    }
    if ($stock < 0) {
        $errors[] = "Stock cannot be negative.";
    }

    return $errors;
}
