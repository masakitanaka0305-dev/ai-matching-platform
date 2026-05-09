from __future__ import annotations
"""
AI人材マッチングプラットフォーム - FastAPI エントリポイント
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import engineers, companies, matches, matching, payments, postings, diagnosis, reports, scouts
from .core.config import settings
from .models.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時にテーブル自動作成
    Base.metadata.create_all(bind=engine)
    # NOTE: 定期タスクは autonomous_bot.py (Discord Bot) に一本化済み。
    # backend側のscheduler.pyは使用しない（2重実行防止）。
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    redirect_slashes=False,
)

# CORS（Next.jsフロントエンド用）
import os
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(engineers.router, prefix="/api/v1")
app.include_router(companies.router, prefix="/api/v1")
app.include_router(matches.router, prefix="/api/v1")
app.include_router(matching.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(postings.router, prefix="/api/v1")
app.include_router(diagnosis.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(scouts.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.app_name}
