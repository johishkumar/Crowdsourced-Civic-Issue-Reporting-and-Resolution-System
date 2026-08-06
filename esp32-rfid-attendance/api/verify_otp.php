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
$transaction_id = 0;
$otp = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw_input = file_get_contents('php://input');
    $json_input = json_decode($raw_input, true);
    
    if (isset($json_input['otp'])) {
        $otp = trim($json_input['otp']);
        $phone = isset($json_input['phone']) ? trim($json_input['phone']) : '';
        $transaction_id = isset($json_input['transaction_id']) ? (int)$json_input['transaction_id'] : 0;
    } elseif (isset($_POST['otp'])) {
        $otp = trim($_POST['otp']);
        $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
        $transaction_id = isset($_POST['transaction_id']) ? (int)$_POST['transaction_id'] : 0;
    }
}

if (empty($otp)) {
    sendError("OTP code is required.");
}

if (strlen($otp) !== 6 || !ctype_digit($otp)) {
    sendError("OTP must be a 6-digit number.");
}

// Format phone if provided
$cleaned_phone = '';
if (!empty($phone)) {
    $cleaned_phone = preg_replace('/[^\d+]/', '', $phone);
    if (strlen($cleaned_phone) === 10 && $cleaned_phone[0] !== '+') {
        $cleaned_phone = '+91' . $cleaned_phone;
    } elseif ($cleaned_phone[0] !== '+') {
        $cleaned_phone = '+' . $cleaned_phone;
    }
}

// 1. Retrieve the active OTP session
if ($transaction_id > 0) {
    $stmt = $pdo->prepare("SELECT * FROM otp_verifications WHERE id = ?");
    $stmt->execute([$transaction_id]);
} else {
    $stmt = $pdo->prepare("SELECT * FROM otp_verifications WHERE phone = ? AND is_verified = 0 ORDER BY id DESC LIMIT 1");
    $stmt->execute([$cleaned_phone]);
}
$record = $stmt->fetch();

if (!$record) {
    sendError("No active verification session found. Please request a new OTP.");
}

// 2. Security Check: Block if verified, expired, or max attempts reached
if ($record['is_verified'] == 1) {
    sendError("This OTP has already been verified. Reuse is prohibited.", 400);
}

if (date('Y-m-d H:i:s') > $record['expires_at']) {
    sendError("This OTP code has expired (5-minute validity limit). Please request a new one.", 400);
}

if ($record['attempts'] >= 3) {
    sendError("Maximum attempts reached (3/3 limit). This OTP is now locked. Please request a new code.", 403);
}

// 3. Increment verification attempt counter
$new_attempts = $record['attempts'] + 1;
$stmt = $pdo->prepare("UPDATE otp_verifications SET attempts = ? WHERE id = ?");
$stmt->execute([$new_attempts, $record['id']]);

// 4. Verify OTP code
if ($otp !== $record['otp_code']) {
    $remaining = 3 - $new_attempts;
    if ($remaining <= 0) {
        sendError("Incorrect OTP code. Maximum attempts reached. This OTP is now locked.");
    } else {
        sendError("Incorrect OTP code. Remaining attempts: " . $remaining);
    }
}

// 5. Success! Mark OTP as verified
$stmt = $pdo->prepare("UPDATE otp_verifications SET is_verified = 1 WHERE id = ?");
$stmt->execute([$record['id']]);

// 6. Record user attendance details in MySQL log
$rfid_uid = $record['rfid_uid'];
$phone_final = $record['phone'];
$attendance_date = date('Y-m-d');
$attendance_time = date('H:i:s');

// Look up user name
$stmt = $pdo->prepare("SELECT name FROM users WHERE rfid_uid = ?");
$stmt->execute([$rfid_uid]);
$user = $stmt->fetch();
$user_name = $user ? $user['name'] : 'Unknown User';

try {
    $stmt = $pdo->prepare("
        INSERT INTO attendance_logs (rfid_uid, phone, attendance_date, attendance_time, status) 
        VALUES (?, ?, ?, ?, 'Present')
    ");
    $stmt->execute([$rfid_uid, $phone_final, $attendance_date, $attendance_time]);
} catch (PDOException $e) {
    // If double submission happened, handle UNIQUE key constraint gracefully
    if ($e->getCode() == 23000 || strpos($e->getMessage(), '1062') !== false) {
        echo json_encode([
            "status" => "success",
            "message" => "Attendance already logged for today.",
            "user" => $user_name
        ]);
        exit;
    }
    error_log("Failed logging attendance record: " . $e->getMessage());
    sendError("Failed to record attendance logs in database.", 500);
}

// Respond with confirmation details
echo json_encode([
    "status" => "success",
    "message" => "Attendance recorded successfully!",
    "user" => $user_name,
    "date" => date('d-M-Y', strtotime($attendance_date)),
    "time" => date('h:i A', strtotime($attendance_time))
]);
?>
