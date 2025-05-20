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

    //echo "Seller: " . $sellerId . " \t Range: " . $range . "\n";

    if (!$sellerId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing sellerId or range']);
        exit;
    }

    // Validate seller
    $seller = $db->fetch("SELECT * FROM USERS WHERE userId = :id AND role = 'seller'", [':id' => $sellerId]);
    if (!$seller) {
        http_response_code(404);
        echo json_encode(['error' => 'Seller not found']);
        exit;
    }

    // Get all shoes
    $shoes = $db->fetchAll("
        SELECT shoeId, brand, gender, category, description, price, discount, sku, color, weight, url
        FROM PRODUCTS
        ORDER BY shoeId DESC
    ");

    // Get all stocks
    $stocks = $db->fetchAll("SELECT shoeId, size, quantity FROM PRODUCT_SIZES");

    // Index stocks by shoeId
    $stockMap = [];
    foreach ($stocks as $stock) {
        $id = $stock['shoeId'];
        if (!isset($stockMap[$id])) $stockMap[$id] = [];
        $stockMap[$id][] = [
            'size' => (int)$stock['size'],
            'quantity' => (int)$stock['quantity']
        ];
    }

    // Combine shoes with their stocks
    foreach ($shoes as &$shoe) {
        $id = $shoe['shoeId'];
        $shoe['price'] = (int)$shoe['price'];
        $shoe['discount'] = (int)$shoe['discount'];
        $shoe['stocks'] = $stockMap[$id] ?? [];
    }

    echo json_encode(['shoeList' => $shoes, 'message' => "Data found successfully"], JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
