<?php
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
    '/login'  => './routes/login.php',
    '/user'   => './routes/user.php',
    '/delete' => './routes/delete.php',
    '/update' => './routes/update.php'
];

// Remove '/api/app.php' from the beginning of the path
$normalizedPath = str_replace('/api/app.php', '', $requestUri);

// Forward request to matched route
if (array_key_exists($normalizedPath, $routes)) {
    require $routes[$normalizedPath];
} else {
    http_response_code(404); // Not Found
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Route Not Found']);
}
