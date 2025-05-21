<?php
require_once __DIR__ . '/../utils/db.php';

header('Content-Type: application/json');

$db = Database::getInstance();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $sellerId = $data['sellerId'] ?? '';
    $orderId = $data['orderId'] ?? '';
    $currentStatus = $data['currentStatus'] ?? '';
    $newStatus = $data['newStatus'] ?? '';

    if (!$sellerId || !$orderId || !$currentStatus || !$newStatus) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    if ($currentStatus === $newStatus) {
        http_response_code(400);
        echo json_encode(['error' => 'Nothing to update!']);
        exit;
    }

    // Validate seller
    $seller = $db->fetch("SELECT * FROM USERS WHERE userId = :id AND role = 'seller'", [':id' => $sellerId]);
    if (!$seller) {
        http_response_code(404);
        echo json_encode(['error' => 'Seller not found']);
        exit;
    }

    // Check current order status
    $order = $db->fetch("SELECT status FROM ORDERS WHERE orderId = :oid", [':oid' => $orderId]);
    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit;
    }

    if ($order['status'] !== $currentStatus) {
        http_response_code(400);
        echo json_encode(['error' => 'Current status mismatch']);
        exit;
    }

    // Update order status
    $updateSql = "UPDATE ORDERS SET status = :newStatus WHERE orderId = :orderId";
    $db->execute($updateSql, [
        ':newStatus' => $newStatus,
        ':orderId' => $orderId
    ]);

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

    echo json_encode(['summary' => $summary, 'orders' => $finalOrders, 'message' => "Order status updated successfully"], JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
