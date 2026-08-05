"""Authentication service placeholder."""
"""
Logic for Authentication 
Resposibilities :
-Signup
Login
-Refresh Token
-Authenticate User

No SQL queries
No HTTP endpoints
"""

from sqlalchemy.orm import Session
from app.models.admin import Admin
from app.repositories.admin_repository import AdminRepository
from app.schemas.auth import AdminSignup, AdminLogin, TokenPair, RefreshRequest, TokenData
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token

class AuthService:
    @staticmethod 
    def signup(
        db: Session, payload: AdminSignup
    )-> Admin:
        """Create a new adming account in database"""
        if AdminRepository.get_by_username(db, payload.username):
            raise ValueError("Username already exists")
        
        if AdminRepository.get_by_email(db, payload.email):
            raise ValueError("Email already exists")
        
        admin = Admin(
            username = payload.username,
            full_name = payload.full_name,
            email = payload.email,
            hashed_password = hash_password(payload.password),
        )
        return AdminRepository.create(db, admin)
    
    @staticmethod
    def authenticate_user(db:Session , username: str, password: str)->Admin | None:
        """Authenticate user by verifying username and password"""
        admin = AdminRepository.get_by_username(db, username)
        if Admin is None:
            return None 
        if not verify_password(password, admin.hashed_password):
            return None
        
        return admin
    
    @staticmethod
    def login(db:Session , username : str , password : str)->TokenPair:
        """Login and admin and return JWT tokens"""
        admin = AuthService.authenticate_user(db, username=username, password=password)
        if admin is None:
            raise ValueError("Invalid username or password")
        token_payload = {
            "sub": str(admin.id),
            "username": admin.username,
            "role": admin.role,
        }
        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token(token_payload)
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
        )
        
        #on above we use vaue error instead of httpexception because this is a service layer and not a controller layer.
        #it should nt know anything about fastapi or http exceptions. it should only know about business logic and raise python exceptions. the controller layer will catch these exceptions and convert them into http responses.
        
