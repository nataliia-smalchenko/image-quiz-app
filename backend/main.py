from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.images import router as images_router
from app.api.tests import router as tests_router

app = FastAPI(title="Image Quiz API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # додамо продакшен URL пізніше
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(images_router)
app.include_router(tests_router)


@app.get("/health")
def health():
    return {"status": "ok"}
