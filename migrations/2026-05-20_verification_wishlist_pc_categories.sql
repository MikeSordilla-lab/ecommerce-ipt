-- Apply to existing databases before using the verification/wishlist release.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified_at DATETIME NULL AFTER is_approved,
    ADD COLUMN IF NOT EXISTS verification_token_hash CHAR(64) NULL AFTER email_verified_at,
    ADD COLUMN IF NOT EXISTS verification_token_expires_at DATETIME NULL AFTER verification_token_hash;

UPDATE users
SET email_verified_at = COALESCE(email_verified_at, NOW())
WHERE email_verified_at IS NULL
  AND verification_token_hash IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token_hash);

CREATE TABLE IF NOT EXISTS wishlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_item (user_id, product_id),
    INDEX idx_wishlists_user (user_id),
    INDEX idx_wishlists_product (product_id)
);

INSERT INTO categories (name)
SELECT pc.name
FROM (
    SELECT 'Processors' AS name
    UNION ALL SELECT 'Graphics Cards'
    UNION ALL SELECT 'Memory'
    UNION ALL SELECT 'Storage'
    UNION ALL SELECT 'Motherboards'
    UNION ALL SELECT 'Power Supplies'
    UNION ALL SELECT 'Cases'
    UNION ALL SELECT 'Cooling'
    UNION ALL SELECT 'Monitors'
    UNION ALL SELECT 'Peripherals'
    UNION ALL SELECT 'Uncategorized PC Parts'
) pc
WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.name = pc.name);

SET @uncategorized_pc_id = (SELECT id FROM categories WHERE name = 'Uncategorized PC Parts' LIMIT 1);

UPDATE products p
JOIN categories c ON c.id = p.category_id
SET p.category_id = @uncategorized_pc_id
WHERE c.name IN ('Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports');

DELETE c
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
WHERE c.name IN ('Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports')
  AND p.id IS NULL;
