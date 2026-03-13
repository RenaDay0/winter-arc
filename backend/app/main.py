from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, data

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Winter Arc API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(data.router)

@app.get("/")
def root():
    return {"status": "Winter Arc API работает"}