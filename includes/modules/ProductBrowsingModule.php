<?php
require_once __DIR__ . '/../ImageHelper.php';

class ProductBrowsingModule
{
    public function getProducts(PDO $pdo, array $filters = [], int $page = 1, int $perPage = 12): array
    {
        $conditions = ['p.is_active = :is_active'];
        $params = ['is_active' => 1];

        if (!empty($filters['category_id'])) {
            $conditions[] = 'p.category_id = :category_id';
            $params['category_id'] = $filters['category_id'];
        }

        if (!empty($filters['seller_id'])) {
            $conditions[] = 'p.seller_id = :seller_id';
            $params['seller_id'] = $filters['seller_id'];
        }

        if (!empty($filters['search'])) {
            $conditions[] = '(p.name LIKE :search_name OR p.description LIKE :search_desc)';
            $params['search_name'] = '%' . $filters['search'] . '%';
            $params['search_desc'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['price_range'])) {
            switch ($filters['price_range']) {
                case 'under100':
                    $conditions[] = 'p.price < 100';
                    break;
                case 'under1000':
                    $conditions[] = 'p.price < 1000';
                    break;
                case 'under25':
                    $conditions[] = 'p.price < 25';
                    break;
                case '100to250':
                    $conditions[] = 'p.price BETWEEN 100 AND 250';
                    break;
                case '25to50':
                    $conditions[] = 'p.price BETWEEN 25 AND 50';
                    break;
                case '250to500':
                    $conditions[] = 'p.price BETWEEN 250 AND 500';
                    break;
                case '1000to5000':
                    $conditions[] = 'p.price BETWEEN 1000 AND 5000';
                    break;
                case '5000to15000':
                    $conditions[] = 'p.price BETWEEN 5000 AND 15000';
                    break;
                case '50to100':
                    $conditions[] = 'p.price BETWEEN 50 AND 100';
                    break;
                case 'over500':
                    $conditions[] = 'p.price > 500';
                    break;
                case 'over100':
                    $conditions[] = 'p.price > 100';
                    break;
                case 'over15000':
                    $conditions[] = 'p.price > 15000';
                    break;
            }
        }

        $whereClause = implode(' AND ', $conditions);

        $countSql = "SELECT COUNT(*) FROM products p WHERE $whereClause";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $totalPages = (int) ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;

        $params['limit'] = (int) $perPage;
        $params['offset'] = (int) $offset;

        $sql = "SELECT p.*, c.name AS category_name, u.username AS seller_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                JOIN users u ON p.seller_id = u.id
                WHERE $whereClause
                ORDER BY p.created_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($products as &$product) {
            $product['image_path'] = ImageHelper::resolveProductImage($product['image_path'] ?? null);
        }
        unset($product);

        return [
            'products' => $products,
            'total' => $total,
            'total_pages' => $totalPages
        ];
    }

    public function getProductById(PDO $pdo, int $productId): ?array
    {
        $sql = "SELECT p.*, c.name AS category_name, u.username AS seller_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                JOIN users u ON p.seller_id = u.id
                WHERE p.id = :product_id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute(['product_id' => $productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        return $product ?: null;
    }

    public function getActiveProductsBySeller(PDO $pdo, int $sellerId): array
    {
        $sql = "SELECT p.*, c.name AS category_name, u.username AS seller_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                JOIN users u ON p.seller_id = u.id
                WHERE p.seller_id = :seller_id AND p.is_active = :is_active
                ORDER BY p.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute(['seller_id' => $sellerId, 'is_active' => 1]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllProducts(PDO $pdo, array $filters = []): array
    {
        $conditions = [];
        $params = [];

        if (!empty($filters['category_id'])) {
            $conditions[] = 'p.category_id = :category_id';
            $params['category_id'] = $filters['category_id'];
        }

        if (!empty($filters['seller_id'])) {
            $conditions[] = 'p.seller_id = :seller_id';
            $params['seller_id'] = $filters['seller_id'];
        }

        if (!empty($filters['search'])) {
            $conditions[] = '(p.name LIKE :search_name OR p.description LIKE :search_desc)';
            $params['search_name'] = '%' . $filters['search'] . '%';
            $params['search_desc'] = '%' . $filters['search'] . '%';
        }

        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $sql = "SELECT p.*, c.name AS category_name, u.username AS seller_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                JOIN users u ON p.seller_id = u.id
                $whereClause
                ORDER BY p.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function searchProducts(PDO $pdo, string $query, int $limit = 10): array
    {
        $sql = "SELECT p.id, p.name
                FROM products p
                WHERE p.is_active = :is_active
                AND p.name LIKE :query
                ORDER BY p.name ASC
                LIMIT :limit";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'is_active' => 1,
            'query' => '%' . $query . '%',
            'limit' => $limit
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
