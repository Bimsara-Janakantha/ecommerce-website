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

  // Check if username already exists
  $existingUser = $db->fetch("SELECT * FROM USERS WHERE username = :username", [
    ':username' => $username
  ]);

  if ($existingUser) {
    http_response_code(409); // Conflict
    echo json_encode(['error' => 'Username already taken']);
    exit;
  }

  // Hash password and insert user
  $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
  $db->execute("
    INSERT INTO USERS (username, password, role)
    VALUES (:username, :password, :role)
  ", [
    ':username' => $username,
    ':password' => $hashedPassword,
    ':role' => 'customer'
  ]);

  // Get the newly inserted user's ID
  $userId = $db->lastInsertId();

  http_response_code(201); // Created
  echo json_encode([
    'message' => 'User registered successfully',
    'userId' => $userId,
    'role' => 'customer'
  ]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
