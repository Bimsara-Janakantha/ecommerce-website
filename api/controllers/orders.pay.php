<?php
require_once __DIR__ . '/../utils/db.php';

$db = Database::getInstance();

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    // Read and decode the JSON body
    $data = json_decode(file_get_contents("php://input"), true);

    $userId = $data['userId'] ?? null;
    $paymentId = $data['paymentId'] ?? null;
    $referenceId = $data['referenceId'] ?? null;

    // Basic validation
    if (!$userId || !$paymentId || !$referenceId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required payment fields']);
        exit;
    }

    // Insert into PAYMENTS table
    $db->execute("
        UPDATE PAYMENTS
        SET referenceId = :referenceId,
            status = 'PENDING'
        WHERE paymentId = :paymentId AND userId = :userId
    ", [
        ':referenceId' => $referenceId,
        ':paymentId' => $paymentId,
        ':userId' => $userId
    ]);


    http_response_code(201);
    echo json_encode([
        'message' => 'Payment recorded successfully',
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
