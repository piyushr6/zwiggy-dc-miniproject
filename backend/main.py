# FILE: zwiggy/backend/main.py
# ============================================================================

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from zwiggy.backend.core.node import DistributedNode
from zwiggy.backend import config

# import routers (ensure these files exist exactly as shown)
from zwiggy.backend.api.routes import distributed
from zwiggy.backend.api.routes.restaurants import router as restaurants_router
from zwiggy.backend.api.routes.orders import router as orders_router
from zwiggy.backend.api.routes.websockets import router as websocket_router

app = FastAPI(title="Distributed Food Delivery Node")

# Allow frontend to call API (adjust origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    print("\n============================================================")
    print("   INITIALIZING NODES")
    print("============================================================")

    # register this node
    current = DistributedNode(
        node_id=config.Config.NODE_ID,
        priority=config.Config.NODE_PRIORITY
    )
    config.Config.REGISTERED_NODES.append(current)
    print(f"✅ Registered self: Node {current.node_id}")

    # create lightweight in-memory representations of other nodes
    for nid in config.Config.ALL_NODE_IDS:
        if nid != config.Config.NODE_ID:
            temp_node = DistributedNode(node_id=nid, priority=nid)
            config.Config.REGISTERED_NODES.append(temp_node)
            print(f"✅ Registered Node {nid}")

    print("✅ All nodes created.")
    print("============================================================")


# include REST routers (they already define their own prefixes)
app.include_router(distributed.router)
app.include_router(restaurants_router)
app.include_router(orders_router)

# include WebSocket router (mounted with no prefix; it defines /ws)
app.include_router(websocket_router)


if __name__ == "__main__":
    # Run using the venv's python: `python -m uvicorn zwiggy.backend.main:app --reload`
    uvicorn.run("zwiggy.backend.main:app", host="localhost", port=config.Config.NODE_PORT, reload=True)


#take these 5 files. i am trying to running this page for distributed computing. unable to run the page. can u make changes