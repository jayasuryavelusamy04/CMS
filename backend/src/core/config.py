from typing import Any, Dict, Optional
from pydantic import PostgresDsn, validator, EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Campus Management System"
    API_V1_STR: str = "/api/v1"
    
    # JWT Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database Settings
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    # Initial Admin User Settings
    FIRST_SUPERUSER: str = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "admin"

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        
        # Build the connection URL without extra slashes
        url = PostgresDsn.build(
            scheme="postgresql",
            username=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            path=values.get("POSTGRES_DB")  # Remove the f-string with slash
        )
        
        # Log the connection URL (without password)
        safe_url = str(url).replace(values.get("POSTGRES_PASSWORD", ""), "***")
        logger.info(f"Database URL: {safe_url}")
        
        return url

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
