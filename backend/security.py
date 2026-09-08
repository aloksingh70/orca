import os
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

try:
    from .database import get_db
    from .models import User
    from .schemas import TokenData
except ImportError:
    from database import get_db
    from models import User
    from schemas import TokenData

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "orca-marine-ecosystem-sih26176-secure-jwt-token-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours

http_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash password using salted bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[TokenData]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            return None
        user_id = int(user_id_raw)
        email = payload.get("email")
        role = payload.get("role")
        return TokenData(user_id=user_id, email=email, role=role)
    except (jwt.PyJWTError, ValueError):
        return None

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    db: Session = Depends(get_db)
) -> User:
    """Dependency: require an authenticated user via Bearer token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception

    token_data = decode_token(credentials.credentials)
    if token_data is None or token_data.user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Dependency: retrieve user if valid Bearer token is provided, else None."""
    if not credentials:
        return None
    token_data = decode_token(credentials.credentials)
    if not token_data or not token_data.user_id:
        return None
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user and user.is_active:
        return user
    return None

def require_role(allowed_roles: list):
    """Dependency factory: require user to have one of the specified roles."""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles}"
            )
        return current_user
    return role_checker
