"""Authentication Middleware
Responsibilities:
-Read Bearer token
-Decode JWT
-Validate Token
-Load Current admin 
-Return authnticated admin


"""
from fastapi import Depends , HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.database.database import get_db
from app.models.admin import Admin
from app.core.security import decode_token, get_token_subject
from app.repositories.admin_repository import AdminRepository

#outh2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

#get current admin
def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Admin:
    """Validate JWT and return the authenticated admin"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token) #decode the JWT token and extract the payload
        if payload.get("type") != "access":
            raise credentials_exception
        admin_id = payload.get("sub") #it containts the admin id 
        if admin_id is None:
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception
    admin = AdminRepository.get_by_id(db, int(admin_id))
    if admin is None:
        raise credentials_exception
    if not admin.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin account is inactive")
    return admin     