from datetime import timedelta, datetime, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from jose import jwt
from dotenv import load_dotenv
import os
from api.models import User, Role
from api.deps import db_dependency, bcrypt_context, user_dependency

load_dotenv()

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = os.getenv("AUTH_SECRET_KEY")
ALGORITHM = os.getenv("AUTH_ALGORITHM")

class UserCreateRequest(BaseModel):
    email: str
    password: str


class UserLoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


class SocialLoginRequest(BaseModel):
    email: str
    name: Optional[str] = None
    provider: Optional[str] = None


class SocialLoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

def authenticate_user(email: str, password: str, db):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.password):
        return False
    return user

def create_access_token(email: str, user_id: str, role_name: str, expires_delta: timedelta):
    encode = {'sub': email, 'id': user_id, 'role': role_name}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: UserCreateRequest, db: db_dependency):
    user_role = db.query(Role).filter(Role.role_name == "User").first()
    if not user_role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User role not found")

    create_user_model = User(
        email=create_user_request.email,
        password=bcrypt_context.hash(create_user_request.password),
        role_id=user_role.role_id
    )
    db.add(create_user_model)
    db.commit()

@router.post('/token', response_model=Token)
async def login_for_access_token(login_request: UserLoginRequest, db: db_dependency):
    user = authenticate_user(login_request.email, login_request.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user")
    token = create_access_token(user.email, str(user.user_id), user.role.role_name, timedelta(hours=10))
    
    return {"access_token": token, "token_type": "bearer"}


@router.post('/social-login', response_model=SocialLoginResponse)
async def social_login(login_request: SocialLoginRequest, db: db_dependency):
    user = db.query(User).filter(User.email == login_request.email).first()

    if not user:
        user_role = db.query(Role).filter(Role.role_name == "User").first()
        if not user_role:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User role not found")

        user = User(
            email=login_request.email,
            password=None,
            role_id=user_role.role_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.email, str(user.user_id), user.role.role_name, timedelta(hours=10))

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.role_name,
    }


@router.get('/me')
async def get_current_user_info(
    db: db_dependency,
    current_user: user_dependency,
):
    user = db.query(User).filter(User.user_id == current_user['id']).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return {
        "user_id": str(user.user_id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.role_name,
    }
