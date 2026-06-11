/*
 * AegisNet LoRaWAN Mesh Node Firmware
 * Target: Heltec ESP32 LoRa v3 / Custom ESP32 + SX1262
 * Document: 06 - AegisNet LoRaWAN Mesh Network
 */

#include <Arduino.h>
#include <RadioLib.h>
#include <SPIFFS.h>
#include <WiFi.h>
#include <ArduinoJson.h>

// LoRa configuration
#define LORA_FREQ           868.0F  // MHz (EU/Africa ISM band)
#define LORA_BANDWIDTH      125.0F  // kHz
#define LORA_SPREADING      7
#define LORA_CODING_RATE    4
#define LORA_POWER          20      // dBm
#define LORA_SYNC_WORD      0xAE    // Aegis network sync word

// Pins for Heltec ESP32 LoRa v3
#define PIN_CS              8
#define PIN_IRQ             14
#define PIN_RST             12
#define PIN_GPIO            13

// Mesh protocol constants
#define MSG_TYPE_ALERT      0x01
#define MSG_TYPE_HEARTBEAT  0x02
#define MSG_TYPE_ACK        0x03
#define MSG_TYPE_DATA       0x04
#define MSG_TYPE_ROUTE_REQ  0x05
#define MSG_TYPE_ROUTE_RESP 0x06

#define MAX_HOPS            8
#define TTL_DEFAULT         30      // seconds

struct MeshHeader {
    uint8_t version;
    uint8_t msg_type;
    uint8_t ttl;
    uint8_t hop_count;
    uint32_t node_id;
    uint32_t dest_id;
    uint32_t seq_num;
    uint16_t payload_len;
    uint32_t timestamp;
} __attribute__((packed));

// AES-256 encryption key (loaded from secure storage in production)
uint8_t network_key[32] = {0};

// Node state
uint32_t node_id;
uint32_t sequence_number = 0;
uint16_t message_count = 0;

// Routing table
struct RouteEntry {
    uint32_t dest_id;
    uint32_t next_hop;
    uint8_t hop_count;
    uint32_t last_seen;
    int16_t rssi;
};

#define MAX_ROUTES 32
RouteEntry routing_table[MAX_ROUTES];
int route_count = 0;

SX1262 radio = new Module(PIN_CS, PIN_IRQ, PIN_RST, PIN_GPIO);

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("=== AegisNet Mesh Node Starting ===");

    // Initialize SPIFFS for local storage
    if (!SPIFFS.begin(true)) {
        Serial.println("SPIFFS initialization failed");
    }

    // Generate unique node ID from MAC address
    uint8_t mac[6];
    esp_read_mac(mac, ESP_MAC_WIFI_STA);
    node_id = (mac[0] << 24) | (mac[1] << 16) | (mac[2] << 8) | mac[3];
    Serial.printf("Node ID: 0x%08X\n", node_id);

    // Initialize LoRa radio
    int state = radio.begin(LORA_FREQ, LORA_BANDWIDTH, LORA_SPREADING, LORA_CODING_RATE, LORA_SYNC_WORD, LORA_POWER);
    if (state != RADIOLIB_ERR_NONE) {
        Serial.printf("Radio init failed: %d\n", state);
        while (1) delay(100);
    }

    // Enable CRC and set preamble
    radio.setCRC(true);
    radio.setPreambleLength(8);

    Serial.println("Radio initialized successfully");
    Serial.println("=== Ready for mesh operations ===");
}

void loop() {
    // Check for incoming packets
    receive_packet();

    // Send periodic heartbeat
    static unsigned long last_heartbeat = 0;
    if (millis() - last_heartbeat > 30000) {
        send_heartbeat();
        last_heartbeat = millis();
    }

    // Clean stale routes
    clean_routing_table();

    delay(10);
}

void send_heartbeat() {
    StaticJsonDocument<256> doc;
    doc["type"] = "heartbeat";
    doc["node_id"] = node_id;
    doc["timestamp"] = millis();
    doc["uptime"] = millis() / 1000;
    doc["messages"] = message_count;

    char payload[256];
    serializeJson(doc, payload, sizeof(payload));

    MeshHeader header = {
        .version = 1,
        .msg_type = MSG_TYPE_HEARTBEAT,
        .ttl = TTL_DEFAULT,
        .hop_count = 0,
        .node_id = node_id,
        .dest_id = 0xFFFFFFFF,  // Broadcast
        .seq_num = sequence_number++,
        .payload_len = strlen(payload),
        .timestamp = millis(),
    };

    transmit_packet(header, (uint8_t*)payload, strlen(payload));
}

void send_alert(const char* alert_data) {
    MeshHeader header = {
        .version = 1,
        .msg_type = MSG_TYPE_ALERT,
        .ttl = TTL_DEFAULT,
        .hop_count = 0,
        .node_id = node_id,
        .dest_id = 0xFFFFFFFF,  // Broadcast to all
        .seq_num = sequence_number++,
        .payload_len = strlen(alert_data),
        .timestamp = millis(),
    };

    transmit_packet(header, (uint8_t*)alert_data, strlen(alert_data));
    Serial.println("Emergency alert broadcast sent");
}

void transmit_packet(MeshHeader& header, uint8_t* payload, uint16_t len) {
    // Build packet: header + encrypted payload
    uint8_t packet[512];
    memcpy(packet, &header, sizeof(header));
    
    // Simple XOR encryption (replace with AES-256-GCM in production)
    for (int i = 0; i < len && i < (sizeof(packet) - sizeof(header)); i++) {
        packet[sizeof(header) + i] = payload[i] ^ network_key[i % 32];
    }

    int state = radio.transmit(packet, sizeof(header) + len);
    if (state == RADIOLIB_ERR_NONE) {
        message_count++;
        Serial.printf("TX: type=%d seq=%lu hops=%d\n", header.msg_type, header.seq_num, header.hop_count);
    }
}

void receive_packet() {
    int state = radio.receive(0);  // Non-blocking check
    if (state != RADIOLIB_ERR_NONE) return;

    size_t len = radio.getPacketLength();
    if (len < sizeof(MeshHeader)) return;

    uint8_t packet[512];
    state = radio.readData(packet, len);
    if (state != RADIOLIB_ERR_NONE) return;

    MeshHeader header;
    memcpy(&header, packet, sizeof(header));

    // Check version and TTL
    if (header.version != 1 || header.ttl == 0 || header.hop_count >= MAX_HOPS) {
        return;
    }

    // Ignore own packets
    if (header.node_id == node_id) return;

    // Decrypt payload
    uint16_t payload_len = len - sizeof(header);
    uint8_t payload[512];
    for (int i = 0; i < payload_len; i++) {
        payload[i] = packet[sizeof(header) + i] ^ network_key[i % 32];
    }
    payload[payload_len] = '\0';

    // Update routing table
    update_route(header.node_id, header.node_id, 0, radio.getRSSI());

    // Process based on message type
    switch (header.msg_type) {
        case MSG_TYPE_ALERT:
            handle_alert(header, payload, payload_len);
            break;
        case MSG_TYPE_HEARTBEAT:
            handle_heartbeat(header);
            break;
        case MSG_TYPE_ACK:
            handle_ack(header);
            break;
        case MSG_TYPE_ROUTE_REQ:
            handle_route_request(header);
            break;
        case MSG_TYPE_ROUTE_RESP:
            handle_route_response(header, payload, payload_len);
            break;
        default:
            handle_data(header, payload, payload_len);
    }

    // Forward if not destination and TTL allows
    if (header.dest_id != node_id && header.dest_id != 0xFFFFFFFF) {
        forward_packet(header, payload, payload_len);
    } else if (header.dest_id == 0xFFFFFFFF && header.hop_count < MAX_HOPS) {
        forward_packet(header, payload, payload_len);
    }
}

void forward_packet(MeshHeader& header, uint8_t* payload, uint16_t len) {
    header.ttl--;
    header.hop_count++;
    transmit_packet(header, payload, len);
}

void handle_alert(MeshHeader& header, uint8_t* payload, uint16_t len) {
    Serial.println("=== EMERGENCY ALERT RECEIVED ===");
    Serial.printf("From: 0x%08X, Hops: %d, RSSI: %d dBm\n", header.node_id, header.hop_count, radio.getRSSI());
    
    // Forward to MQTT broker if gateway
    // In production, this connects to ChirpStack or custom MQTT
    
    // Send ACK back
    MeshHeader ack = {
        .version = 1,
        .msg_type = MSG_TYPE_ACK,
        .ttl = TTL_DEFAULT,
        .hop_count = 0,
        .node_id = node_id,
        .dest_id = header.node_id,
        .seq_num = header.seq_num,
        .payload_len = 0,
        .timestamp = millis(),
    };
    transmit_packet(ack, nullptr, 0);
}

void handle_heartbeat(MeshHeader& header) {
    update_route(header.node_id, header.node_id, 0, radio.getRSSI());
}

void handle_ack(MeshHeader& header) {
    Serial.printf("ACK from 0x%08X for seq %lu\n", header.node_id, header.seq_num);
}

void handle_route_request(MeshHeader& header) {
    // Reply with route info
    MeshHeader resp = {
        .version = 1,
        .msg_type = MSG_TYPE_ROUTE_RESP,
        .ttl = TTL_DEFAULT,
        .hop_count = 0,
        .node_id = node_id,
        .dest_id = header.node_id,
        .seq_num = sequence_number++,
        .payload_len = 0,
        .timestamp = millis(),
    };
    transmit_packet(resp, nullptr, 0);
}

void handle_route_response(MeshHeader& header, uint8_t* payload, uint16_t len) {
    update_route(header.node_id, header.node_id, header.hop_count, radio.getRSSI());
}

void handle_data(MeshHeader& header, uint8_t* payload, uint16_t len) {
    Serial.printf("Data from 0x%08X, len=%d\n", header.node_id, len);
}

void update_route(uint32_t dest, uint32_t next_hop, uint8_t hops, int16_t rssi) {
    for (int i = 0; i < route_count; i++) {
        if (routing_table[i].dest_id == dest) {
            // Update if better path
            if (hops < routing_table[i].hop_count || 
                (hops == routing_table[i].hop_count && rssi > routing_table[i].rssi)) {
                routing_table[i].next_hop = next_hop;
                routing_table[i].hop_count = hops;
                routing_table[i].rssi = rssi;
            }
            routing_table[i].last_seen = millis();
            return;
        }
    }

    if (route_count < MAX_ROUTES) {
        routing_table[route_count++] = {
            .dest_id = dest,
            .next_hop = next_hop,
            .hop_count = hops,
            .last_seen = millis(),
            .rssi = rssi,
        };
    }
}

void clean_routing_table() {
    uint32_t now = millis();
    for (int i = route_count - 1; i >= 0; i--) {
        if (now - routing_table[i].last_seen > 300000) {  // 5 minutes
            routing_table[i] = routing_table[--route_count];
        }
    }
}

void print_routing_table() {
    Serial.println("--- Routing Table ---");
    for (int i = 0; i < route_count; i++) {
        Serial.printf("  0x%08X -> 0x%08X (%d hops, %d dBm, %lus ago)\n",
            routing_table[i].dest_id,
            routing_table[i].next_hop,
            routing_table[i].hop_count,
            routing_table[i].rssi,
            (millis() - routing_table[i].last_seen) / 1000);
    }
}
