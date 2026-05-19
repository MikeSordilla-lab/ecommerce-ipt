<?php
require_once __DIR__ . "/../bootstrap.php";

mobile_method(["GET"]);
mobile_require_role($pdo, ["admin"]);

try {
    $stmt = $pdo->query(
        "SELECT o.*, u.username
         FROM orders o
         JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC"
    );
    mobile_success(["orders" => array_map("mobile_order_row", $stmt->fetchAll(PDO::FETCH_ASSOC))]);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
