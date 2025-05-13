<?php
//echo "\nI'm at test file\n";

require_once __DIR__ . '/../utils/db.php';


header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful!'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
