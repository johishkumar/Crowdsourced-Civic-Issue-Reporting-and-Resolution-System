<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

// Enable error logging but disable display for security
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$transaction_id = isset($_GET['transaction_id']) ? (int)$_GET['transaction_id'] : 0;

if ($transaction_id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing or invalid transaction ID."]);
    exit;
}

// Fetch the OTP verification record
$stmt = $pdo->prepare("
    SELECT o.is_verified, o.expires_at, o.rfid_uid, u.name 
    FROM otp_verifications o
    JOIN users u ON o.rfid_uid = u.rfid_uid
    WHERE o.id = ?
");
$stmt->execute([$transaction_id]);
$record = $stmt->fetch();

if (!$record) {
    echo json_encode(["status" => "not_found", "message" => "Transaction not found."]);
    exit;
}

$now = date('Y-m-d H:i:s');

if ($record['is_verified'] == 1) {
    // Verified successfully
    echo json_encode([
        "status" => "verified",
        "message" => "Verification successful. Attendance recorded.",
        "user" => $record['name'],
        "rfid_uid" => $record['rfid_uid']
    ]);
} elseif ($now > $record['expires_at']) {
    // Expired
    echo json_encode([
        "status" => "expired",
        "message" => "Verification session has expired. Please swipe card again."
    ]);
} else {
    // Verification is still pending
    echo json_encode([
        "status" => "pending",
        "message" => "Awaiting OTP code verification."
    ]);
}
?>
