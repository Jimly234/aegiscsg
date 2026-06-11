"""
AegisNet Mesh Hub - MQTT Bridge
Relays LoRaWAN mesh messages to the Aegis API via MQTT.
"""

import json
import asyncio
from datetime import datetime
from typing import Optional

import paho.mqtt.client as mqtt
import httpx


class AegisMeshHub:
    """
    Bridge between LoRaWAN mesh network and Aegis API.
    Subscribes to mesh topics and forwards alerts to the API.
    """
    
    def __init__(
        self,
        mqtt_broker: str = "localhost",
        mqtt_port: int = 1883,
        api_url: str = "http://localhost:8000",
        mesh_topic: str = "aegis/mesh/alerts",
    ):
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.api_url = api_url
        self.mesh_topic = mesh_topic
        
        self.client = mqtt.Client(protocol=mqtt.MQTTv5)
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        
        self._connected = False
        self._http_client = httpx.AsyncClient(timeout=10.0)
    
    def _on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0:
            self._connected = True
            print(f"[Hub] Connected to MQTT broker at {self.mqtt_broker}:{self.mqtt_port}")
            client.subscribe(self.mesh_topic)
            print(f"[Hub] Subscribed to topic: {self.mesh_topic}")
        else:
            print(f"[Hub] Connection failed with code {rc}")
    
    def _on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
            print(f"[Hub] Received message: {payload}")
            asyncio.create_task(self._process_alert(payload))
        except Exception as e:
            print(f"[Hub] Error processing message: {e}")
    
    async def _process_alert(self, payload: dict):
        """Forward mesh alert to Aegis API."""
        try:
            alert_data = {
                "victim_name": payload.get("victim_name", "Unknown"),
                "location": payload.get("location", {"lat": 0.0, "lng": 0.0}),
                "priority": payload.get("priority", "critical"),
                "device_id": payload.get("device_id", "mesh-unknown"),
                "user_id": payload.get("user_id", "anonymous"),
                "signal_strength": payload.get("signal_strength", "LoRa Mesh"),
            }
            
            response = await self._http_client.post(
                f"{self.api_url}/api/v1/alerts/",
                json=alert_data,
            )
            
            if response.status_code == 200:
                print(f"[Hub] Alert forwarded successfully: {response.json()['id']}")
            else:
                print(f"[Hub] API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"[Hub] Failed to forward alert: {e}")
    
    def start(self):
        """Start the MQTT bridge."""
        print(f"[Hub] Connecting to MQTT broker...")
        self.client.connect(self.mqtt_broker, self.mqtt_port, 60)
        self.client.loop_start()
    
    def stop(self):
        """Stop the MQTT bridge."""
        self.client.loop_stop()
        self.client.disconnect()
        asyncio.run(self._http_client.aclose())
        print("[Hub] Disconnected")


if __name__ == "__main__":
    hub = AegisMeshHub()
    hub.start()
    
    try:
        while True:
            pass
    except KeyboardInterrupt:
        hub.stop()
