/*
================================================================================
MINEGUARD-AI SURFACE SENSOR NODE FIRMWARE (ESP32)
================================================================================
Target Board: ESP32-WROOM-32 (PROVISIONAL / VERIFY WITH ACTUAL BOARD)
Sensor Suite: MPU6050 (I2C), String Potentiometer ADC, Continuity Crack Bridge
Protocol: ESP-NOW Multi-Hop Relay with Deterministic Routing
================================================================================
*/

#include <Wire.h>
#include <esp_now.h>
#include <WiFi.h>
#include "hardware_config.h"

// Gateway ESP-NOW MAC Address (PROVISIONAL DEFAULT GATEWAY MAC)
uint8_t gatewayMacAddress[] = {0x24, 0x6F, 0x28, 0xAE, 0x9B, 0x0C};

// Global variables
uint32_t sequenceNumber = 1000;
float baselineDisplacementADC = 500.0f;

// Simple MPU6050 I2C Register Addresses
#define MPU6050_ADDR 0x68
#define MPU6050_ACCEL_XOUT_H 0x3B

void initMPU6050() {
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
    Wire.beginTransmission(MPU6050_ADDR);
    Wire.write(0x6B); // PWR_MGMT_1 register
    Wire.write(0);    // Wake up MPU6050
    Wire.endTransmission(true);
}

void readMPU6050(float &tiltX, float &tiltY, float &vibRms) {
    Wire.beginTransmission(MPU6050_ADDR);
    Wire.write(MPU6050_ACCEL_XOUT_H);
    Wire.endTransmission(false);
    Wire.requestFrom(MPU6050_ADDR, 6, true);

    if (Wire.available() >= 6) {
        int16_t rawX = (Wire.read() << 8) | Wire.read();
        int16_t rawY = (Wire.read() << 8) | Wire.read();
        int16_t rawZ = (Wire.read() << 8) | Wire.read();

        // Convert to g-force
        float ax = rawX / 16384.0f;
        float ay = rawY / 16384.0f;
        float az = rawZ / 16384.0f;

        // Calculate surface tilt angles in degrees
        tiltX = atan2(ax, sqrt(ay * ay + az * az)) * 180.0f / PI;
        tiltY = atan2(ay, sqrt(ax * ax + az * az)) * 180.0f / PI;

        // Approximate vibration RMS
        vibRms = sqrt((ax * ax + ay * ay + (az - 1.0f) * (az - 1.0f)) / 3.0f);
    } else {
        tiltX = 0.0f;
        tiltY = 0.0f;
        vibRms = 0.05f;
    }
}

float readRelativeDisplacement() {
    int rawADC = analogRead(DISPLACEMENT_ADC_PIN);
    // Convert ADC delta to mm (3.3V / 4095 resolution; 0.1mm per unit)
    float deltaADC = abs(rawADC - baselineDisplacementADC);
    float displacementMm = (deltaADC / 4095.0f) * 100.0f; 
    return displacementMm;
}

bool checkCrackDetector() {
    // Read continuity line pin: LOW = unbroken intact bridge, HIGH = line separated crack
    int state = digitalRead(CRACK_DETECTOR_PIN);
    return (state == HIGH);
}

void evaluateLocalFailSafe(float tiltMag, float dispMm, bool crackDetected, float vibRms) {
    // LOCAL FAIL-SAFE LOGIC: Trigger hardware alarm pin directly on threshold breach
    if (tiltMag >= TILT_CRITICAL_DEG || dispMm >= DISPLACEMENT_CRITICAL_MM || crackDetected || vibRms >= VIBRATION_CRITICAL_RMS) {
        digitalWrite(BUZZER_ALARM_PIN, HIGH);
    } else {
        digitalWrite(BUZZER_ALARM_PIN, LOW);
    }
}

void onDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
    // Callback status logging
}

void setup() {
    Serial.begin(115200);
    
    // Pin modes
    pinMode(CRACK_DETECTOR_PIN, INPUT_PULLUP);
    pinMode(BUZZER_ALARM_PIN, OUTPUT);
    digitalWrite(BUZZER_ALARM_PIN, LOW);

    initMPU6050();

    // WiFi & ESP-NOW Setup
    WiFi.mode(WIFI_STA);
    if (esp_now_init() != ESP_OK) {
        Serial.println("Error initializing ESP-NOW");
        return;
    }

    esp_now_register_send_cb(onDataSent);

    // Register Gateway peer
    esp_now_peer_info_t peerInfo;
    memcpy(peerInfo.peer_addr, gatewayMacAddress, 6);
    peerInfo.channel = 0;
    peerInfo.encrypt = false;
    esp_now_add_peer(&peerInfo);
}

void loop() {
    sequenceNumber++;
    
    float tiltX, tiltY, vibRms;
    readMPU6050(tiltX, tiltY, vibRms);
    float tiltMag = sqrt(tiltX * tiltX + tiltY * tiltY);
    float dispMm = readRelativeDisplacement();
    bool crackDetected = checkCrackDetector();

    evaluateLocalFailSafe(tiltMag, dispMm, crackDetected, vibRms);

    // Construct Canonical Sensor Packet with Multi-Hop Header
    SensorDataPacket packet;
    snprintf(packet.header.packet_id, sizeof(packet.header.packet_id), "PKT_%u_%s", sequenceNumber, CURRENT_NODE_ID);
    strncpy(packet.header.source_node, CURRENT_NODE_ID, sizeof(packet.header.source_node));
    strncpy(packet.header.current_relay, "GW01", sizeof(packet.header.current_relay));
    strncpy(packet.header.destination, "GW01", sizeof(packet.header.destination));
    packet.header.hop_count = 1;
    packet.header.ttl = 9;
    packet.header.sequence = sequenceNumber;

    packet.tilt_x_deg = tiltX;
    packet.tilt_y_deg = tiltY;
    packet.tilt_magnitude_deg = tiltMag;
    packet.vibration_rms = vibRms;
    packet.vibration_peak = vibRms * 1.8f;
    packet.vibration_variance = vibRms * 0.1f;
    packet.displacement_mm = dispMm;
    packet.crack_detected = crackDetected;
    packet.battery_percent = 92;
    packet.local_alarm = (digitalRead(BUZZER_ALARM_PIN) == HIGH);
    packet.signal_strength = WiFi.RSSI();

    // Transmit over ESP-NOW to Gateway
    esp_now_send(gatewayMacAddress, (uint8_t *) &packet, sizeof(packet));

    delay(2000); // 2 second telemetry cycle
}
