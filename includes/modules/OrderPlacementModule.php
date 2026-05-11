<?php

class OrderPlacementModule
{
    public function placeOrder(PDO $pdo, int $userId, array $cartItems, array $shippingAddress, ?string $notes = null): array
    {
        try {
            $pdo->beginTransaction();

            $total = $this->calculateOrderTotal($cartItems);
            $shippingAddressJson = json_encode($shippingAddress);

            $stmt = $pdo->prepare("INSERT INTO orders (user_id, total, shipping_address, notes, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())");
            $stmt->execute([$userId, $total, $shippingAddressJson, $notes]);
            $orderId = (int) $pdo->lastInsertId();

            $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity) VALUES (?, ?, ?, ?, ?)");
            $stmtStock = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");

            foreach ($cartItems as $item) {
                $stmtItem->execute([$orderId, $item['product_id'], $item['name'], $item['price'], $item['quantity']]);

                $affected = $stmtStock->execute([$item['quantity'], $item['product_id'], $item['quantity']]);
                if ($affected === 0) {
                    throw new Exception("Insufficient stock for product: " . ($item['name'] ?? $item['product_id']));
                }
            }

            $stmtCart = $pdo->prepare("DELETE FROM cart_items WHERE user_id = ?");
            $stmtCart->execute([$userId]);

            $pdo->commit();

            return ['success' => true, 'order_id' => $orderId, 'message' => 'Order placed successfully'];
        } catch (Exception $e) {
            $pdo->rollBack();
            return ['success' => false, 'order_id' => null, 'message' => 'Order placement failed: ' . $e->getMessage()];
        }
    }

    public function validateStockAvailability(PDO $pdo, array $cartItems): array
    {
        $errors = [];

        $stmt = $pdo->prepare("SELECT id, stock, name FROM products WHERE id = ?");

        foreach ($cartItems as $item) {
            $stmt->execute([$item['product_id']]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                $errors[] = "Product not found: " . ($item['name'] ?? $item['product_id']);
                continue;
            }

            if ((int) $product['stock'] < (int) $item['quantity']) {
                $errors[] = "Insufficient stock for '{$product['name']}'. Available: {$product['stock']}, Requested: {$item['quantity']}";
            }
        }

        return ['valid' => empty($errors), 'errors' => $errors];
    }

    public function calculateOrderTotal(array $cartItems): float
    {
        $total = 0.0;
        foreach ($cartItems as $item) {
            $total += (float) $item['price'] * (int) $item['quantity'];
        }
        return round($total, 2);
    }

    public function parseShippingAddress(string $json): array
    {
        $data = json_decode($json, true);

        if (!is_array($data)) {
            return [
                'full_name' => '',
                'phone' => '',
                'address' => ''
            ];
        }

        return [
            'full_name' => $data['full_name'] ?? '',
            'phone' => $data['phone'] ?? '',
            'address' => $data['address'] ?? ''
        ];
    }
}