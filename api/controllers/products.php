<?php

$men_shoes = [
	[
		"shoeId" => 1,
		"brand" => "NIKE",
		"gender" => "MEN",
		"category" => "Sneakers",
		"description" => "Lightweight breathable sneakers for daily wear",
		"price" => 1799.0,
		"discount" => 15,
		"rating" => 4.2,
		"url" => "../assets/shoes/shoe_1.jpg",
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
		"url" => "../assets/shoes/shoe_6.jpeg",
	],
	[
		"shoeId" => 3,
		"brand" => "WOODLAND",
		"gender" => "MEN",
		"category" => "Boots",
		"description" => "Tough leather boots for outdoor adventures",
		"price" => 2599.0,
		"discount" => 20,
		"rating" => 4.5,
		"url" => "../assets/shoes/shoe_7.webp",
	],
	[
		"shoeId" => 4,
		"brand" => "RED TAPE",
		"gender" => "MEN",
		"category" => "Boots",
		"description" => "Stylish ankle boots for all-day comfort",
		"price" => 2299.0,
		"discount" => 12,
		"rating" => 4.1,
		"url" => "../assets/shoes/shoe_8.jpeg",
	],
	[
		"shoeId" => 5,
		"brand" => "BATA",
		"gender" => "MEN",
		"category" => "Sandals",
		"description" => "Comfortable sandals with soft footbed",
		"price" => 999.0,
		"discount" => 8,
		"rating" => 4.0,
		"url" => "../assets/shoes/shoe_9.jpeg",
	],
	[
		"shoeId" => 6,
		"brand" => "SPARX",
		"gender" => "MEN",
		"category" => "Sandals",
		"description" => "Durable sandals ideal for casual outings",
		"price" => 899.0,
		"discount" => 5,
		"rating" => 4.2,
		"url" => "../assets/shoes/shoe_10.webp",
	],
	[
		"shoeId" => 7,
		"brand" => "LOUIS PHILIPPE",
		"gender" => "MEN",
		"category" => "Loafers",
		"description" => "Elegant leather loafers for formal wear",
		"price" => 2699.0,
		"discount" => 18,
		"rating" => 4.6,
		"url" => "../assets/shoes/shoe_11.jpg",
	],
	[
		"shoeId" => 8,
		"brand" => "HUSH PUPPIES",
		"gender" => "MEN",
		"category" => "Loafers",
		"description" => "Comfortable slip-on loafers with cushioned sole",
		"price" => 2399.0,
		"discount" => 15,
		"rating" => 4.4,
		"url" => "../assets/shoes/shoe_12.jpg",
	],
	[
		"shoeId" => 9,
		"brand" => "NIKE",
		"gender" => "MEN",
		"category" => "Sneakers",
		"description" => "Performance sneakers with superior grip",
		"price" => 2099.0,
		"discount" => 10,
		"rating" => 4.5,
		"url" => "../assets/shoes/shoe_13.jpeg",
	],
	[
		"shoeId" => 10,
		"brand" => "PUMA",
		"gender" => "MEN",
		"category" => "Sneakers",
		"description" => "Trendy sneakers for casual wear",
		"price" => 1699.0,
		"discount" => 12,
		"rating" => 4.1,
		"url" => "../assets/shoes/shoe_14.webp",
	],
	[
		"shoeId" => 11,
		"brand" => "RED CHIEF",
		"gender" => "MEN",
		"category" => "Boots",
		"description" => "Rugged boots with padded collar",
		"price" => 2499.0,
		"discount" => 17,
		"rating" => 4.3,
		"url" => "../assets/shoes/shoe_15.jpg",
	],
	[
		"shoeId" => 12,
		"brand" => "LEE COOPER",
		"gender" => "MEN",
		"category" => "Loafers",
		"description" => "Smart casual loafers for versatile use",
		"price" => 1999.0,
		"discount" => 14,
		"rating" => 4.2,
		"url" => "../assets/shoes/shoe_16.jpg",
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

	if ($collection === "men") {
		http_response_code(200);
		echo json_encode(array_values($men_shoes));
	} else {
		http_response_code(400);
		echo json_encode(['error' => 'Invalid collection']);
	}
} else {
	http_response_code(405);
	header('Content-Type: application/json');
	echo json_encode(['error' => 'Method Not Allowed']);
}
