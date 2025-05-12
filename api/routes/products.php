<?php

$requestMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$normalizedUri = str_replace('/api/app.php', '', $uri);
$subDirectory = explode('/', $normalizedUri)[2];

// Route based on method
if ($requestMethod === 'GET' && $subDirectory === "item") {
    require_once __DIR__ . '/../controllers/products.getItem.php';
} elseif ($requestMethod === 'GET') {
    require_once __DIR__ . '/../controllers/products.shoeList.php';
} else {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method Not Allowed']);
}
