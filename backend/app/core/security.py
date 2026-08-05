"""
Centralized Security Utilities 
Responsibility :
--> Password hashing and verification using bcrypt algorithm.
--> JWT Access token creation 
--> JWT Refresh token creation
--> JWT decoding and validation
"""


from datetime import datetime , timedelta , timezone 
from typing import Any , Dict
from jose import jwt , JWTError

from passlib.context import CryptContext
from app.core.config import Settings
settings = Settings()

#Password hashing context using bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


#hash a plain text password before storing it in the database 

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

#verify a plain text password against a hashed password stored in the database
def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

#jwt token creation 

def create_access_token(data:dict[str , Any])->str:
    payload = data.copy()
    expire = datetime.now(timezone.utc)+timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
                                                  )
    payload.update({"exp":expire , "type":"access" })
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

#create a jwt refresh token with a longer expiration time than the access token
def create_refresh_token(data:dict[str , Any])->str:
    payload = data.copy()
    expire = datetime.now(timezone.utc)+timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload.update({"exp":expire , "type":"refresh" })
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

#jwt token verifaction 
#decode function to decode and validate a JWT token using the secret key and algorithm specified in the settings
def decode_token(token : str)->dict[str , Any]:
    
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])

#helper function 
def get_token_subject(token:str)->str:
    #return the subject(user id) stored inside the JWT
    payload = decode_token(token)
    subject = payload.get("sub")
    if subject is None:
        raise JWTError("Missing token subject")
    return subject 

def get_token_role(token:str)->str:
    #return the role stored inside the JWT
    payload = decode_token(token)
    role = payload.get("role")
    if role is None:
        raise JWTError("Missing user role")
    return role
