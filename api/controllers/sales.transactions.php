<?php
require_once __DIR__ . '/../utils/db.php';

header('Content-Type: application/json');

$db = Database::getInstance();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $uri = $_SERVER['REQUEST_URI'];
    $normalizedUri = str_replace('/api/app.php', '', $uri);
    $parts = explode('/', $normalizedUri);
    $sellerId = $parts[3] ?? null;

    //echo "Seller: " . $sellerId . " \t Range: " . $range . "\n";

    if (!$sellerId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing sellerId or range']);
        exit;
    }

    // Validate seller
    $seller = $db->fetch("SELECT * FROM USERS WHERE userId = :id", [':id' => $sellerId]);
    if (!$seller) {
        http_response_code(404);
        echo json_encode(['error' => 'Seller not found']);
        exit;
    }

    // Summary
    $sql = "
        SELECT
            IFNULL(SUM(CASE WHEN status IN ('SUCCESS', 'PENDING') THEN amount ELSE 0 END), 0) AS revenue,
            COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) AS complete,
            COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'REFUND' THEN 1 END) AS refund
        FROM PAYMENTS
        ";

    $summary = $db->fetchAll($sql);

    if (!$summary) {
        $summary = ['revenue' => 0, 'complete' => 0, 'pending' => 0, 'refund' => 0];
    }

    $txnSql = "
        SELECT
            p.paidAt AS date,
            u.userName AS customer,
            p.orderId,
            p.status,
            p.amount
        FROM PAYMENTS p
        JOIN USERS u ON p.userId = u.userId
        ORDER BY p.paidAt DESC
    ";

    $transactions = $db->fetchAll($txnSql);

    echo json_encode(['summary' => $summary, 'transactions' => $transactions, 'message' => "Data found successfully"], JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
