/**
 * ESP32 RFID Attendance Authentication Client
 * 
 * Hardware Connections:
 * RFID Reader RC522:
 *   - SDA (SS) -> GPIO 5
 *   - SCK      -> GPIO 18
 *   - MOSI     -> GPIO 23
 *   - MISO     -> GPIO 19
 *   - RST      -> GPIO 22
 *   - GND      -> GND
 *   - 3.3V     -> 3.3V
 * 
 * LED Indicators & Alert Buzzer:
 *   - Green LED -> GPIO 12 (Attendance Success)
 *   - Red LED   -> GPIO 14 (Authentication Error/Denied)
 *   - Buzzer    -> GPIO 13 (Acoustic beep feedback)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h> // Library: ArduinoJson by Benoit Blanchon (version 6+)

// WiFi Network Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server API Configuration
// Replace with your local XAMPP host server IP (e.g. "192.168.1.100")
const char* serverIp = "192.168.1.100"; 
const char* swipeApiUrl = "http://192.168.1.100/esp32-rfid-attendance/api/rfid_swipe.php";
const char* statusApiUrl = "http://192.168.1.100/esp32-rfid-attendance/api/check_status.php";
const char* apiKey = "ESP32_SECURE_RFID_ATTENDANCE_API_KEY_2026";

// Hardware Pins
#define SS_PIN    5
#define RST_PIN   22
#define GREEN_LED 12
#define RED_LED   14
#define BUZZER    13

// MFRC522 Instance
MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  
  // Initialize Pins
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER, LOW);

  // Initialize SPI Bus & MFRC522 Reader
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("RC522 RFID Reader initialized successfully.");

  // Connect to Wi-Fi
  connectWiFi();
}

void loop() {
  // Check WiFi Connection, reconnect if lost
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // Look for new RFID card tag swipes
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Read card UID
  Serial.print("RFID Card Detected. UID: ");
  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uidString += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uidString += String(mfrc522.uid.uidByte[i], HEX);
    if (i < mfrc522.uid.size - 1) {
      uidString += "-";
    }
  }
  uidString.toUpperCase();
  Serial.println(uidString);

  // Sound short buzzer chirp to confirm card read
  beepBuzzer(100);

  // Trigger registration to API backend
  registerRfidSwipe(uidString);

  // Halt PICC
  mfrc522.PICC_HaltA();
  // Stop encryption on PCD
  mfrc522.PCD_StopCrypto1();
  
  delay(1000); // Debounce delay
}

// Connect to WiFi network helper
void connectWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  // Blink RED LED slowly while connecting
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(RED_LED, HIGH);
    delay(250);
    digitalWrite(RED_LED, LOW);
    delay(250);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Connected successfully.");
  Serial.print("Local IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Flash GREEN LED 3 times to indicate network setup success
  for (int i = 0; i < 3; i++) {
    digitalWrite(GREEN_LED, HIGH);
    delay(100);
    digitalWrite(GREEN_LED, LOW);
    delay(100);
  }
}

// Sound buzzer helper
void beepBuzzer(int durationMs) {
  digitalWrite(BUZZER, HIGH);
  delay(durationMs);
  digitalWrite(BUZZER, LOW);
}

// Register Swipe request via REST API
void registerRfidSwipe(String uid) {
  HTTPClient http;
  http.begin(swipeApiUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", apiKey);

  // Prepare JSON body using ArduinoJson
  StaticJsonDocument<200> doc;
  doc["uid"] = uid;
  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("Registering swipe on server...");
  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Response: " + response);

    StaticJsonDocument<500> resDoc;
    DeserializationError error = deserializeJson(resDoc, response);

    if (!error) {
      String status = resDoc["status"];
      
      if (status == "pending") {
        int transactionId = resDoc["transaction_id"];
        String phone = resDoc["phone"];
        String name = resDoc["name"];
        
        Serial.printf("Swipe logged for %s. Awaiting SMS OTP verification for %s...\n", name.c_str(), phone.c_str());
        
        // Enter polling loop to wait for OTP verification completion
        awaitOtpVerification(transactionId);
      } 
      else if (status == "already_marked") {
        Serial.println("Attendance already logged for today.");
        // Double chirp buzzer & green light pulse
        digitalWrite(GREEN_LED, HIGH);
        beepBuzzer(150); delay(100); beepBuzzer(150);
        digitalWrite(GREEN_LED, LOW);
      }
      else {
        String msg = resDoc["message"];
        Serial.println("Server Error: " + msg);
        showFailureFeedback();
      }
    } else {
      Serial.println("JSON parse error.");
      showFailureFeedback();
    }
  } else {
    Serial.print("HTTP POST error: ");
    Serial.println(httpResponseCode);
    showFailureFeedback();
  }
  
  http.end();
}

// Polling status loop waiting for OTP check-in verification
void awaitOtpVerification(int transactionId) {
  unsigned long startMillis = millis();
  const unsigned long timeoutMs = 90000; // 90 seconds timeout (generous window for entering OTP)
  bool verified = false;

  // Blink Green LED slowly while awaiting verification
  while (millis() - startMillis < timeoutMs) {
    digitalWrite(GREEN_LED, HIGH);
    delay(200);
    digitalWrite(GREEN_LED, LOW);
    
    // Poll the status API
    HTTPClient http;
    String pollUrl = String(statusApiUrl) + "?transaction_id=" + String(transactionId);
    http.begin(pollUrl);
    
    int httpResponseCode = http.GET();
    if (httpResponseCode == 200) {
      String response = http.getString();
      StaticJsonDocument<200> resDoc;
      deserializeJson(resDoc, response);
      
      String status = resDoc["status"];
      
      if (status == "verified") {
        Serial.printf("Attendance confirmed for user: %s!\n", resDoc["user"].as<String>().c_str());
        verified = true;
        http.end();
        break;
      } 
      else if (status == "expired") {
        Serial.println("OTP code session expired.");
        http.end();
        break;
      }
    }
    http.end();
    
    delay(1800); // Poll roughly every 2 seconds (combining with the LED delay)
  }

  if (verified) {
    showSuccessFeedback();
  } else {
    Serial.println("OTP verification timed out or was rejected.");
    showFailureFeedback();
  }
}

// Attendance Success feedback loop
void showSuccessFeedback() {
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);
  
  // Sound buzzer with a long pleasant beep
  digitalWrite(BUZZER, HIGH);
  delay(600);
  digitalWrite(BUZZER, LOW);
  
  delay(1500);
  digitalWrite(GREEN_LED, LOW);
}

// Attendance Failure feedback loop
void showFailureFeedback() {
  digitalWrite(GREEN_LED, LOW);
  
  // Blink RED LED and chirp buzzer rapidly 3 times
  for (int i = 0; i < 3; i++) {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(BUZZER, HIGH);
    delay(150);
    digitalWrite(RED_LED, LOW);
    digitalWrite(BUZZER, LOW);
    delay(100);
  }
}
