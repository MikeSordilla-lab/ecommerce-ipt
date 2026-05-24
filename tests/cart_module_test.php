<?php

require_once __DIR__ . '/../includes/modules/CartModule.php';

$failures = [];

function expect_same($expected, $actual, string $label): void
{
    global $failures;
    if ($expected !== $actual) {
        $failures[] = $label . ' expected ' . var_export($expected, true) . ' got ' . var_export($actual, true);
    }
}

$pdo = new PDO('sqlite::memory:');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

$pdo->exec('CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL, stock INTEGER, image_path TEXT, is_active INTEGER)');
$pdo->exec('CREATE TABLE cart_items (id INTEGER PRIMARY KEY, user_id INTEGER, product_id INTEGER, quantity INTEGER)');

$pdo->exec("INSERT INTO products (id, name, price, stock, image_path, is_active) VALUES
    (1, 'Limited CPU', 100, 2, NULL, 1),
    (2, 'Sold Out GPU', 200, 0, NULL, 1),
    (3, 'Inactive RAM', 50, 5, NULL, 0)");
$pdo->exec("INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES
    (1, 7, 1, 5),
    (2, 7, 2, 1),
    (3, 7, 3, 1)");

$cart = new CartModule();
$messages = $cart->reconcileStock($pdo, 7);

expect_same(3, count($messages), 'stock reconciliation messages');

$items = $pdo->query('SELECT product_id, quantity FROM cart_items WHERE user_id = 7 ORDER BY product_id')->fetchAll();
expect_same([['product_id' => 1, 'quantity' => 2]], $items, 'cart reconciled to available stock');

if ($failures) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo "Cart module tests passed." . PHP_EOL;
