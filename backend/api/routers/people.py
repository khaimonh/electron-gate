from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict

from api.deps import bcrypt_context, db_dependency, get_current_user, require_admin
from api.models import Role, User

router = APIRouter(prefix="/people", tags=["people"])


class RoleRead(BaseModel):
    role_id: UUID
    role_name: str

    model_config = ConfigDict(from_attributes=True)


class RoleCreate(BaseModel):
    role_name: str


class UserRead(BaseModel):
    user_id: UUID
    email: str
    role_id: UUID
    role_name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: str
    password: str
    role_id: Optional[UUID] = None
    role_name: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    role_id: Optional[UUID] = None
    role_name: Optional[str] = None





def role_to_read(role: Role) -> RoleRead:
    return RoleRead.model_validate(role)


def user_to_read(user: User) -> UserRead:
    return UserRead(
        user_id=user.user_id,
        email=user.email,
        role_id=user.role_id,
        role_name=user.role.role_name if user.role else "",
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


def resolve_role(db, role_id: Optional[UUID], role_name: Optional[str]) -> Role:
    if role_id is not None:
        role = db.query(Role).filter(Role.role_id == role_id).first()
    elif role_name:
        role = db.query(Role).filter(Role.role_name == role_name).first()
    else:
        role = db.query(Role).filter(Role.role_name == "User").first()

    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role not found")
    return role


@router.get("/roles", response_model=list[RoleRead])
async def list_roles(db: db_dependency, current_user: dict = Depends(get_current_user)):
    _ = current_user
    return [role_to_read(role) for role in db.query(Role).order_by(Role.role_name.asc()).all()]


@router.post("/roles", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
async def create_role(role_request: RoleCreate, db: db_dependency, _: dict = Depends(require_admin)):
    existing = db.query(Role).filter(Role.role_name == role_request.role_name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role already exists")

    role = Role(role_name=role_request.role_name)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role_to_read(role)


@router.put("/roles/{role_id}", response_model=RoleRead)
async def update_role(role_id: UUID, role_request: RoleCreate, db: db_dependency, _: dict = Depends(require_admin)):
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    duplicate = db.query(Role).filter(Role.role_name == role_request.role_name, Role.role_id != role_id).first()
    if duplicate:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role name already exists")

    role.role_name = role_request.role_name
    db.commit()
    db.refresh(role)
    return role_to_read(role)


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(role_id: UUID, db: db_dependency, _: dict = Depends(require_admin)):
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    if db.query(User).filter(User.role_id == role_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role is in use")

    db.delete(role)
    db.commit()


@router.get("/users", response_model=list[UserRead])
async def list_users(db: db_dependency, current_user: dict = Depends(get_current_user)):
    _ = current_user
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [user_to_read(user) for user in users]


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_person(user_request: UserCreate, db: db_dependency, _: dict = Depends(require_admin)):
    existing = db.query(User).filter(User.email == user_request.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    role = resolve_role(db, user_request.role_id, user_request.role_name)
    user = User(
        email=user_request.email,
        password=bcrypt_context.hash(user_request.password),
        role_id=role.role_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user_to_read(user)


@router.put("/users/{user_id}", response_model=UserRead)
async def update_user(user_id: UUID, user_request: UserUpdate, db: db_dependency, _: dict = Depends(require_admin)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_request.email is not None:
        duplicate = db.query(User).filter(User.email == user_request.email, User.user_id != user_id).first()
        if duplicate:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
        user.email = user_request.email

    if user_request.password:
        user.password = bcrypt_context.hash(user_request.password)

    if user_request.role_id is not None or user_request.role_name is not None:
        role = resolve_role(db, user_request.role_id, user_request.role_name)
        user.role_id = role.role_id

    db.commit()
    db.refresh(user)
    return user_to_read(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: UUID, db: db_dependency, current_user: dict = Depends(require_admin)):
    _ = current_user
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()
