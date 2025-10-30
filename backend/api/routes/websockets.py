# FILE: zwiggy/backend/api/routes/websockets.py
# ============================================================================

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

connected_clients = set()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    print("✅ Client connected to WebSocket")

    try:
        while True:
            message = await websocket.receive_text()
            print(f"📩 Received: {message}")

            # ✅ Broadcast to all clients
            for client in list(connected_clients):
                try:
                    await client.send_text(message)
                except:
                    connected_clients.remove(client)

    except WebSocketDisconnect:
        print("❌ Client disconnected")
        connected_clients.remove(websocket)
