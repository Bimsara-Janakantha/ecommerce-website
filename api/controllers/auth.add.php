<?php
require_once __DIR__ . '/../utils/sendOTPEmail.php';
require_once __DIR__ . '/../utils/db.php';

$db = Database::getInstance();

function generateOTP(int $length = 6): string
{
  $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  $otp = '';
  $maxIndex = strlen($characters) - 1;

  for ($i = 0; $i < $length; $i++) {
    $otp .= $characters[random_int(0, $maxIndex)];
  }

  return $otp;
}

try {
  // Ensure it's a POST request
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new Exception("Method not allowed");
  }

  header('Content-Type: application/json');
  $data = json_decode(file_get_contents("php://input"), true);
  $email = $data['email'] ?? '';

  if (empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email is required']);
    exit;
  }

  echo "email: " . $email . "\n";

  // 1. Check if email already exists in USERS
  $existingUser = $db->fetch("SELECT * FROM USERS WHERE email = :email", [':email' => $email]);

  if ($existingUser) {
    http_response_code(409); // Conflict
    echo json_encode(['error' => 'Email already registered']);
    exit;
  }

  // 2. Generate OTP
  $otp = generateOTP(8);
  $hashedOtp = password_hash($otp, PASSWORD_DEFAULT);
  $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

  echo "OTP: " . $otp . "\n";
  echo "Hashed OTP: " . $hashedOtp . "\n";

  // 3. Insert/update AUTH table
  $db->execute("
    INSERT INTO AUTH (email, otp, otpExpiration) 
    VALUES (:email, :otp, :exp) 
    ON DUPLICATE KEY UPDATE otp = :otp2, otpExpiration = :exp2
  ", [
    ':email' => $email,
    ':otp'   => $hashedOtp,
    ':exp'   => $expiresAt,
    ':otp2'  => $hashedOtp,
    ':exp2'  => $expiresAt
  ]);

  echo "DB Updated!";

  // 4. Send OTP via email
  if (!sendOtpEmail($email, $otp)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send OTP']);
    exit;
  }

  echo "email sent!";

  // Success
  http_response_code(200);
  echo json_encode(['message' => 'OTP sent']);
} catch (Throwable $th) {
  http_response_code(405);
  header('Content-Type: application/json');
  echo json_encode(['error' => $th->getMessage()]);
}
