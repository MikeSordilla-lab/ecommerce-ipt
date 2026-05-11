-- Product seed data using images already in uploads/products/Products/
-- Run after database.sql has created the schema.

START TRANSACTION;

INSERT INTO users (username, email, password_hash, role, is_approved)
SELECT 'seed_seller', 'seed_seller@shop.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seller', 1
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'seed_seller@shop.com'
);

INSERT INTO categories (name)
SELECT category_name
FROM (
    SELECT 'Processors' AS category_name
    UNION ALL SELECT 'Graphics Cards'
    UNION ALL SELECT 'Memory'
    UNION ALL SELECT 'Storage'
    UNION ALL SELECT 'Monitors'
    UNION ALL SELECT 'Peripherals'
) AS seed_categories
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE categories.name = seed_categories.category_name
);

SET @seed_seller_id = (SELECT id FROM users WHERE email = 'seed_seller@shop.com' LIMIT 1);
SET @processors_id = (SELECT id FROM categories WHERE name = 'Processors' LIMIT 1);
SET @graphics_id = (SELECT id FROM categories WHERE name = 'Graphics Cards' LIMIT 1);
SET @memory_id = (SELECT id FROM categories WHERE name = 'Memory' LIMIT 1);
SET @storage_id = (SELECT id FROM categories WHERE name = 'Storage' LIMIT 1);
SET @monitors_id = (SELECT id FROM categories WHERE name = 'Monitors' LIMIT 1);
SET @peripherals_id = (SELECT id FROM categories WHERE name = 'Peripherals' LIMIT 1);

DELETE FROM products
WHERE image_path LIKE '/uploads/products/Products/%';

INSERT INTO products (category_id, seller_id, name, description, price, stock, image_path, is_active)
VALUES
(@processors_id, @seed_seller_id, 'Intel Core i3-13100F', 'Entry-level Intel processor for budget gaming and everyday desktop builds.', 109.99, 18, '/uploads/products/Products/Intel Core i3-13100F.jpg', 1),
(@processors_id, @seed_seller_id, 'Intel Core i5-13400F', 'Mainstream Intel CPU with strong multi-core performance for gaming and productivity.', 189.99, 15, '/uploads/products/Products/Intel Core i5-13400F.jpg', 1),
(@processors_id, @seed_seller_id, 'Intel Core i5-13600K', 'Unlocked Intel processor built for high-refresh gaming and creator workloads.', 289.99, 12, '/uploads/products/Products/Intel Core i5-13600K.jpg', 1),
(@processors_id, @seed_seller_id, 'Intel Core i7-13700K', 'High-performance Intel CPU for demanding games, streaming, and heavy multitasking.', 389.99, 10, '/uploads/products/Products/Intel Core i7-13700K.jpg', 1),
(@processors_id, @seed_seller_id, 'Intel Core i9-13900K', 'Flagship Intel processor with top-tier performance for enthusiasts and creators.', 529.99, 7, '/uploads/products/Products/Intel Core i9-13900K.jpg', 1),
(@processors_id, @seed_seller_id, 'AMD Ryzen 5 5600G', 'AMD desktop processor with integrated Radeon graphics for compact PC builds.', 129.99, 16, '/uploads/products/Products/AMD Ryzen 5 5600G.jpg', 1),
(@processors_id, @seed_seller_id, 'AMD Ryzen 5 7600X', 'Fast Zen processor for modern gaming rigs and responsive daily computing.', 229.99, 14, '/uploads/products/Products/AMD Ryzen 5 7600X.jpg', 1),
(@processors_id, @seed_seller_id, 'AMD Ryzen 7 7700X', 'Eight-core AMD processor suited for gaming, editing, and productivity.', 329.99, 9, '/uploads/products/Products/AMD Ryzen 7 7700X.jpg', 1),
(@processors_id, @seed_seller_id, 'AMD Ryzen 7 7800X3D', 'Gaming-focused AMD processor with 3D V-Cache for excellent frame rates.', 409.99, 8, '/uploads/products/Products/AMD Ryzen 7 7800X3D.jpg', 1),
(@processors_id, @seed_seller_id, 'AMD Ryzen 9 7950X', 'Premium AMD processor for heavy creative, development, and multitasking workloads.', 549.99, 6, '/uploads/products/Products/AMD Ryzen 9 7950X.jpg', 1),

(@graphics_id, @seed_seller_id, 'Graphics Card GTX 1660 Super', 'Reliable 1080p graphics card for esports and casual gaming.', 189.99, 11, '/uploads/products/Products/Graphics Card GTX 1660 Super.jpg', 1),
(@graphics_id, @seed_seller_id, 'Graphics Card RTX 3050', 'Entry RTX card with ray tracing and DLSS support for modern games.', 229.99, 13, '/uploads/products/Products/Graphics Card RTX 3050.jpg', 1),
(@graphics_id, @seed_seller_id, 'Graphics Card RTX 4060', 'Efficient 1080p gaming graphics card with current-generation NVIDIA features.', 299.99, 10, '/uploads/products/Products/Graphics Card RTX 4060.jpg', 1),
(@graphics_id, @seed_seller_id, 'Graphics Card RTX 4060 Ti', 'Midrange NVIDIA graphics card for high-FPS 1080p and smooth 1440p gaming.', 399.99, 8, '/uploads/products/Products/Graphics Card RTX 4060 Ti.jpg', 1),
(@graphics_id, @seed_seller_id, 'Graphics Card RTX 4070', 'Powerful NVIDIA GPU for 1440p gaming, streaming, and creative apps.', 599.99, 6, '/uploads/products/Products/Graphics Card RTX 4070.jpg', 1),
(@graphics_id, @seed_seller_id, 'Graphics Card RTX 4080', 'High-end graphics card for 4K gaming and accelerated creative workloads.', 999.99, 4, '/uploads/products/Products/Graphics Card RTX 4080.jpg', 1),
(@graphics_id, @seed_seller_id, 'Graphics Card RTX 4090', 'Enthusiast graphics card for extreme gaming, rendering, and AI workloads.', 1699.99, 3, '/uploads/products/Products/Graphics Card RTX 4090.jpg', 1),
(@graphics_id, @seed_seller_id, 'Graphics Card RX 7700', 'AMD Radeon graphics card for fast 1440p gaming and smooth visuals.', 399.99, 7, '/uploads/products/Products/Graphics Card RX 7700.jpg', 1),
(@graphics_id, @seed_seller_id, 'Graphics Card RX 7800 XT', 'AMD GPU tuned for high-performance 1440p gaming systems.', 499.99, 6, '/uploads/products/Products/Graphics Card RX 7800 XT.jpg', 1),
(@graphics_id, @seed_seller_id, 'Graphics Card RX 7900 XTX', 'Premium Radeon graphics card for 4K gaming and advanced creator workflows.', 949.99, 4, '/uploads/products/Products/Graphics Card RX 7900 XTX.jpg', 1),

(@memory_id, @seed_seller_id, 'Crucial Ballistix 16GB DDR4', 'Dependable 16GB DDR4 memory kit for gaming and everyday multitasking.', 49.99, 22, '/uploads/products/Products/''Crucial Ballistix 16GB DDR4.jpg', 1),
(@memory_id, @seed_seller_id, 'Corsair Vengeance 32GB DDR4', 'High-capacity DDR4 memory kit for gaming PCs and creator builds.', 79.99, 18, '/uploads/products/Products/Corsair Vengeance 32GB DDR4.jpg', 1),
(@memory_id, @seed_seller_id, 'G.Skill Trident Z 16GB DDR4', 'Performance DDR4 memory with a clean enthusiast look.', 64.99, 17, '/uploads/products/Products/G.Skill Trident Z 16GB DDR4.jpg', 1),
(@memory_id, @seed_seller_id, 'Kingston Fury Beast 32GB DDR5', 'Fast 32GB DDR5 memory kit for modern desktop platforms.', 119.99, 15, '/uploads/products/Products/Kingston Fury Beast 32GB DDR5.jpg', 1),
(@memory_id, @seed_seller_id, 'TeamGroup T-Force Delta RGB 32GB', 'RGB memory kit with generous capacity for gaming and streaming setups.', 109.99, 14, '/uploads/products/Products/TeamGroup T-Force Delta RGB 32GB.jpg', 1),

(@storage_id, @seed_seller_id, 'Kingston NV2 1TB SSD', 'Fast 1TB NVMe SSD for quick boot times and responsive storage.', 59.99, 24, '/uploads/products/Products/Kingston NV2 1TB SSD.jpg', 1),
(@storage_id, @seed_seller_id, 'Samsung 970 EVO 1TB SSD', 'Reliable Samsung NVMe SSD for games, applications, and project files.', 89.99, 18, '/uploads/products/Products/Samsung 970 EVO 1TB SSD.jpg', 1),
(@storage_id, @seed_seller_id, 'Samsung 980 PRO 2TB SSD', 'High-speed 2TB NVMe SSD for premium gaming and workstation builds.', 159.99, 12, '/uploads/products/Products/Samsung 980 PRO 2TB SSD.jpg', 1),
(@storage_id, @seed_seller_id, 'WD Blue 2TB HDD', 'Large-capacity hard drive for media, backups, and bulk storage.', 54.99, 20, '/uploads/products/Products/WD Blue 2TB HDD.jpg', 1),

(@monitors_id, @seed_seller_id, 'Gaming Monitor 144Hz', 'Responsive gaming monitor with smooth 144Hz refresh for competitive play.', 179.99, 13, '/uploads/products/Products/Gaming Monitor 144Hz.jpg', 1),
(@monitors_id, @seed_seller_id, 'ASUS ROG Swift 27 Inch 144Hz', 'Premium 27-inch gaming display with smooth motion and sharp visuals.', 349.99, 7, '/uploads/products/Products/ASUS ROG Swift 27 Inch 144Hz.jpg', 1),
(@monitors_id, @seed_seller_id, 'LG UltraGear 32 Inch 165Hz', 'Large 32-inch gaming monitor with a fast 165Hz refresh rate.', 399.99, 6, '/uploads/products/Products/LG UltraGear 32 Inch 165Hz.jpg', 1),
(@monitors_id, @seed_seller_id, 'MSI Optix 24 Inch 165Hz', 'Compact high-refresh monitor for smooth gaming desks.', 219.99, 9, '/uploads/products/Products/MSI Optix 24 Inch 165Hz.jpg', 1),
(@monitors_id, @seed_seller_id, 'Samsung Odyssey G5 27 Inch', 'Immersive 27-inch gaming monitor with sharp detail and fluid motion.', 279.99, 8, '/uploads/products/Products/Samsung Odyssey G5 27 Inch.jpg', 1),

(@peripherals_id, @seed_seller_id, 'Corsair K95 RGB Platinum', 'Mechanical RGB keyboard with premium controls for gaming setups.', 149.99, 11, '/uploads/products/Products/Corsair K95 RGB Platinum.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Razer BlackWidow Keyboard', 'Tactile gaming keyboard with responsive switches and RGB lighting.', 129.99, 12, '/uploads/products/Products/Razer BlackWidow Keyboard.jpg', 1),
(@peripherals_id, @seed_seller_id, 'SteelSeries Apex Pro Keyboard', 'Adjustable-switch gaming keyboard for precise control and speed.', 179.99, 8, '/uploads/products/Products/SteelSeries Apex Pro Keyboard.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Logitech G915 Wireless Keyboard', 'Low-profile wireless gaming keyboard with premium build quality.', 199.99, 7, '/uploads/products/Products/Logitech G915 Wireless Keyboard.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Mechanical Gaming Keyboard', 'Durable mechanical keyboard for gaming and daily typing.', 79.99, 16, '/uploads/products/Products/Mechanical Gaming Keyboard.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Wireless Gaming Mouse', 'Lightweight wireless mouse designed for smooth gaming performance.', 49.99, 20, '/uploads/products/Products/Wireless Gaming Mouse.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Glorious Model O', 'Ultra-light gaming mouse built for fast, precise aiming.', 59.99, 14, '/uploads/products/Products/Glorious Model O.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Logitech G305 Wireless Mouse', 'Compact wireless gaming mouse with long battery life.', 44.99, 19, '/uploads/products/Products/Logitech G305 Wireless Mouse.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Razer DeathAdder V3', 'Ergonomic gaming mouse with precise sensor tracking.', 69.99, 15, '/uploads/products/Products/Razer DeathAdder V3.jpg', 1),
(@peripherals_id, @seed_seller_id, 'SteelSeries Rival 5', 'Versatile gaming mouse with programmable controls.', 54.99, 13, '/uploads/products/Products/SteelSeries Rival 5.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Gaming Headset RGB', 'Comfortable RGB headset with clear audio for gaming sessions.', 59.99, 17, '/uploads/products/Products/Gaming Headset RGB.jpg', 1),
(@peripherals_id, @seed_seller_id, 'HyperX Cloud II Headset', 'Comfort-focused gaming headset with strong sound isolation.', 89.99, 12, '/uploads/products/Products/HyperX Cloud II Headset.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Logitech G Pro X Headset', 'Pro-style gaming headset with clear microphone performance.', 119.99, 9, '/uploads/products/Products/Logitech G Pro X Headset.jpg', 1),
(@peripherals_id, @seed_seller_id, 'SteelSeries Arctis 7 Headset', 'Wireless gaming headset with balanced sound and comfortable fit.', 129.99, 8, '/uploads/products/Products/SteelSeries Arctis 7 Headset.jpg', 1),
(@peripherals_id, @seed_seller_id, 'Logitech C920 HD Webcam', 'HD webcam for streaming, meetings, and content creation.', 69.99, 16, '/uploads/products/Products/Logitech C920 HD Webcam.jpg', 1);

COMMIT;
