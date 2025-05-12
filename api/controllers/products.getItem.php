<?php

$DUMMY_ITEM = [
    "shoeId" => 1,
    "brand" => "NIKE",
    "gender" => "MEN",
    "category" => "Sneakers",
    "description" => "Lightweight breathable sneakers for daily wear",
    "price" => 1799.0,
    "discount" => 15,
    "sizes" => [
        ["size" => 4, "quantity" => 5],
        ["size" => 5, "quantity" => 2],
        ["size" => 6, "quantity" => 0],
        ["size" => 7, "quantity" => 0],
        ["size" => 8, "quantity" => 50],
        ["size" => 9, "quantity" => 0],
        ["size" => 10, "quantity" => 70]
    ],
    "sku" => "T00069",
    "rating" => 4.2,
    "color" => "Black",
    "weight" => "700 g",
    "url" => "../assets/men_shoes/shoe_6.jpeg",
];

try {
    // Ensure it's a GET request
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        header('Content-Type: application/json');

        // Optional: extract itemId from URL if needed
        $uri = $_SERVER['REQUEST_URI'];
        $normalizedUri = str_replace('/api/app.php', '', $uri);
        $parts = explode('/', $normalizedUri);
        $itemId = $parts[3] ?? null;

        // For now, return static item
        http_response_code(200);
        echo json_encode($DUMMY_ITEM);
    } else {
        throw new Exception("Method not allowed");
    }
} catch (Throwable $th) {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => $th->getMessage()]);
}
