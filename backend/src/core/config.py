from typing import Any, Dict, Optional
from pydantic import PostgresDsn, validator, EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get potential .env file paths
CWD = os.getcwd()
POTENTIAL_PATHS = [
    os.path.join(CWD, 'backend', '.env'),
    os.path.join(CWD, '.env'),
    os.path.abspath(os.path.join(CWD, '..', '.env')),
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'backend', '.env')
]

# Debug logging
logger.info(f"Current working directory: {CWD}")
logger.info("Checking potential .env file locations:")
for path in POTENTIAL_PATHS:
    logger.info(f"- {path} (exists: {os.path.exists(path)})")

# Find first existing .env file
ENV_FILE = next((path for path in POTENTIAL_PATHS if os.path.exists(path)), POTENTIAL_PATHS[0])
logger.info(f"Selected .env file path: {ENV_FILE}")

# Try to read selected .env file contents
try:
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, 'r') as f:
            env_content = f.read()
            logger.info(f"Found .env file at {ENV_FILE}")
            logger.info(f"File contents: {env_content}")
    else:
        logger.error(f"Could not find .env file at {ENV_FILE}")
except Exception as e:
    logger.error(f"Error reading .env file: {str(e)}")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Campus Management System"
    API_V1_STR: str = "/api/v1"
    
    # JWT Settings
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "cms_db"
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = PostgresDsn.build(
        scheme="postgresql",
        username="postgres",
        password="postgres",
        host="localhost",
        path="/cms_db"
    )

    # Initial Admin User Settings
    FIRST_SUPERUSER: str = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "admin"

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        
        # Ensure we have all required values
        postgres_server = values.get("POSTGRES_SERVER")
        postgres_user = values.get("POSTGRES_USER")
        postgres_password = values.get("POSTGRES_PASSWORD")
        postgres_db = values.get("POSTGRES_DB")

        if not all([postgres_server, postgres_user, postgres_password, postgres_db]):
            return None

        # Build the connection URL with proper formatting
        url = PostgresDsn.build(
            scheme="postgresql",
            host=postgres_server,
            username=postgres_user,
            password=postgres_password,
            path=f"/{postgres_db}"  # Include leading slash for path
        )
        
        # Log the connection URL (without password)
        safe_url = str(url).replace(values.get("POSTGRES_PASSWORD", ""), "***")
        logger.info(f"Database URL: {safe_url}")
        
        return url

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        env_nested_delimiter='__'
    )

settings = Settings()
