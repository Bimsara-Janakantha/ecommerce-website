<?php
require_once __DIR__ . '/../utils/db.php';

header('Content-Type: application/json');

$db = Database::getInstance();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    // Get JSON-encoded form data
    $data = json_decode($_POST['data'] ?? '{}', true);

    $shoeId = $data['shoeId'] ?? null;
    $brand = $data['brand'] ?? null;
    $gender = $data['gender'] ?? null;
    $category = $data['category'] ?? null;
    $description = $data['description'] ?? '';
    $price = $data['price'] ?? null;
    $discount = $data['discount'] ?? 0;
    $sku = $data['sku'] ?? null;
    $color = $data['color'] ?? null;
    $weight = $data['weight'] ?? null;
    $sellerId = $data['sellerId'] ?? null;
    $stocks = $data['stocks'] ?? [];

    if (!$brand || !$gender || !$category || !$description || !$price || !$sku || !$color || !$weight || !$sellerId || empty($stocks)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    // Validate seller
    $seller = $db->fetch("SELECT * FROM USERS WHERE userId = :id AND role = 'seller'", [
        ':id' => $sellerId
    ]);

    if (!$seller) {
        http_response_code(404);
        echo json_encode(['error' => 'Seller not found']);
        exit;
    }

    $image = $_FILES['image'] ?? null;
    $publicPath = null;

    // Handle image upload if new image is provided
    if ($image) {
        // Select target and public directory based on gender
        switch (strtoupper($gender)) {
            case 'MEN':
                $targetDir = __DIR__ . "/../../assets/men_shoes/";
                $publicDir = "/assets/men_shoes/";
                break;
            case 'WOMEN':
                $targetDir = __DIR__ . "/../../assets/women_shoes/";
                $publicDir = "/assets/women_shoes/";
                break;
            case 'BOYS':
                $targetDir = __DIR__ . "/../../assets/boys_shoes/";
                $publicDir = "/assets/boys_shoes/";
                break;
            case 'GIRLS':
                $targetDir = __DIR__ . "/../../assets/girls_shoes/";
                $publicDir = "/assets/girls_shoes/";
                break;
            default:
                $targetDir = __DIR__ . "/../../assets/dump/";
                $publicDir = "/assets/dump/";
                break;
        }

        if (!file_exists($targetDir)) {
            http_response_code(404);
            echo json_encode(["error" => "Target directory not found"]);
            exit;
        }

        // Generate unique image name with timestamp
        $ext = pathinfo($image['name'], PATHINFO_EXTENSION);
        $timestamp = time();
        $uniqueName = "shoe_" . $timestamp . '.' . $ext;
        $targetPath = $targetDir . $uniqueName;
        $publicPath = $publicDir . $uniqueName;

        if (!move_uploaded_file($image['tmp_name'], $targetPath)) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to upload image"]);
            exit;
        }
    }

    // Build dynamic update query
    $updateFields = [
        'brand = :brand',
        'gender = :gender',
        'category = :category',
        'description = :description',
        'price = :price',
        'discount = :discount',
        'sku = :sku',
        'color = :color',
        'weight = :weight'
    ];

    if ($publicPath) {
        $updateFields[] = 'url = :url';
    }

    $sql = "UPDATE PRODUCTS SET " . implode(', ', $updateFields) . " WHERE shoeId = :shoeId AND sellerId = :sellerId";

    $params = [
        ':brand' => $brand,
        ':gender' => $gender,
        ':category' => $category,
        ':description' => $description,
        ':price' => $price,
        ':discount' => $discount,
        ':sku' => $sku,
        ':color' => $color,
        ':weight' => $weight,
        ':sellerId' => $sellerId,
        ':shoeId' => $shoeId
    ];

    if ($publicPath) {
        $params[':url'] = $publicPath;
    }

    $db->execute($sql, $params);

    // Clear old stocks
    $db->execute("DELETE FROM PRODUCT_SIZES WHERE shoeId = :shoeId", [
        ':shoeId' => $shoeId
    ]);

    // Insert updated stocks
    $insertStockSql = "INSERT INTO PRODUCT_SIZES (shoeId, size, quantity) VALUES (:shoeId, :size, :quantity)";
    foreach ($stocks as $stock) {
        if (!isset($stock['size']) || !isset($stock['quantity'])) continue;

        $db->execute($insertStockSql, [
            ':shoeId' => $shoeId,
            ':size' => $stock['size'],
            ':quantity' => $stock['quantity']
        ]);
    }

    echo json_encode(['message' => 'Product updated successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
