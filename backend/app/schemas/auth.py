"""
    Pydantic Schemas For Authentication
    These Schemas define the request and response bodies used by 
    authentication-related endpoints .
    
"""

from pydantic import BaseModel, ConfigDict ,EmailStr



#Admin Signup
class AdminSignup(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    password: str

#Admin Login
class AdminLogin(BaseModel):
    username: str
    password: str

#JWT Token Response
class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

#Refresh Token Request
class RefreshRequest(BaseModel):
    refresh_token: str

#JWT Payload
class TokenData(BaseModel):
    sub : str
    username : str
    role : str
    type:str
    
#Admin Response
class AdminOut(BaseModel):
    id : int 
    username : str 
    full_name : str 
    email : EmailStr
    role : str
    is_active : bool
    model_config = ConfigDict(from_attributes=True)
    
