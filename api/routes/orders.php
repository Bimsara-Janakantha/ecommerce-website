<?php

$requestMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$normalizedUri = str_replace('/api/app.php', '', $uri);
$subDirectory = explode('/', $normalizedUri)[2];

// Route based on method
if ($requestMethod === 'POST' && $subDirectory === "coupon") {
    require_once __DIR__ . '/../controllers/orders.coupon.php';
} elseif ($requestMethod === 'POST' && $subDirectory === "new") {
    require_once __DIR__ . '/../controllers/orders.new.php';
} else {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method Not Allowed']);
}
