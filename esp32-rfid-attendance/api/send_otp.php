<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

// Enable error logging but disable display for security
ini_set('display_errors', 0);
ini_set('log_errors', 1);

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(["status" => "error", "message" => $message]);
    exit;
}

$phone = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw_input = file_get_contents('php://input');
    $json_input = json_decode($raw_input, true);
    
    if (isset($json_input['phone'])) {
        $phone = trim($json_input['phone']);
    } elseif (isset($_POST['phone'])) {
        $phone = trim($_POST['phone']);
    }
}

if (empty($phone)) {
    sendError("Mobile number is required.");
}

// Clean and validate phone number (digits only, length 10 to 15, optional +)
$cleaned_phone = preg_replace('/[^\d+]/', '', $phone);
if (strlen($cleaned_phone) < 10 || strlen($cleaned_phone) > 15) {
    sendError("Invalid phone number format.");
}

// Ensure starts with country code. If 10 digits, default to +91 (India)
if (strlen($cleaned_phone) === 10 && $cleaned_phone[0] !== '+') {
    $cleaned_phone = '+91' . $cleaned_phone;
} elseif ($cleaned_phone[0] !== '+') {
    $cleaned_phone = '+' . $cleaned_phone;
}

// 1. Look up user by phone number
$stmt = $pdo->prepare("SELECT rfid_uid, name FROM users WHERE phone = ?");
$stmt->execute([$cleaned_phone]);
$user = $stmt->fetch();

if (!$user) {
    sendError("Mobile number not registered. Please contact the administrator.", 404);
}

$rfid_uid = $user['rfid_uid'];
$today_date = date('Y-m-d');

// 2. Check if attendance has already been marked today
$stmt = $pdo->prepare("SELECT id FROM attendance_logs WHERE rfid_uid = ? AND attendance_date = ?");
$stmt->execute([$rfid_uid, $today_date]);
if ($stmt->fetch()) {
    echo json_encode([
        "status" => "already_marked",
        "message" => "Attendance already marked for today.",
        "user" => $user['name']
    ]);
    exit;
}

// 3. Generate secure random 6-digit OTP
$otp_code = sprintf("%06d", mt_rand(100000, 999999));
$expires_at = date('Y-m-d H:i:s', strtotime('+5 minutes'));

// 4. Invalidate previous OTPs for this phone/UID
$stmt = $pdo->prepare("UPDATE otp_verifications SET expires_at = NOW() WHERE phone = ? AND is_verified = 0");
$stmt->execute([$cleaned_phone]);

// 5. Store OTP in database
$stmt = $pdo->prepare("INSERT INTO otp_verifications (phone, rfid_uid, otp_code, expires_at) VALUES (?, ?, ?, ?)");
$stmt->execute([$cleaned_phone, $rfid_uid, $otp_code, $expires_at]);
$transaction_id = $pdo->lastInsertId();

// 6. Send OTP
$sms_result = sendSmsOtp($cleaned_phone, $otp_code);

// Mask phone for response
$len = strlen($cleaned_phone);
$masked_phone = substr($cleaned_phone, 0, 3) . str_repeat('*', $len - 7) . substr($cleaned_phone, $len - 4);

if ($sms_result['success']) {
    echo json_encode([
        "status" => "success",
        "message" => "Verification OTP sent successfully.",
        "transaction_id" => (int)$transaction_id,
        "phone" => $masked_phone,
        "name" => $user['name'],
        // Include simulated OTP for local testing ease
        "simulated_otp" => (SMS_GATEWAY === 'simulated') ? $otp_code : null
    ]);
} else {
    error_log("SMS Send Failure details: " . json_encode($sms_result['error']));
    sendError("Failed to send OTP message. Please check config or try again.", 500);
}
?>
