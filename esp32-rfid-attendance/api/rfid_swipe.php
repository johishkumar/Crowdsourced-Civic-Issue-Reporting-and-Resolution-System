<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

// Enable error logging but disable display for security
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Helper to send json error responses
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(["status" => "error", "message" => $message]);
    exit;
}

// 1. API Secret Key Validation (Security Header check)
$headers = getallheaders();
$api_key = isset($headers['X-API-Key']) ? $headers['X-API-Key'] : (isset($_POST['key']) ? $_POST['key'] : '');

if ($api_key !== API_SECRET_KEY) {
    sendError("Unauthorized access. Invalid API key.", 401);
}

// 2. Fetch RFID UID from POST request (Support both URL-encoded and JSON body)
$uid = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw_input = file_get_contents('php://input');
    $json_input = json_decode($raw_input, true);
    
    if (isset($json_input['uid'])) {
        $uid = trim($json_input['uid']);
    } elseif (isset($_POST['uid'])) {
        $uid = trim($_POST['uid']);
    }
}

if (empty($uid)) {
    sendError("Missing RFID UID.");
}

// Format UID consistency
$uid = strtoupper(str_replace(' ', '-', $uid));

// 3. Look up user by RFID UID
$stmt = $pdo->prepare("SELECT id, name, phone FROM users WHERE rfid_uid = ?");
$stmt->execute([$uid]);
$user = $stmt->fetch();

if (!$user) {
    sendError("Access Denied. RFID card not registered.", 404);
}

$phone = $user['phone'];
$today_date = date('Y-m-d');

// 4. Check if attendance has already been marked today
$stmt = $pdo->prepare("SELECT id FROM attendance_logs WHERE rfid_uid = ? AND attendance_date = ?");
$stmt->execute([$uid, $today_date]);
if ($stmt->fetch()) {
    echo json_encode([
        "status" => "already_marked",
        "message" => "Attendance already marked for today.",
        "user" => $user['name']
    ]);
    exit;
}

// 5. Generate secure random 6-digit OTP
$otp_code = sprintf("%06d", mt_rand(100000, 999999));
$expires_at = date('Y-m-d H:i:s', strtotime('+5 minutes'));

// 6. Invalidate previous OTPs for this phone/UID
$stmt = $pdo->prepare("UPDATE otp_verifications SET expires_at = NOW() WHERE rfid_uid = ? AND is_verified = 0");
$stmt->execute([$uid]);

// 7. Store OTP in database
$stmt = $pdo->prepare("INSERT INTO otp_verifications (phone, rfid_uid, otp_code, expires_at) VALUES (?, ?, ?, ?)");
$stmt->execute([$phone, $uid, $otp_code, $expires_at]);
$transaction_id = $pdo->lastInsertId();

// 8. Trigger real SMS transmission via configured Gateway
$sms_result = sendSmsOtp($phone, $otp_code);

// Hide middle digits of phone number for privacy when returning payload
$len = strlen($phone);
$masked_phone = substr($phone, 0, 3) . str_repeat('*', $len - 7) . substr($phone, $len - 4);

if ($sms_result['success']) {
    echo json_encode([
        "status" => "pending",
        "message" => "OTP generated and sent to phone.",
        "transaction_id" => (int)$transaction_id,
        "phone" => $masked_phone,
        "name" => $user['name'],
        // Include simulated OTP for local testing ease
        "simulated_otp" => (SMS_GATEWAY === 'simulated') ? $otp_code : null
    ]);
} else {
    // Graceful fallback detail logging
    error_log("SMS Send Failure details: " . json_encode($sms_result['error']));
    sendError("Failed to dispatch verification SMS. Please try again later.", 500);
}
?>
