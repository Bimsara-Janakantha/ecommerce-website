<?php

$requestMethod = $_SERVER['REQUEST_METHOD'];

// Route based on method
if ($requestMethod === 'POST') {
    require_once __DIR__ . '/../controllers/auth.add.php';
} elseif ($requestMethod === 'GET') {
    require_once __DIR__ . '/../controllers/getInfo.php';
} else {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method Not Allowed']);
}
