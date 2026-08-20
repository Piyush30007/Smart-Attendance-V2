"""Authentication API Endpoints
Responsibilities:
-Receive HTTP requests related to authentication
-Validate request body
-Call AuthService for business logic
-convert business errors to HTTP responses



"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.services.auth_service import AuthService
from app.database.database import get_db
from app.schemas.auth import AdminSignup, AdminLogin, TokenPair, RefreshRequest,AdminOut,GoogleLoginRequest
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Authentication"])



@router.post("/signup", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
def signup(payload: AdminSignup, db: Session = Depends(get_db)):
    try:
        return AuthService.signup(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=TokenPair)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        return AuthService.login(db, form_data.username , form_data.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.post("/google",response_model=TokenPair)
def google_login(payload : GoogleLoginRequest,db:Session = Depends(get_db) ):
    try :
        return AuthService.google_login(db , payload.credential)
    except ValueError as e :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail=str(e))
    
