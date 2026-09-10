/*
================================================================================
MINEGUARD-AI GATEWAY FIRMWARE (ESP32)
================================================================================
Target Board: ESP32-WROOM-32 (PROVISIONAL / VERIFY WITH ACTUAL BOARD)
Responsibilities:
1. ESP-NOW Receiver & Multi-Hop Packet Aggregator
2. Duplicate Packet Suppression (tracking packet_id / sequence)
3. Newline-delimited structured JSON output over USB Serial for Web Serial API
4. Local Wi-Fi Access Point (192.168.4.1) serving local HTTP landing page
================================================================================
*/

#include <esp_now.h>
#include <WiFi.h>
#include <WebServer.h>
#include "../sensor-node/hardware_config.h"
#include "hardware_config.h"

// WebServer running on port 80 for local Wi-Fi AP fallback
WebServer server(80);

// Duplicate packet suppression buffer
#define DUPLICATE_BUFFER_SIZE 20
String recentPacketIds[DUPLICATE_BUFFER_SIZE];
uint8_t dupIndex = 0;

// Last received node packet storage for local AP landing page
char lastPacketJson[512] = "{\"status\": \"Waiting for node telemetry...\"}";

bool isDuplicate(const char *packetId) {
    String pId = String(packetId);
    for (int i = 0; i < DUPLICATE_BUFFER_SIZE; i++) {
        if (recentPacketIds[i] == pId) {
            return true; // Duplicate detected
        }
    }
    recentPacketIds[dupIndex] = pId;
    dupIndex = (dupIndex + 1) % DUPLICATE_BUFFER_SIZE;
    return false;
}

void onDataRecv(const esp_now_recv_info *info, const uint8_t *incomingData, int len) {
    if (len != sizeof(SensorDataPacket)) {
        return; // Ignore malformed lengths
    }

    SensorDataPacket packet;
    memcpy(&packet, incomingData, sizeof(packet));

    // Duplicate Packet Suppression
    if (isDuplicate(packet.header.packet_id)) {
        return; // Suppress duplicate transmission
    }

    // Format Canonical JSON Payload for USB Serial Output (Web Serial API)
    snprintf(lastPacketJson, sizeof(lastPacketJson),
        "{\"node_id\":\"%s\",\"tilt_x_deg\":%.2f,\"tilt_y_deg\":%.2f,\"vibration_rms\":%.3f,\"displacement_mm\":%.1f,\"crack_detected\":%s,\"battery_percent\":%u,\"local_alarm\":%s,\"signal_strength\":%d,\"sequence\":%u,\"relay_header\":{\"packet_id\":\"%s\",\"source_node\":\"%s\",\"current_relay\":\"%s\",\"destination\":\"%s\",\"hop_count\":%u,\"ttl\":%u,\"sequence\":%u}}",
        packet.header.source_node,
        packet.tilt_x_deg,
        packet.tilt_y_deg,
        packet.vibration_rms,
        packet.displacement_mm,
        packet.crack_detected ? "true" : "false",
        packet.battery_percent,
        packet.local_alarm ? "true" : "false",
        packet.signal_strength,
        packet.sequence,
        packet.header.packet_id,
        packet.header.source_node,
        packet.header.current_relay,
        packet.header.destination,
        packet.header.hop_count,
        packet.header.ttl,
        packet.header.sequence
    );

    // Print to USB Serial (Newline Delimited for Browser Web Serial API)
    Serial.println(lastPacketJson);
}

void handleRoot() {
    String html = "<html><head><title>MineGuard-AI Gateway AP</title></head>";
    html += "<body style='font-family:sans-serif; padding:20px; background:#0F172A; color:#fff;'>";
    html += "<h2>MineGuard-AI Local Gateway AP (192.168.4.1)</h2>";
    html += "<p>Status: <b>ONLINE & AGGREGATING</b></p>";
    html += "<h3>Latest Telemetry JSON Packet:</h3>";
    html += "<pre style='background:#1E293B; p-3; border-radius:5px; padding:15px; color:#38BDF8;'>";
    html += String(lastPacketJson);
    html += "</pre></body></html>";
    server.send(200, "text/html", html);
}

void setup() {
    Serial.begin(SERIAL_BAUD_RATE);

    // Setup Local Access Point mode
    WiFi.mode(WIFI_AP_STA);
    WiFi.softAP(AP_SSID, AP_PASS);
    
    IPAddress apIP(192, 168, 4, 1);
    WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));

    // Initialize ESP-NOW
    if (esp_now_init() != ESP_OK) {
        Serial.println("Error initializing Gateway ESP-NOW");
        return;
    }

    esp_now_register_recv_cb(onDataRecv);

    // Setup WebServer endpoints for Local Wi-Fi mode
    server.on("/", handleRoot);
    server.begin();
    
    Serial.println("MineGuard-AI ESP32 Gateway Initialized.");
}

void loop() {
    server.handleClient();
    delay(10);
}
