<?php
require_once __DIR__ . '/../utils/db.php';

$db = Database::getInstance();

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $uri = $_SERVER['REQUEST_URI'];
    $normalizedUri = str_replace('/api/app.php', '', $uri);
    $parts = explode('/', $normalizedUri);
    $shoeId = $parts[3] ?? null;
    if (!$shoeId || !is_numeric($shoeId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid shoeId']);
        exit;
    }
    //echo "ShoeId: " . $shoeId . "\n";

    // Fetch main product data
    $product = $db->fetch("
        SELECT 
            P.shoeId,
            P.brand,
            P.gender,
            P.category,
            P.description,
            P.price,
            P.discount,
            P.sku,
            P.color,
            P.weight,
            P.url,
            COALESCE(AVG(R.rating), 0) AS rating
        FROM PRODUCTS P
        LEFT JOIN RATING R ON P.shoeId = R.shoeId
        WHERE P.shoeId = :shoeId
        GROUP BY P.shoeId
    ", [':shoeId' => $shoeId]);

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }

    // Fetch size/quantity info
    $sizes = $db->fetchAll("
        SELECT size, quantity
        FROM PRODUCT_SIZES
        WHERE shoeId = :shoeId
        ORDER BY size ASC
    ", [':shoeId' => $shoeId]);

    $formattedSizes = array_map(function ($row) {
        return [
            'size' => (int) $row['size'],
            'quantity' => (int) $row['quantity']
        ];
    }, $sizes);

    // Final format
    $result = [
        'shoeId'     => (int) $product['shoeId'],
        'brand'      => $product['brand'],
        'gender'     => $product['gender'],
        'category'   => $product['category'],
        'description' => $product['description'],
        'price'      => (float) $product['price'],
        'discount'   => (int) $product['discount'],
        'sizes'      => $formattedSizes,
        'sku'        => $product['sku'],
        'rating'     => (float) $product['rating'],
        'color'      => $product['color'],
        'weight'     => $product['weight'],
        'url'        => $product['url'],
    ];

    echo json_encode([
        'message' => 'Product fetched successfully',
        'product' => $result
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
