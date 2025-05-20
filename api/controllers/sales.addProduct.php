<?php
require_once __DIR__ . '/../utils/db.php';

header('Content-Type: application/json');

$db = Database::getInstance();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    // Validate form inputs
    $data = json_decode($_POST['data'], true); // decode as associative array

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
    $image = $_FILES['image'] ?? null;


    if (!$brand || !$gender || !$category || !$price || !$sku || !$color || !$weight || !$sellerId) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    if (!$image) {
        http_response_code(400);
        echo json_encode(["error" => "Missing image"]);
        exit;
    }

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

    // Generate unique image filename using current timestamp
    $ext = pathinfo($image['name'], PATHINFO_EXTENSION);
    $timestamp = time();
    $uniqueName = "shoe_" . $timestamp . '.' . $ext;
    $targetPath = $targetDir . $uniqueName;
    $publicPath = $publicDir . $uniqueName;

    // Move the uploaded file
    if (!move_uploaded_file($image['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to upload image"]);
        exit;
    }

    // Insert product into database
    $db->execute("
        INSERT INTO PRODUCTS 
        (brand, gender, category, description, price, discount, sku, color, weight, url, sellerId) 
        VALUES 
        (:brand, :gender, :category, :description, :price, :discount, :sku, :color, :weight, :url, :sellerId)
    ", [
        ':brand' => $brand,
        ':gender' => $gender,
        ':category' => $category,
        ':description' => $description,
        ':price' => $price,
        ':discount' => $discount,
        ':sku' => $sku,
        ':color' => $color,
        ':weight' => $weight,
        ':url' => $publicPath,
        ':sellerId' => $sellerId
    ]);

    echo json_encode(['message' => 'Product added successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
