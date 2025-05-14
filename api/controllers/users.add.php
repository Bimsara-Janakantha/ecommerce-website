<?php
require_once __DIR__ . '/../utils/db.php';

$db = Database::getInstance();

try {
  // Ensure it's a POST request
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new Exception("Method not allowed");
  }

  header('Content-Type: application/json');
  $data = json_decode(file_get_contents("php://input"), true);
  $username = $data['username'] ?? '';
  $password = $data['password'] ?? '';

  if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'username and password are required']);
    exit;
  }

  //echo "username: " . $username . "\n";
  //echo "password: " . $password . "\n";

  // Check if username already exists in USERS
  $existingUser = $db->fetch("SELECT * FROM USERS WHERE username = :username", [':username' => $username]);

  if ($existingUser) {
    http_response_code(226); // Conflict
    echo json_encode(['error' => 'username already taken']);
    exit;
  }

  // Hashing
  $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
  //echo "Hashed Password: " . $hashedPassword . "\n";

  // Insert USERS table
  $db->execute("
    INSERT INTO USERS (username, password, role) 
    VALUES (:username, :password, :role)
  ", [
    ':username' => $username,
    ':password'   => $hashedPassword,
    ':role'   => "customer"
  ]);

  //echo "DB Updated!";

  // Success
  http_response_code(201);
  echo json_encode(['message' => 'User is added to the database']);
} catch (Throwable $th) {
  http_response_code(405);
  header('Content-Type: application/json');
  echo json_encode(['error' => $th->getMessage()]);
}
