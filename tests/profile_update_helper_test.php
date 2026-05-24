<?php
require_once __DIR__ . '/../includes/ProfileUpdateHelper.php';

$failures = [];

function expect_same($expected, $actual, string $label): void
{
    global $failures;
    if ($expected !== $actual) {
        $failures[] = $label . ' expected ' . var_export($expected, true) . ' got ' . var_export($actual, true);
    }
}

expect_same([], validate_profile_identity('seller', 'seller@example.com'), 'valid profile identity');
expect_same(['Username is required.'], validate_profile_identity('', 'seller@example.com'), 'missing username');
expect_same(['Username must be at least 3 characters.'], validate_profile_identity('ab', 'seller@example.com'), 'short username');
expect_same(['Email is required.'], validate_profile_identity('seller', ''), 'missing email');
expect_same(['Please enter a valid email address.'], validate_profile_identity('seller', 'bad-email'), 'invalid email');

if ($failures) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo "Profile update helper tests passed." . PHP_EOL;
