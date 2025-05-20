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

    // Summary
    $sql = "
        SELECT
            COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'SHIPPED' THEN 1 END) AS shipped,
            COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) AS completed,
            COUNT(CASE WHEN status = 'FAILED' THEN 1 END) AS failed
        FROM ORDERS
        ";

    $summary = $db->fetchAll($sql);

    if (!$summary) {
        $summary = ['pending' => 0, 'shipped' => 0, 'completed' => 0, 'failed' => 0];
    }

    // Fetch orders
    $orderSql = "
        SELECT
            o.orderId,
            o.createdAt AS date,
            o.fName,
            o.lName,
            o.apt,
            o.street,
            o.city,
            o.province,
            o.postal,
            o.mobile,
            o.notes,
            o.status
        FROM ORDERS o
        ORDER BY o.orderId DESC
    ";
    $orders = $db->fetchAll($orderSql);

    // Fetch items for all orders
    $itemSql = "
        SELECT
            o.orderId,
            p.sku,
            o.size,
            o.quantity
        FROM ORDER_ITEMS o
        JOIN PRODUCTS p ON o.shoeId = p.shoeId
    ";
    $items = $db->fetchAll($itemSql);

    // Map items to corresponding orders
    $orderMap = [];
    foreach ($orders as $order) {
        $order['items'] = []; // Initialize items array
        $orderMap[$order['orderId']] = $order;
    }
    foreach ($items as $item) {
        $orderId = $item['orderId'];
        if (isset($orderMap[$orderId])) {
            $orderMap[$orderId]['items'][] = [
                'sku' => $item['sku'],
                'size' => $item['size'],
                'quantity' => $item['quantity']
            ];
        }
    }

    // Final result as a list of enriched orders
    $finalOrders = array_values($orderMap);
    echo json_encode(['summary' => $summary, 'orders' => $finalOrders, 'message' => "Data found successfully"], JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
