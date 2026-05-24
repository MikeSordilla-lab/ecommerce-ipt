<?php
require_once __DIR__ . '/../includes/ProductValidationHelper.php';

$failures = [];

function expect_same($expected, $actual, string $label): void
{
    global $failures;
    if ($expected !== $actual) {
        $failures[] = $label . ' expected ' . var_export($expected, true) . ' got ' . var_export($actual, true);
    }
}

expect_same([], validate_product_fields(1, 'Gaming Mouse', 49.99, 12), 'valid product');
expect_same(['Category is required.'], validate_product_fields(0, 'Gaming Mouse', 49.99, 12), 'missing category');
expect_same(['Name is required (max 200 chars).'], validate_product_fields(1, '', 49.99, 12), 'missing name');
expect_same(['Price must be between 0.01 and 999999.99.'], validate_product_fields(1, 'Gaming Mouse', 0, 12), 'invalid price');
expect_same(['Stock cannot be negative.'], validate_product_fields(1, 'Gaming Mouse', 49.99, -1), 'negative stock');

if ($failures) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo "Product validation helper tests passed." . PHP_EOL;
