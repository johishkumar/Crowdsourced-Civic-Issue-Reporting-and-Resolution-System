<?php
// Prevent direct access to config file
if (count(get_included_files()) === 1) {
    http_response_code(403);
    exit("Direct access forbidden.");
}

// Set default timezone
date_default_timezone_set('Asia/Kolkata'); // Update to user local timezone

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // Update password if applicable in XAMPP/WAMP
define('DB_NAME', 'rfid_attendance');

// API Security Key (ESP32 must include this in headers for verification)
define('API_SECRET_KEY', 'ESP32_SECURE_RFID_ATTENDANCE_API_KEY_2026');

// SMS Gateway Selection: 'twilio' or 'msg91' or 'simulated'
define('SMS_GATEWAY', 'simulated'); // Change to 'twilio' or 'msg91' for real SMS sending

// Twilio Configuration
define('TWILIO_SID', 'YOUR_TWILIO_ACCOUNT_SID');
define('TWILIO_AUTH_TOKEN', 'YOUR_TWILIO_AUTH_TOKEN');
define('TWILIO_FROM_NUMBER', '+1234567890'); // Twilio Phone Number

// MSG91 Configuration (For India)
define('MSG91_AUTHKEY', 'YOUR_MSG91_AUTH_KEY');
define('MSG91_TEMPLATE_ID', 'YOUR_MSG91_TEMPLATE_ID');

// Helper to send real SMS
function sendSmsOtp($to_phone, $otp_code) {
    $message = "Your RFID Attendance OTP is: " . $otp_code . ". Valid for 5 minutes. Do not share it.";
    
    if (SMS_GATEWAY === 'simulated') {
        // Log locally for development testing
        error_log("[SMS Gateway Simulated] OTP sent to $to_phone: $otp_code");
        return ['success' => true, 'mode' => 'simulated', 'otp' => $otp_code];
    }
    
    if (SMS_GATEWAY === 'twilio') {
        $url = "https://api.twilio.com/2010-04-01/Accounts/" . TWILIO_SID . "/Messages.json";
        $data = [
            'From' => TWILIO_FROM_NUMBER,
            'To' => $to_phone,
            'Body' => $message
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_USERPWD, TWILIO_SID . ":" . TWILIO_AUTH_TOKEN);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($http_code === 201 || $http_code === 200) {
            return ['success' => true, 'mode' => 'twilio'];
        } else {
            return ['success' => false, 'error' => $response];
        }
    }
    
    if (SMS_GATEWAY === 'msg91') {
        // MSG91 OTP endpoint
        $url = "https://api.msg91.com/api/v5/otp?template_id=" . MSG91_TEMPLATE_ID . "&mobile=" . urlencode($to_phone) . "&authkey=" . MSG91_AUTHKEY . "&otp=" . $otp_code;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $res_data = json_decode($response, true);
        if ($http_code === 200 && isset($res_data['type']) && $res_data['type'] === 'success') {
            return ['success' => true, 'mode' => 'msg91'];
        } else {
            return ['success' => false, 'error' => $response];
        }
    }
    
    return ['success' => false, 'error' => 'Invalid Gateway config'];
}
?>
