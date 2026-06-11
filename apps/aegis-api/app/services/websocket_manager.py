from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {
            "alerts": [],
            "command": [],
            "guardians": [],
            "public": [],
        }

    async def connect(self, websocket: WebSocket, group: str):
        await websocket.accept()
        if group not in self.active_connections:
            self.active_connections[group] = []
        self.active_connections[group].append(websocket)

    def disconnect(self, websocket: WebSocket, group: str):
        if group in self.active_connections:
            self.active_connections[group].remove(websocket)

    async def broadcast_to_group(self, group: str, message: dict):
        if group not in self.active_connections:
            return
        disconnected = []
        for connection in self.active_connections[group]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.active_connections[group].remove(conn)

    async def send_to_group(self, group: str, client_id: str, message: dict):
        if group not in self.active_connections:
            return
        for connection in self.active_connections[group]:
            try:
                await connection.send_json({
                    **message,
                    "target": client_id,
                })
            except Exception:
                pass
