from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    RESEND_API_KEY: str
    FRONTEND_URL: str

    class Config:
        env_file = ".env"


settings = Settings()
