<?php
require_once __DIR__ . '/../ImageHelper.php';

class WishlistModule
{
    public static function ensureTable(PDO $pdo): void
    {
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS wishlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_wishlist_item (user_id, product_id),
                INDEX idx_wishlists_user (user_id),
                INDEX idx_wishlists_product (product_id)
            )"
        );
    }

    public function toggle(PDO $pdo, int $userId, int $productId): array
    {
        self::ensureTable($pdo);

        $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ? AND is_active = 1');
        $stmt->execute([$productId]);
        if (!$stmt->fetch()) {
            return ['success' => false, 'wishlisted' => false, 'message' => 'Product not found'];
        }

        $stmt = $pdo->prepare('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$userId, $productId]);
        $existing = $stmt->fetch();

        if ($existing) {
            $stmt = $pdo->prepare('DELETE FROM wishlists WHERE id = ? AND user_id = ?');
            $stmt->execute([$existing['id'], $userId]);
            return ['success' => true, 'wishlisted' => false, 'message' => 'Removed from wishlist'];
        }

        $stmt = $pdo->prepare('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)');
        $stmt->execute([$userId, $productId]);
        return ['success' => true, 'wishlisted' => true, 'message' => 'Added to wishlist'];
    }

    public function getProductIds(PDO $pdo, int $userId): array
    {
        self::ensureTable($pdo);
        $stmt = $pdo->prepare('SELECT product_id FROM wishlists WHERE user_id = ?');
        $stmt->execute([$userId]);
        return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
    }

    public function getItems(PDO $pdo, int $userId): array
    {
        self::ensureTable($pdo);
        $stmt = $pdo->prepare(
            'SELECT w.id AS wishlist_id, p.*, c.name AS category_name, u.username AS seller_name
             FROM wishlists w
             JOIN products p ON p.id = w.product_id
             JOIN categories c ON c.id = p.category_id
             LEFT JOIN users u ON u.id = p.seller_id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC'
        );
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['image_path'] = ImageHelper::resolveProductImage($item['image_path'] ?? null);
        }
        unset($item);

        return $items;
    }
}
