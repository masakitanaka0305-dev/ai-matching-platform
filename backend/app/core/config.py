"""アプリケーション設定"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "AI Matching Platform"
    debug: bool = True

    # Database
    database_url: str = "postgresql://localhost:5432/ai_matching"

    # Discord（通知はautonomous_botに一本化。バックエンドはWebhook起点の即時通知のみ）
    discord_bot_token: str = ""
    discord_notification_channel_id: str = ""  # Stripe決済完了等の即時通知先
    discord_guild_id: str = ""

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    success_fee_amount: int = 500000  # 50万円（成功報酬デフォルト）
    scout_approach_amount: int = 30000  # 3万円（優先アプローチ権）

    # External
    openai_api_key: str = ""  # スコアリング用（将来的にClaude APIに移行可）

    model_config = {"env_file": ".env"}


settings = Settings()
