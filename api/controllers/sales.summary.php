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
    $range = strtolower($parts[4] ?? '');

    //echo "Seller: " . $sellerId . " \t Range: " . $range . "\n";

    if (!$sellerId || empty($range)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing sellerId or range']);
        exit;
    }

    // Validate seller
    $seller = $db->fetch("SELECT * FROM USERS WHERE userId = :id", [':id' => $sellerId]);
    if (!$seller) {
        http_response_code(404);
        echo json_encode(['error' => 'Seller not found']);
        exit;
    }

    $today = new DateTime(); // current date and time

    switch ($range) {
        case 'today':
            $startDate = (clone $today)->setTime(0, 0, 0)->format('Y-m-d H:i:s');
            break;
        case 'week':
            $startDate = (clone $today)->modify('-7 days')->setTime(0, 0, 0)->format('Y-m-d H:i:s');
            break;
        case 'month':
            $startDate = (clone $today)->modify('-1 month')->setTime(0, 0, 0)->format('Y-m-d H:i:s');
            break;
        case 'year':
            $startDate = (clone $today)->modify('-1 year')->setTime(0, 0, 0)->format('Y-m-d H:i:s');
            break;
        default:
            $startDate = (clone $today)->setTime(0, 0, 0)->format('Y-m-d H:i:s');
    }
    //echo "start Date: " . $startDate . "\n";

    // Get number of days for average calculations
    $days = match ($range) {
        'today' => 1,
        'week' => 7,
        'month' => 30,
        'year' => 365,
        default => 1,
    };

    // Fetch summary metrics
    $summary = [];
    $summary['basic'] = [];

    // New Orders
    $result = $db->fetch("
        SELECT COUNT(orderId) AS newOrders
        FROM ORDERS
        WHERE createdAt >= :startDate
    ", [':startDate' => $startDate]);
    $summary['basic']['newOrders'] = $result['newOrders'] ?? 0;
    //echo "newOrders: " . $summary['basic']['newOrders'] . "\n";

    // Average Daily Orders
    $summary['basic']['avgDailyOrders'] = round($summary['basic']['newOrders'] / $days, 2);
    //echo "avgDailyOrders: " .  $summary['basic']['avgDailyOrders'] . "\n";

    // Canceled Orders
    $result = $db->fetch("
        SELECT COUNT(orderId) AS cancelOrders
        FROM ORDERS
        WHERE status = 'CANCELLED' AND createdAt >= :startDate
    ", [':startDate' => $startDate]);
    $summary['basic']['cancelOrders'] = $result['cancelOrders'] ?? 0;
    //echo "cancelOrders: " . $summary['basic']['cancelOrders'] . "\n";

    // Average Daily Canceled Orders
    $summary['basic']['avgDailyCancel'] = round($summary['basic']['cancelOrders'] / $days, 2);
    //echo "avgDailyCancel: " .  $summary['basic']['avgDailyCancel'] . "\n";

    // Revenue
    $result = $db->fetch("
        SELECT SUM(amount) AS revenue
        FROM PAYMENTS
        WHERE status IN ('SUCCESS', 'PENDING') AND paidAt >= :startDate
    ", [':startDate' => $startDate]);
    $summary['basic']['revenue'] = $result['revenue'] ?? 0.0;

    //echo "revenue: " . $summary['basic']['revenue'] . "\n";

    // Revenue Growth (Placeholder)
    $summary['basic']['revenueGrowth'] = 0;
    //echo "revenueGrowth: " . $summary['basic']['revenueGrowth'] . "\n";

    $result = $db->fetch("
        SELECT COUNT(userId) AS customers
        FROM USERS
        WHERE role = 'customer' AND DATE(createdAt) >= :startDate
    ", [':startDate' => $startDate]);
    $summary['basic']['customers'] = $result['customers'] ?? 0;

    //echo "customers: " . $summary['basic']['customers'] . "\n";

    // Customer Growth (Placeholder)
    $summary['basic']['customerGrowth'] = 0;
    //echo "customerGrowth: " . $summary['basic']['customerGrowth'] . "\n";

    // Active customers
    $result = $db->fetch("
        SELECT COUNT(DISTINCT userId) AS activeCustomers
        FROM ORDERS
        WHERE createdAt >= :startDate
    ", [':startDate' => $startDate]);
    $summary['basic']['activeCustomers'] = $result['activeCustomers'] ?? 0;
    //echo "activeCustomers: " . $summary['basic']['activeCustomers'] . "\n";

    // Top Products
    $summary['topProducts'] = $db->fetchAll("
        SELECT
            P.shoeId,
            P.url,
            P.brand,
            P.gender,
            P.category,
            P.description,
            P.price
        FROM PRODUCTS P
        JOIN ORDER_ITEMS OI ON P.shoeId = OI.shoeId
        JOIN ORDERS O ON OI.orderId = O.orderId
        WHERE P.sellerId = :sellerId AND O.createdAt >= :startDate
        GROUP BY P.shoeId
        ORDER BY SUM(OI.quantity) DESC
        LIMIT 5
    ", [':sellerId' => $sellerId, ':startDate' => $startDate]);

    // Chart Data
    $summary['chartDatasets'] = [];

    // New Orders per Day
    $newOrdersData = $db->fetchAll("
        SELECT DATE(createdAt) AS day, COUNT(*) AS count
        FROM ORDERS 
        WHERE createdAt >= :startDate
        GROUP BY DATE(createdAt)
    ", [':startDate' => $startDate]);
    $summary['chartDatasets']['New Orders'] = array_column($newOrdersData, 'count', 'day');

    // Canceled Orders per Day
    $canceledOrdersData = $db->fetchAll("
        SELECT DATE(createdAt) AS day, COUNT(*) AS count
        FROM ORDERS 
        WHERE status = 'CANCELLED' AND createdAt >= :startDate
        GROUP BY DATE(createdAt)
    ", [':startDate' => $startDate]);
    $summary['chartDatasets']['Canceled Orders'] = array_column($canceledOrdersData, 'count', 'day');

    // Revenue per Day
    $revenueData = $db->fetchAll("
        SELECT DATE(paidAt) AS day, SUM(amount) AS total
        FROM PAYMENTS
        WHERE status != 'FAILED' AND paidAt >=  :startDate
        GROUP BY DATE(paidAt)
    ", [':startDate' => $startDate]);
    $summary['chartDatasets']['Revenue'] = array_column($revenueData, 'total', 'day');

    // Total Customers per Day
    $customersData = $db->fetchAll("
        SELECT DATE(createdAt) AS day, COUNT(DISTINCT userId) AS count
        FROM ORDERS
        WHERE createdAt >= :startDate
        GROUP BY DATE(createdAt)
    ", [':startDate' => $startDate]);
    $summary['chartDatasets']['Active Customers'] = array_column($customersData, 'count', 'day');

    echo json_encode(['summary' => $summary, 'message' => "Data found successfully"], JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
