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

    $data = json_decode(file_get_contents("php://input"), true);
    $couponCode = strtoupper(trim($data['code'] ?? ''));
    $billTotal = floatval($data['subTotal'] ?? 0);

    if (empty($couponCode) || $billTotal <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Coupon code and valid bill total are required']);
        exit;
    }

    // Get coupon
    $coupon = $db->fetch("SELECT * FROM COUPONS WHERE couponCode = :code", [
        ':code' => $couponCode
    ]);

    // No coupon found
    if (!$coupon) {
        http_response_code(404);
        echo json_encode(['error' => 'Invalid coupon code']);
        exit;
    }

    // Check if coupon is active
    if (!(bool)$coupon['isActive']) {
        http_response_code(403);
        echo json_encode(['error' => 'Coupon is not active']);
        exit;
    }

    // Check expiration
    $today = date('Y-m-d');
    if ($coupon['validTill'] < $today) {
        http_response_code(410); // Gone
        echo json_encode(['error' => 'Coupon has expired']);
        exit;
    }

    // Check minimum bill
    if ($billTotal < $coupon['minBill']) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Minimum bill of ' . number_format($coupon['minBill'], 2) . ' required to apply this coupon'
        ]);
        exit;
    }

    // If valid, return discount value
    http_response_code(200);
    echo json_encode([
        'message' => 'Coupon applied successfully',
        'couponDiscount' => floatval($coupon['maxDiscount']),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
