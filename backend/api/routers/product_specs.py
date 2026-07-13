from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict

from api.deps import db_dependency, get_current_user, require_admin_or_staff
from api.models import Product, ProductSpec

router = APIRouter(prefix="/products/{product_id}/specs", tags=["product-specs"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class ProductSpecRead(BaseModel):
    spec_product_id: UUID
    product_id: UUID
    spec_name: str
    spec_value: str
    model_config = ConfigDict(from_attributes=True)


class ProductSpecCreate(BaseModel):
    spec_name: str
    spec_value: str


class ProductSpecUpdate(BaseModel):
    spec_name: Optional[str] = None
    spec_value: Optional[str] = None


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ProductSpecRead])
def list_product_specs(
    product_id: UUID,
    db: db_dependency,
    current_user=Depends(get_current_user),
):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    specs = db.query(ProductSpec).filter(ProductSpec.product_id == product_id).all()
    return [ProductSpecRead.model_validate(s) for s in specs]


@router.post("", response_model=ProductSpecRead, status_code=status.HTTP_201_CREATED)
def create_product_spec(
    product_id: UUID,
    body: ProductSpecCreate,
    db: db_dependency,
    current_user=Depends(require_admin_or_staff),
):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    spec = ProductSpec(product_id=product_id, **body.model_dump())
    db.add(spec)
    db.commit()
    db.refresh(spec)
    return ProductSpecRead.model_validate(spec)


@router.put("/{spec_id}", response_model=ProductSpecRead)
def update_product_spec(
    product_id: UUID,
    spec_id: UUID,
    body: ProductSpecUpdate,
    db: db_dependency,
    current_user=Depends(require_admin_or_staff),
):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    spec = db.query(ProductSpec).filter(
        ProductSpec.product_id == product_id,
        ProductSpec.spec_product_id == spec_id,
    ).first()
    if not spec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Spec not found")

    update_data = body.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(spec, key, value)

    db.commit()
    db.refresh(spec)
    return ProductSpecRead.model_validate(spec)


@router.delete("/{spec_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_spec(
    product_id: UUID,
    spec_id: UUID,
    db: db_dependency,
    current_user=Depends(require_admin_or_staff),
):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    spec = db.query(ProductSpec).filter(
        ProductSpec.product_id == product_id,
        ProductSpec.spec_product_id == spec_id,
    ).first()
    if not spec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Spec not found")

    db.delete(spec)
    db.commit()
