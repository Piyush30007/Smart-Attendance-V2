"""Authentication service placeholder."""
"""
Logic for Authentication 
Resposibilities :
-Signup
Login
Google Login
-Refresh Token
-Authenticate User

No SQL queries
No HTTP endpoints
"""

from sqlalchemy.orm import Session
from app.models.admin import Admin
from google.oauth2 import id_token
from google.auth.transport import requests
from app.repositories.admin_repository import AdminRepository
from app.schemas.auth import AdminSignup, AdminLogin, TokenPair, RefreshRequest, TokenData
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.config import get_settings
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
        if admin is None:
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
        
    @staticmethod
    def google_login(db:Session , credential : str)->TokenPair:
            """Authenticate An Admin using Google Id Token"""
            settings = get_settings()
            try :
                google_data = id_token.verify_oauth2_token(credential , requests.Request(),settings.GOOGLE_CLIENT_ID)
            except ValueError:
                raise ValueError("Invalid Google Credential")
            email = google_data.get("email")
            email_verified = google_data.get("email_verified" , False)
            if not email:
                raise ValueError("Google Account email not found")
            if not email_verified:
                raise ValueError("Google Email Is not verified")
            #only existing admins are allowd to use google login 
            admin = AdminRepository.get_by_email(db , email)
            if admin is None:
                raise ValueError("This Google Acoounnt is not registered as an admin")
            return AuthService._create_token_pair(admin)
    @staticmethod
    def _create_token_pair(admin: Admin) -> TokenPair:
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