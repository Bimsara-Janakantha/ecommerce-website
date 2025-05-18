<?php
require_once __DIR__ . '/../utils/db.php';

header('Content-Type: application/json');
$db = Database::getInstance();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $userId = (int)($data['userId'] ?? 0);
    $totalAmount = (float)($data['totalAmount'] ?? 0);
    $couponCode = trim($data['couponCode'] ?? '');
    $couponAmnt = (float)($data['coupon'] ?? 0);
    $discount = (float)($data['discount'] ?? 0);
    $fName = trim($data['fName'] ?? '');
    $lName = trim($data['lName'] ?? '');
    $email = trim($data['email'] ?? '');
    $mobile = trim($data['mobile'] ?? '');
    $street = trim($data['street'] ?? '');
    $apt = trim($data['apt'] ?? '');
    $city = trim($data['city'] ?? '');
    $province = trim($data['province'] ?? '');
    $postal = trim($data['postal'] ?? '');
    $notes = trim($data['note'] ?? '');
    $items = $data['items'] ?? [];

    if ($userId < 1 || $totalAmount <= 0 || empty($email) || empty($fName) || empty($lName) || empty($mobile) || empty($street) || empty($city) || empty($province) || empty($postal) || empty($items)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required order fields']);
        exit;
    }

    // Step 1: Validate coupon (if provided)
    if (!empty($couponCode)) {
        $coupon = $db->fetch("SELECT * FROM COUPONS WHERE couponCode = :code", [
            ':code' => $couponCode
        ]);

        if (!$coupon) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid coupon code']);
            exit;
        }

        $today = date('Y-m-d');
        if ($today > $coupon['validTill']) {
            http_response_code(400);
            echo json_encode(['error' => 'Coupon has expired']);
            exit;
        }

        if ($totalAmount < $coupon['minBill']) {
            http_response_code(400);
            echo json_encode(['error' => 'Minimum bill not reached for coupon']);
            exit;
        }

        // Cap discount if it exceeds maxValue
        if ($couponAmnt !== (float)($coupon['maxDiscount'])) {
            echo "cpnAmnt: " . $couponAmnt . "\t coupon['maxDiscount']: " . $coupon['maxDiscount'] . "\n";
            http_response_code(400);
            echo json_encode(['error' => 'Invalid coupon']);
            exit;
        }
    } else {
        $couponCode = null;
    }

    // Step 2: Insert order if everything is valid
    $db->execute("
    INSERT INTO ORDERS (
        userId, totalAmount, couponCode, discount,
        fName, lName, email, mobile,
        street, apt, city, province, postal, notes
    ) VALUES (
        :userId, :totalAmount, :couponCode, :discount,
        :fName, :lName, :email, :mobile,
        :street, :apt, :city, :province, :postal, :notes
    )
    ", [
        ':userId' => $userId,
        ':totalAmount' => $totalAmount - $discount,
        ':couponCode' => $couponCode,
        ':discount' => $discount,
        ':fName' => $fName,
        ':lName' => $lName,
        ':email' => $email,
        ':mobile' => $mobile,
        ':street' => $street,
        ':apt' => $apt,
        ':city' => $city,
        ':province' => $province,
        ':postal' => $postal,
        ':notes' => $notes
    ]);

    $orderId = $db->lastInsertId();

    // Step 3: Insert order items and update product stock
    $orderItemSQL = "
        INSERT INTO ORDER_ITEMS (orderId, shoeId, size, quantity)
        VALUES (:orderId, :shoeId, :size, :quantity)
    ";

    $checkStockSQL = "
        SELECT quantity FROM PRODUCT_SIZES WHERE shoeId = :shoeId AND size = :size
    ";

    $updateStockSQL = "
        UPDATE PRODUCT_SIZES
        SET quantity = quantity - :quantity
        WHERE shoeId = :shoeId AND size = :size
    ";

    foreach ($items as $item) {
        $shoeId = (int)($item['shoeId'] ?? 0);
        $size = (int)($item['size'] ?? 0);
        $quantity = (int)($item['quantity'] ?? 0);

        if ($shoeId < 1 || $size < 1 || $quantity < 1) continue;

        // Step 3a: Check stock
        $stock = $db->fetch($checkStockSQL, [':shoeId' => $shoeId, ':size' => $size]);
        if (!$stock || $stock['quantity'] < $quantity) {
            http_response_code(409);
            echo json_encode(['error' => "Insufficient stock for item ID $shoeId"]);
            exit;
        }

        // Step 3b: Insert order item
        $db->execute($orderItemSQL, [
            ':orderId' => $orderId,
            ':shoeId' => $shoeId,
            ':size' => $size,
            ':quantity' => $quantity
        ]);

        // Step 3c: Reduce stock
        $db->execute($updateStockSQL, [
            ':shoeId' => $shoeId,
            'size' => $size,
            ':quantity' => $quantity
        ]);
    }

    http_response_code(201);
    echo json_encode([
        'message' => 'Order placed successfully',
        'orderId' => $orderId
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
