# MineGuard-AI — Communication Protocol & Multi-Hop Relay Header

---

## 1. ESP-NOW Multi-Hop Relay Header

The prototype wireless surface network uses ESP-NOW peer-to-peer frames augmented with multi-hop relay headers for deterministic routing between nodes N1, N2, N3, N4 and Gateway MG-GW-01.

### Header C-Struct (`hardware_config.h`)
```c
typedef struct __attribute__((packed)) {
    char packet_id[24];      // e.g. "PKT_1002_N03"
    char source_node[8];     // e.g. "N03"
    char current_relay[8];   // e.g. "GW01"
    char destination[8];     // e.g. "GW01"
    uint8_t hop_count;       // 1, 2, 3...
    uint8_t ttl;             // Time To Live
    uint32_t sequence;       // Sequence counter
} MultiHopHeader;
```

### Deterministic Routing Table
- **N1 Primary Route**: `N1 -> N2 -> GW01`
- **N1 Backup Route**: `N1 -> N3 -> GW01`
- **N2 Primary Route**: `N2 -> GW01`
- **N3 Primary Route**: `N3 -> GW01`
- **N4 Primary Route**: `N4 -> GW01`

### Duplicate Packet Suppression
The gateway maintains a ring buffer of the last 20 `packet_id` strings. If an incoming packet's `packet_id` matches an entry in the buffer, it is dropped to prevent loop duplication.

---

## 2. Web Serial API Output Format
The Gateway outputs newline-delimited single-line JSON string payloads over USB Serial at 115200 baud rate.
The browser's `WebSerialProvider` reads the stream line-by-line using `TextDecoderStream`.
