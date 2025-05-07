<?php

$valid_username = "admin";
$valid_password = "1234";

// Ensure POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if ($username === $valid_username && $password === $valid_password) {
        http_response_code(200);
        echo json_encode([
            'name' => 'John',
            'lname' => 'Doe',
            'email' => 'john@example.com',
            'mobile' => '1234567890'
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
    }
} else {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method Not Allowed']);
}
