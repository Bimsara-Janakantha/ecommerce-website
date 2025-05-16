<?php

require_once __DIR__ . '/../utils/db.php';

$db = Database::getInstance();

try {
    // Ensure it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        throw new Exception("Method not allowed");
    }

    header('Content-Type: application/json');

    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required']);
        exit;
    }

    // Fetch user record from the database
    $existingUser = $db->fetch("SELECT * FROM USERS WHERE username = :username", [
        ':username' => $username
    ]);

    if (!$existingUser) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // Validate password
    if (!password_verify($password, $existingUser['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
        exit;
    }

    // Return user data
    echo json_encode([
        'userId' => $existingUser['userId'],
        'role' => $existingUser['role'],
        'message' => 'Login successful'
    ]);
    http_response_code(200);
    exit;
} catch (Throwable $th) {
    http_response_code(http_response_code() !== 200 ? http_response_code() : 500);
    echo json_encode(['error' => $th->getMessage()]);
}
