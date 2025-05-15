<?php

require_once __DIR__ . '/../utils/db.php';

$db = Database::getInstance();

header('Content-Type: application/json');

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
	$collection = strtolower($parts[2] ?? ''); // e.g., 'men', 'women', etc.

	$allowedGenders = ['men', 'women', 'boys', 'girls'];

	if (!in_array($collection, $allowedGenders)) {
		http_response_code(400);
		echo json_encode(['error' => 'Invalid gender filter']);
		exit;
	}

	// Capitalize gender to match ENUM in DB
	$collectionEnum = strtoupper($collection);

	// Fetch shoes by gender
	$query = "
        SELECT 
            P.shoeId,
            P.brand,
            P.gender,
            P.category,
            P.description,
            P.price,
            P.discount,
            COALESCE(ROUND(AVG(R.rating), 1), 0) AS rating,
            P.url
        FROM PRODUCTS P
        LEFT JOIN RATING R ON P.shoeId = R.shoeId
        WHERE P.gender = :collection
        GROUP BY P.shoeId
        ORDER BY rating DESC
    ";

	$shoes = $db->fetchAll($query, [
		':collection' => $collectionEnum,
	]);

	$formatted = array_map(function ($row) {
		return [
			'shoeId'      => (int) $row['shoeId'],
			'brand'       => $row['brand'],
			'gender'      => $row['gender'],
			'category'    => $row['category'],
			'description' => $row['description'],
			'price'       => (float) $row['price'],
			'discount'    => (int) $row['discount'],
			'rating'      => (float) $row['rating'],
			'url'         => $row['url'],
		];
	}, $shoes);

	http_response_code(200);
	echo json_encode([
		'message' => 'Products retrieved successfully',
		'products' => $formatted,
	]);
} catch (PDOException $e) {
	http_response_code(500);
	echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
	http_response_code(500);
	echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
