<?php

class CartModule
{
    private function resolveDummyJsonImage(string $productName): ?string
    {
        $url = 'https://dummyjson.com/products/search?q=' . urlencode($productName);
        $json = @file_get_contents($url);
        if ($json === false) {
            return null;
        }
        $data = json_decode($json, true);
        if (!is_array($data) || empty($data['products'][0]['thumbnail'])) {
            return null;
        }
        return $data['products'][0]['thumbnail'];
    }

    public function addItem(PDO $pdo, int $userId, int $productId, int $quantity = 1): array
    {
        if ($quantity < 1) {
            return ['success' => false, 'cart_count' => 0, 'message' => 'Quantity must be at least 1'];
        }

        $stmt = $pdo->prepare('SELECT id, stock, is_active FROM products WHERE id = ?');
        $stmt->execute([$productId]);
        $product = $stmt->fetch();

        if (!$product) {
            return ['success' => false, 'cart_count' => $this->getCartCount($pdo, $userId), 'message' => 'Product not found'];
        }

        if (!$product['is_active']) {
            return ['success' => false, 'cart_count' => $this->getCartCount($pdo, $userId), 'message' => 'Product is not available'];
        }

        if ($product['stock'] < $quantity) {
            return ['success' => false, 'cart_count' => $this->getCartCount($pdo, $userId), 'message' => 'Insufficient stock available'];
        }

        $stmt = $pdo->prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$userId, $productId]);
        $existingItem = $stmt->fetch();

        if ($existingItem) {
            $newQuantity = $existingItem['quantity'] + $quantity;

            if ($newQuantity > $product['stock']) {
                return ['success' => false, 'cart_count' => $this->getCartCount($pdo, $userId), 'message' => 'Total quantity exceeds available stock'];
            }

            $stmt = $pdo->prepare('UPDATE cart_items SET quantity = ? WHERE id = ?');
            $stmt->execute([$newQuantity, $existingItem['id']]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)');
            $stmt->execute([$userId, $productId, $quantity]);
        }

        return ['success' => true, 'cart_count' => $this->getCartCount($pdo, $userId), 'message' => 'Item added to cart'];
    }

    public function updateItem(PDO $pdo, int $userId, int $cartItemId, int $quantity): array
    {
        if ($quantity < 1) {
            return ['success' => false, 'new_subtotal' => 0.0, 'message' => 'Quantity must be at least 1'];
        }

        $stmt = $pdo->prepare('
            SELECT ci.id, ci.quantity, ci.product_id, p.stock, p.price, p.is_active
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.id = ? AND ci.user_id = ?
        ');
        $stmt->execute([$cartItemId, $userId]);
        $cartItem = $stmt->fetch();

        if (!$cartItem) {
            return ['success' => false, 'new_subtotal' => 0.0, 'message' => 'Cart item not found'];
        }

        if (!$cartItem['is_active']) {
            return ['success' => false, 'new_subtotal' => 0.0, 'message' => 'Product is no longer available'];
        }

        if ($quantity > $cartItem['stock']) {
            return ['success' => false, 'new_subtotal' => 0.0, 'message' => 'Quantity exceeds available stock'];
        }

        $stmt = $pdo->prepare('UPDATE cart_items SET quantity = ? WHERE id = ?');
        $stmt->execute([$quantity, $cartItemId]);

        $newSubtotal = (float)$cartItem['price'] * $quantity;

        return ['success' => true, 'new_subtotal' => round($newSubtotal, 2), 'message' => 'Cart updated successfully'];
    }

    public function removeItem(PDO $pdo, int $userId, int $cartItemId): array
    {
        $stmt = $pdo->prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?');
        $stmt->execute([$cartItemId, $userId]);

        if ($stmt->rowCount() === 0) {
            return ['success' => false, 'message' => 'Cart item not found'];
        }

        return ['success' => true, 'message' => 'Item removed from cart'];
    }

    public function getCart(PDO $pdo, int $userId): array
    {
        $stmt = $pdo->prepare('
            SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image_path
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        ');
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();

        $cartItems = array_map(function ($item) {
            $item['subtotal'] = (float)$item['price'] * (int)$item['quantity'];
            if (empty($item['image_path'])) {
                $item['image_path'] = $this->resolveDummyJsonImage($item['name']);
            }
            return $item;
        }, $items);

        return $cartItems;
    }

    public function getCartCount(PDO $pdo, int $userId): int
    {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM cart_items WHERE user_id = ?');
        $stmt->execute([$userId]);
        return (int)$stmt->fetchColumn();
    }

    public function getCartSubtotal(array $cartItems): float
    {
        return array_reduce($cartItems, function ($sum, $item) {
            return $sum + ($item['subtotal'] ?? ((float)($item['price'] ?? 0) * (int)($item['quantity'] ?? 0)));
        }, 0.0);
    }
}