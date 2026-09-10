# MineGuard-AI — Pin Mapping & Hardware Constraints

> [!WARNING]
> **PROVISIONAL PIN MAPPING NOTICE**: All pin definitions in `hardware_config.h` are provisional and must be verified against the exact ESP32 development board pinout variant used during physical assembly.

---

## ESP32 Surface Sensor Node Pinout

| Component | Component Pin | ESP32 GPIO | Electrical Type | Purpose / Board Constraints |
| :--- | :--- | :--- | :--- | :--- |
| **MPU6050** | SDA | `GPIO 21` | I2C Data | 3.3V Data (4.7k pullup required) |
| **MPU6050** | SCL | `GPIO 22` | I2C Clock | 3.3V Clock |
| **String Potentiometer** | Wiper Output | `GPIO 34` | Analog ADC1_CH6 | Input-only pin (0–3.3V range) |
| **Crack Detector** | Continuity Line | `GPIO 4` | Digital Input | Internal Pull-Up (LOW=Intact, HIGH=Broken) |
| **Local Fail-Safe Buzzer** | Positive VCC | `GPIO 18` | Digital Output | 3.3V High Trigger Output |

---

## ESP32 Board Constraint Warnings

1. **Input-Only Pins (`GPIO 34, 35, 36, 39`)**: These pins cannot be configured as digital outputs. They are used exclusively for ADC inputs (e.g. displacement slider).
2. **Boot Strapping Pins (`GPIO 0, 2, 12, 15`)**: Avoid connecting sensors to these pins during boot, as external pullups/pulldowns can prevent ESP32 firmware bootup.
3. **I2C Bus Compatibility**: GPIO 21 and 22 are default I2C pins. Ensure external 4.7kΩ pull-up resistors to 3.3V are installed if MPU6050 board lacks on-board pullups.
