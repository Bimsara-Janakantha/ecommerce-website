<?php

$SHOE_LIST = [
    [
        "shoeId" => 1,
        "brand" => "NIKE",
        "gender" => "MEN",
        "category" => "Sneakers",
        "description" => "Lightweight breathable sneakers for daily wear",
        "price" => 1799.0,
        "discount" => 15,
        "rating" => 4.2,
        "url" => "../assets/men_shoes/shoe_6.jpeg",
    ],
    [
        "shoeId" => 2,
        "brand" => "PUMA",
        "gender" => "MEN",
        "category" => "Sneakers",
        "description" => "Classic low-top sneakers with modern twist",
        "price" => 1899.0,
        "discount" => 10,
        "rating" => 4.3,
        "url" => "../assets/men_shoes/shoe_7.webp",
    ],
    [
        "shoeId" => 111,
        "brand" => "HUSH PUPPIES",
        "gender" => "WOMEN",
        "category" => "Boots",
        "description" => "Water-resistant boots with soft lining",
        "price" => 2899.0,
        "discount" => 18,
        "rating" => 4.5,
        "url" => "../assets/women_shoes/shoe_11.jpeg",
    ],
    [
        "shoeId" => 112,
        "brand" => "METRO",
        "gender" => "WOMEN",
        "category" => "Heels",
        "description" => "Classy kitten heels for daily wear",
        "price" => 1999.0,
        "discount" => 10,
        "rating" => 4.2,
        "url" => "../assets/women_shoes/shoe_12.jpg",
    ],
    [
        "shoeId" => 201,
        "brand" => "NIKE",
        "gender" => "BOYS",
        "category" => "Sneakers",
        "description" => "Lightweight kids sneakers with breathable upper",
        "price" => 1499.0,
        "discount" => 10,
        "rating" => 4.3,
        "url" => "../assets/boys_shoes/shoe_1.jpg",
    ],
    [
        "shoeId" => 202,
        "brand" => "PUMA",
        "gender" => "BOYS",
        "category" => "Sneakers",
        "description" => "Sporty sneakers with cushioned sole for all-day comfort",
        "price" => 1599.0,
        "discount" => 12,
        "rating" => 4.2,
        "url" => "../assets/boys_shoes/shoe_2.jpg",
    ],
    [
        "shoeId" => 304,
        "brand" => "SPARX",
        "gender" => "GIRLS",
        "category" => "Sandals",
        "description" => "Stylish pink sandals with easy straps",
        "price" => 799.0,
        "discount" => 7,
        "rating" => 4.0,
        "url" => "../assets/girls_shoes/shoe_4.jpg",
    ],
    [
        "shoeId" => 305,
        "brand" => "LEE COOPER",
        "gender" => "GIRLS",
        "category" => "Ballet Flats",
        "description" => "Chic ballet flats with bow detail",
        "price" => 999.0,
        "discount" => 10,
        "rating" => 4.2,
        "url" => "../assets/girls_shoes/shoe_5.jpeg",
    ],
];


// Ensure GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');

    $uri = $_SERVER['REQUEST_URI'];
    $normalizedUri = str_replace('/api/app.php', '', $uri);
    $parts = explode('/', $normalizedUri);
    $collection = $parts[2] ?? null; // 'sneakers'

    //echo "Collection: " . $collection . "\n";

    if ($collection === "featured") {
        http_response_code(200);
        echo json_encode([
            'message' => "Featured items get successfully.",
            'products' => array_values($SHOE_LIST)
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid collection']);
    }
} else {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method Not Allowed']);
}
