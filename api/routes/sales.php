<?php

$requestMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$normalizedUri = str_replace('/api/app.php', '', $uri);
$subDirectory = explode('/', $normalizedUri)[2];

// Route based on method
if ($requestMethod === 'GET' && $subDirectory === "summary") {
    require_once __DIR__ . '/../controllers/sales.summary.php';
} elseif ($requestMethod === 'GET' && $subDirectory === "transactions") {
    require_once __DIR__ . '/../controllers/sales.transactions.php';
} elseif ($requestMethod === 'GET' && $subDirectory === "insights") {
    require_once __DIR__ . '/../controllers/sales.orders.php';
} elseif ($requestMethod === 'PATCH' && $subDirectory === "insights") {
    require_once __DIR__ . '/../controllers/sales.updateOrder.php';
} else {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method Not Allowed']);
}
