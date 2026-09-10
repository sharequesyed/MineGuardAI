# MineGuard-AI — Step-by-Step SIH 2026 Demonstration Procedure

---

## Recommended 20-Step Live Demo Sequence

1. **Launch MineGuard-AI**: Open browser to MineGuard-AI dashboard.
2. **Demonstrate Hardware Mode**: Show connection selector mode (Web Serial / Simulation).
3. **Show Baseline State**: Show all 4 surface nodes (N1–N4) in `SAFE` baseline status.
4. **Deform Surface Platform (Stage 2)**: Mechanically incline node N3.
5. **Observe Tilt Warning**: Show UI response ($1.8^\circ \rightarrow$ Warning status badge).
6. **Extend Displacement Slider (Stage 3)**: Pull string mechanism between N3 and N4.
7. **Observe Correlated Deformation**: Show N3 & N4 linked deformation metrics.
8. **View GIS Risk Expansion (Stage 4)**: Open **Live GIS Map** to show Turf.js spatial risk boundary polygon expanding around N3–N4.
9. **Inspect AI Risk Classification**: Open **AI Risk Engine** page to show Random Forest score & `"Synthetic dataset validation — not field prediction accuracy"` disclaimer.
10. **Trigger Surface Crack Event (Stage 5)**: Disconnect continuity wire on N4.
11. **Observe Critical State**: Show `CRITICAL` state, red status badge, and alert drawer trigger.
12. **Verify Local Fail-safe**: Show active hardware buzzer/LED trigger on physical node.
13. **Check Browser Notification**: Show local Web Notification popup on laptop screen.
14. **Audit Alert Center**: Open **Alert Center** drawer and acknowledge the critical alert as operator.
15. **Inspect Multi-Hop Network Topology**: Open **Multi-Hop Relay** page to demonstrate primary/backup ESP-NOW packet headers (`packet_id`, `source`, `relay`, `hop_count`).
16. **Test Offline PWA Capability**: Disconnect Wi-Fi / Internet connection.
17. **Verify Continued Local Operation**: Show dashboard continues receiving live USB Web Serial telemetry.
18. **Check IndexedDB Queue**: Open **System Diagnostics** to show pending offline queue items increasing.
19. **Restore Internet Connection**: Re-enable network connectivity.
20. **Demonstrate Synchronization**: Click **[Sync Queued Telemetry]** to flush IndexedDB queue to cloud backend.
