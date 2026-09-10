# MineGuard-AI — Sensor Calibration & Baseline Guide

---

## 1. MPU6050 Surface Tilt Calibration
1. Place sensor node on a verified level surface.
2. Power node and record baseline raw acceleration values ($a_x, a_y, a_z$).
3. Compute zero offsets for $X$ and $Y$ inclination.
4. Verify pitch/roll pitch changes by tilting node to known $15^\circ$ block.

## 2. String Potentiometer Relative Displacement Calibration
1. Connect slider mechanism between two monitored surface points (e.g. N2 and N3).
2. Measure baseline distance ($D_0$) in millimeters.
3. Record neutral ADC reading ($ADC_{base}$).
4. Displace mechanism by known $10\text{ mm}$ gauge block; compute conversion factor:
   $$\text{Scale Factor} = \frac{10\text{ mm}}{ADC_{displaced} - ADC_{base}}$$

## 3. Crack Detector Continuity Verification
1. Place conductive wire across surface split line.
2. Verify GPIO 4 reads `LOW` ($0\text{V}$) when wire bridge is unbroken.
3. Separate wire bridge; verify GPIO 4 switches to `HIGH` ($3.3\text{V}$) pull-up state.
