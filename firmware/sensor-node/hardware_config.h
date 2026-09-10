#ifndef HARDWARE_CONFIG_H
#define HARDWARE_CONFIG_H

#include <Arduino.h>

/*
================================================================================
MINEGUARD-AI HARDWARE CONFIGURATION & PIN MAPPING (ESP32-WROOM-32)
================================================================================
STATUS: PROVISIONAL / VERIFY WITH ACTUAL BOARD

Pin Assignment Constraints & Board Guidelines:
- I2C Bus: GPIO 21 (SDA), GPIO 22 (SCL) - External 4.7k pull-up resistors required.
- Analog ADC Input: GPIO 34 (ADC1_CH6) - Note: Input-only pin, no internal pullup/pulldown.
- Crack Detector Continuity Pin: GPIO 4 - Digital Input with internal pull-up.
- Local Fail-Safe Buzzer Pin: GPIO 18 - Digital Output.
- Boot Pins Warning: Avoid GPIO 0, GPIO 2, GPIO 12, GPIO 15 for sensor inputs.
- Input-Only Pins: GPIO 34, 35, 36, 39 cannot be used as digital outputs.
================================================================================
*/

// Node Identification
#define CURRENT_NODE_ID "N03" // Change for each physical node: "N01", "N02", "N03", "N04"

// Sensor Pin Definitions (PROVISIONAL)
#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22

#define DISPLACEMENT_ADC_PIN 34 // String Potentiometer slider ADC input (0 - 3.3V)
#define CRACK_DETECTOR_PIN 4    // Continuity bridge check pin (LOW = Broken, HIGH = Intact)
#define BUZZER_ALARM_PIN 18     // Local Fail-Safe Buzzer / LED trigger output

// Prototype Threshold Definitions (PROTOTYPE / DEMONSTRATION THRESHOLDS)
#define TILT_WARNING_DEG 2.5f
#define TILT_CRITICAL_DEG 5.0f

#define DISPLACEMENT_WARNING_MM 6.0f
#define DISPLACEMENT_CRITICAL_MM 15.0f

#define VIBRATION_WARNING_RMS 0.40f
#define VIBRATION_CRITICAL_RMS 1.20f

// ESP-NOW Multi-Hop Relay Header Definition
typedef struct __attribute__((packed)) {
    char packet_id[24];      // e.g. "PKT_1002_N03"
    char source_node[8];     // e.g. "N03"
    char current_relay[8];   // e.g. "GW01"
    char destination[8];     // e.g. "GW01"
    uint8_t hop_count;       // 1, 2, 3...
    uint8_t ttl;             // Time To Live (default 10)
    uint32_t sequence;       // Packet sequence number
} MultiHopHeader;

// Canonical Sensor Data Packet Structure (Shared Firmware <-> Gateway <-> Web Serial)
typedef struct __attribute__((packed)) {
    MultiHopHeader header;
    float tilt_x_deg;
    float tilt_y_deg;
    float tilt_magnitude_deg;
    float vibration_rms;
    float vibration_peak;
    float vibration_variance;
    float displacement_mm;
    bool crack_detected;
    uint8_t battery_percent;
    bool local_alarm;
    int8_t signal_strength;
} SensorDataPacket;

#endif // HARDWARE_CONFIG_H
