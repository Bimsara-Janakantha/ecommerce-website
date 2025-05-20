<?php
require_once __DIR__ . '/../utils/db.php';

header('Content-Type: application/json');

$db = Database::getInstance();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $uri = $_SERVER['REQUEST_URI'];
    $normalizedUri = str_replace('/api/app.php', '', $uri);
    $parts = explode('/', $normalizedUri);
    $sellerId = $parts[3] ?? null;

    if (!$sellerId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing sellerId']);
        exit;
    }

    // Validate seller
    $seller = $db->fetch("SELECT * FROM USERS WHERE userId = :id AND role = 'seller'", [
        ':id' => $sellerId
    ]);

    if (!$seller) {
        http_response_code(404);
        echo json_encode(['error' => 'Seller not found']);
        exit;
    }

    // Get all shoes for the seller
    $shoes = $db->fetchAll("
        SELECT shoeId, brand, gender, category, description, price, discount, sku, color, weight, url
        FROM PRODUCTS
        WHERE productStatus = 'available' AND sellerId = :sellerId
        ORDER BY shoeId DESC
    ", [':sellerId' => $sellerId]);

    // Get all stocks for those shoes
    $stocks = $db->fetchAll("
        SELECT ps.shoeId, ps.size, ps.quantity 
        FROM PRODUCT_SIZES ps
        JOIN PRODUCTS p ON p.shoeId = ps.shoeId
        WHERE p.productStatus = 'available' AND p.sellerId = :sellerId
    ", [':sellerId' => $sellerId]);

    // Map stocks to their respective shoeId
    $stockMap = [];
    foreach ($stocks as $stock) {
        $id = $stock['shoeId'];
        if (!isset($stockMap[$id])) $stockMap[$id] = [];
        $stockMap[$id][] = [
            'size' => (int)$stock['size'],
            'quantity' => (int)$stock['quantity']
        ];
    }

    // Attach stocks to each shoe
    foreach ($shoes as &$shoe) {
        $id = $shoe['shoeId'];
        $shoe['price'] = (int)$shoe['price'];
        $shoe['discount'] = (int)$shoe['discount'];
        $shoe['stocks'] = $stockMap[$id] ?? [];
    }

    echo json_encode([
        'shoeList' => $shoes,
        'message' => 'Data found successfully'
    ], JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
