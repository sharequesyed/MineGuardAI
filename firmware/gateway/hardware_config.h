#ifndef GATEWAY_HARDWARE_CONFIG_H
#define GATEWAY_HARDWARE_CONFIG_H

#include <Arduino.h>

/*
================================================================================
MINEGUARD-AI GATEWAY HARDWARE CONFIGURATION (ESP32-WROOM-32)
================================================================================
STATUS: PROVISIONAL / VERIFY WITH ACTUAL BOARD
================================================================================
*/

#define GATEWAY_ID "MG-GW-01"
#define SERIAL_BAUD_RATE 115200

#define AP_SSID "MineGuard_Gateway_AP"
#define AP_PASS "MineGuard2026"
#define AP_LOCAL_IP "192.168.4.1"

#endif // GATEWAY_HARDWARE_CONFIG_H
