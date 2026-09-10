import json
import paho.mqtt.client as mqtt
from schemas import NodeTelemetrySchema

MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
TOPIC_TELEMETRY = "mineguard/surface/telemetry"

class MQTTBridge:
    def __init__(self, callback=None):
        self.client = mqtt.Client(client_id="mineguard_backend_bridge", clean_session=True)
        self.callback = callback
        self.is_connected = False

        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.is_connected = True
            self.client.subscribe(TOPIC_TELEMETRY)
            print(f"[MQTT Bridge] Connected to broker {MQTT_BROKER}. Subscribed to {TOPIC_TELEMETRY}")
        else:
            print(f"[MQTT Bridge] Connection failed with code {rc}")

    def on_message(self, client, userdata, msg):
        try:
            payload = msg.payload.decode("utf-8")
            data = json.loads(payload)
            telemetry = NodeTelemetrySchema(**data)
            if self.callback:
                self.callback(telemetry)
        except Exception as e:
            print(f"[MQTT Bridge] Error parsing message: {e}")

    def start(self):
        try:
            self.client.connect_async(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_start()
        except Exception as e:
            print(f"[MQTT Bridge] Unable to start MQTT loop: {e}")

    def stop(self):
        self.client.loop_stop()
        self.client.disconnect()
