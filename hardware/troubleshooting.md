# MineGuard-AI — Troubleshooting Matrix

---

| Issue Symptom | Root Cause | Corrective Action |
| :--- | :--- | :--- |
| **ESP32 Port Not Recognized on Laptop** | Missing USB UART Driver | Install Silicon Labs CP210x or WCH CH340 driver for presentation laptop. |
| **Web Serial "Permission Denied"** | Port locked by another process | Close Arduino Serial Monitor / PuTTY before opening browser. |
| **MPU6050 Reading Constant 0.0°** | I2C Communication Failure | Check SDA/SCL wire connections (GPIO 21/22) and 3.3V VCC pin power. |
| **Displacement Value Fluctuating** | Unstable ADC Voltage Reference | Add a 0.1µF decoupling capacitor across potentiometer ADC signal pin and GND. |
| **False Crack Events Triggered** | Loose Continuity Wire Connection | Secure alligator clips on conductive bridge wire and verify pull-up state. |
| **ESP-NOW Packets Dropped** | Gateway Channel Mismatch | Ensure both sensor node and gateway operate on identical Wi-Fi channel (Channel 1). |
| **Browser Shows HARDWARE DISCONNECTED** | Serial Cable Removal / Port Closed | Reconnect USB cable and click **[ Connect Hardware ]** to select port again. |
