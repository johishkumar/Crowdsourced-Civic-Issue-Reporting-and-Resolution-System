CREATE DATABASE IF NOT EXISTS rfid_attendance;
USE rfid_attendance;

-- Table to store registered user profiles
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfid_uid VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table to manage temporary OTP verification codes
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    rfid_uid VARCHAR(50) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    attempts INT DEFAULT 0,
    is_verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (phone),
    INDEX (rfid_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table to store finalized attendance logs
CREATE TABLE IF NOT EXISTS attendance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfid_uid VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily_attendance (rfid_uid, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed a dummy user for testing
INSERT INTO users (rfid_uid, name, phone) 
VALUES ('DE-AD-BE-EF', 'Rajesh Kumar', '+919999999999')
ON DUPLICATE KEY UPDATE name = name;
