from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore VITE_ and other frontend vars
    )

    app_name: str = "Aegis CSG API"
    debug: bool = True
    version: str = "2.0.0"

    # Database (optional for development)
    database_url: str = "postgresql+asyncpg://aegis:aegis_secure_2026@localhost:5432/aegis"

    # Redis (optional for development)
    redis_url: str = "redis://localhost:6379/0"

    # Neo4j (optional for development)
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"

    # Kafka (optional for development)
    kafka_brokers: str = "localhost:9092"

    # Security
    secret_key: str = "aegis-super-secret-key-change-in-production"
    access_token_expire_minutes: int = 30

    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
