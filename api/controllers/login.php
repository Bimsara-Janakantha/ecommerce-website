<?php
require_once __DIR__ . '/../utils/db.php';

$db = Database::getInstance();

header('Content-Type: application/json');

try {
    // Ensure it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    // Parse JSON body
    $data = json_decode(file_get_contents("php://input"), true);
    $username = trim($data['username'] ?? '');
    $password = trim($data['password'] ?? '');

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required']);
        exit;
    }

    // Fetch user by username
    $user = $db->fetch("SELECT * FROM USERS WHERE username = :username", [
        ':username' => $username
    ]);

    if (!$user) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Invalid username or password']);
        exit;
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Invalid username or password']);
        exit;
    }

    // On success: return basic user info
    http_response_code(200);
    echo json_encode([
        'message' => 'Login successful',
        'userId' => (int) $user['userId'],
        'username' => $user['username'],
        'role' => $user['role']
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
