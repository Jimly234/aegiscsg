from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Aegis CSG API"
    debug: bool = False
    version: str = "2.0.0"
    
    # Database
    database_url: str = "postgresql+asyncpg://aegis:aegis_secure_2026@localhost:5432/aegis"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Neo4j
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"
    
    # Kafka
    kafka_brokers: str = "localhost:9092"
    
    # Security
    secret_key: str = "aegis-super-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:3001"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
