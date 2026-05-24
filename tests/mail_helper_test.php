<?php

define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_USERNAME', 'sender@example.com');
define('MAIL_PASSWORD', 'abcd efgh ijkl mnop');

require_once __DIR__ . '/../includes/MailHelper.php';

$failures = [];

function expect_same($expected, $actual, string $label): void
{
    global $failures;
    if ($expected !== $actual) {
        $failures[] = $label . ' expected ' . var_export($expected, true) . ' got ' . var_export($actual, true);
    }
}

expect_same(true, mail_is_configured(), 'configured mail settings');
expect_same('abcdefghijklmnop', mail_smtp_password(), 'gmail app password spaces stripped');

if ($failures) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo "Mail helper tests passed." . PHP_EOL;
