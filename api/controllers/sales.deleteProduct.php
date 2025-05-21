<?php
require_once __DIR__ . '/../utils/db.php';

header('Content-Type: application/json');

$db = Database::getInstance();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents("php://input"), true);
    $shoeId = $input['shoeId'] ?? null;
    $sellerId = $input['sellerId'] ?? null;

    if (!$shoeId || !$sellerId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing shoeId or sellerId']);
        exit;
    }

    // Validate seller ownership
    $product = $db->fetch("SELECT * FROM PRODUCTS WHERE shoeId = :shoeId AND sellerId = :sellerId", [
        ':shoeId' => $shoeId,
        ':sellerId' => $sellerId
    ]);

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found or not owned by seller']);
        exit;
    }

    // Soft-delete the product
    $updated = $db->execute("UPDATE PRODUCTS SET productStatus = 'deleted' WHERE shoeId = :shoeId AND sellerId = :sellerId", [
        ':shoeId' => $shoeId,
        ':sellerId' => $sellerId
    ]);

    echo json_encode(['message' => 'Product deleted successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
