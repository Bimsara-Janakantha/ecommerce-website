<?php
require_once __DIR__ . '/../utils/db.php';

$db = Database::getInstance();

header('Content-Type: application/json');

//echo "new request " . $_SERVER['REQUEST_METHOD'] . "\n";

try {
    // Ensure it's a GET request
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $uri = $_SERVER['REQUEST_URI'];
    $normalizedUri = str_replace('/api/app.php', '', $uri);
    $parts = explode('/', $normalizedUri);
    $collection = $parts[2] ?? null; // 'sneakers'

    //echo "Collection: " . $collection . "\n";

    if ($collection !== "featured") {
        http_response_code(405);
        echo json_encode(['error' => 'Invalid request']);
        exit;
    }

    // Fetch top 8 highest-rated shoes by average rating
    $query = "
        SELECT 
            P.shoeId,
            P.brand,
            P.gender,
            P.category,
            P.description,
            CAST(P.price AS DECIMAL(10,2)) AS price,
            CAST(P.discount AS INT) AS discount,
            COALESCE(AVG(R.rating), 0) AS rating,
            P.url
        FROM PRODUCTS P
        LEFT JOIN RATING R ON P.shoeId = R.shoeId
        GROUP BY P.shoeId
        ORDER BY rating DESC
        LIMIT 8
    ";

    $shoes = $db->fetchAll($query);

    $formatted = array_map(function ($row) {
        return [
            'shoeId'     => (int) $row['shoeId'],
            'brand'      => $row['brand'],
            'gender'     => $row['gender'],
            'category'   => $row['category'],
            'description' => $row['description'],
            'price'      => (float) $row['price'],
            'discount'   => (int) $row['discount'],
            'rating'     => (float) $row['rating'],
            'url'        => $row['url'],
        ];
    }, $shoes);

    http_response_code(200);
    echo json_encode([
        'message' => 'Featured products get successfully',
        'products' => $formatted,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
