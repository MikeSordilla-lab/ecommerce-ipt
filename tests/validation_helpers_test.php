<?php
require_once __DIR__ . '/../includes/ValidationHelper.php';

$failures = [];

function expect_same($expected, $actual, string $label): void
{
    global $failures;
    if ($expected !== $actual) {
        $failures[] = $label . ' expected ' . var_export($expected, true) . ' got ' . var_export($actual, true);
    }
}

expect_same([], validate_password_strength('abc12345'), 'valid password');
expect_same(['Password must be at least 8 characters.'], validate_password_strength('abc123'), 'short password');
expect_same(['Password must include at least one number.'], validate_password_strength('abcdefgh'), 'missing number');
expect_same(['Password must include at least one letter.'], validate_password_strength('12345678'), 'missing letter');
expect_same([
    'Password must be at least 8 characters.',
    'Password must include at least one number.',
], validate_password_strength('abcdefg'), 'multiple password errors');

expect_same('+639171234567', normalize_ph_mobile('09171234567'), 'local mobile normalization');
expect_same('+639171234567', normalize_ph_mobile('+639171234567'), 'international mobile normalization');
expect_same('+639171234567', normalize_ph_mobile('0917 123 4567'), 'spaced mobile normalization');
expect_same('+639171234567', normalize_ph_mobile('0917-123-4567'), 'hyphenated mobile normalization');
expect_same(null, normalize_ph_mobile('021234567'), 'invalid landline rejected');
expect_same(null, normalize_ph_mobile('+638171234567'), 'invalid prefix rejected');

if ($failures) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo "Validation helper tests passed." . PHP_EOL;
