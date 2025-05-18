<?php
// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Allowed HTTP methods
$allowedMethods = ['GET', 'POST', 'PATCH', 'DELETE'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Reject unsupported methods
if (!in_array($requestMethod, $allowedMethods)) {
    http_response_code(405); // Method Not Allowed
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// Routing table: map request paths to handler files
$routes = [
    'test' => './controllers/test-db.php',
    'login'  => './routes/login.php',
    'users'   => './routes/users.php',
    'products' => './routes/products.php',
    'orders' => './routes/orders.php',
    'sales' => './routes/sales.php'
];

// Normalize path: remove everything up to and including '/api/app.php'
$basePath = '/api/app.php';
$normalizedPath = $requestUri;
if (strpos($requestUri, $basePath) === 0) {
    $normalizedPath = substr($requestUri, strlen($basePath));
}
$normalizedPath = trim($normalizedPath, '/'); // remove leading/trailing slashes

$route = explode("/", $normalizedPath)[0];

//echo "path: " . $normalizedPath . "\n";
//echo "redirect: " . $route . "\n";

// Forward request to matched route
if (array_key_exists($route, $routes)) {
    require $routes[$route];
} else {
    http_response_code(404); // Not Found
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Route Not Found']);
}
