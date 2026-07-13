from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict

from api.deps import db_dependency, get_current_user, require_admin_or_staff
from api.models import Product, ProductVariant, VariantSpec

router = APIRouter(
    prefix="/products/{product_id}/variants/{variant_id}/specs",
    tags=["variant-specs"],
)


# ── Schemas ──────────────────────────────────────────────────────────────────

class VariantSpecRead(BaseModel):
    spec_variant_id: UUID
    variant_id: UUID
    spec_name: str
    spec_value: str
    model_config = ConfigDict(from_attributes=True)


class VariantSpecCreate(BaseModel):
    spec_name: str
    spec_value: str


class VariantSpecUpdate(BaseModel):
    spec_name: Optional[str] = None
    spec_value: Optional[str] = None


# ── Helpers ──────────────────────────────────────────────────────────────────

def _get_variant(db, product_id: UUID, variant_id: UUID) -> ProductVariant:
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    variant = db.query(ProductVariant).filter(
        ProductVariant.variant_id == variant_id,
        ProductVariant.product_id == product_id,
    ).first()
    if not variant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    return variant


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", response_model=list[VariantSpecRead])
def list_variant_specs(
    product_id: UUID,
    variant_id: UUID,
    db: db_dependency,
    current_user=Depends(get_current_user),
):
    _get_variant(db, product_id, variant_id)

    specs = db.query(VariantSpec).filter(VariantSpec.variant_id == variant_id).all()
    return [VariantSpecRead.model_validate(s) for s in specs]


@router.post("", response_model=VariantSpecRead, status_code=status.HTTP_201_CREATED)
def create_variant_spec(
    product_id: UUID,
    variant_id: UUID,
    body: VariantSpecCreate,
    db: db_dependency,
    current_user=Depends(require_admin_or_staff),
):
    _get_variant(db, product_id, variant_id)

    spec = VariantSpec(variant_id=variant_id, **body.model_dump())
    db.add(spec)
    db.commit()
    db.refresh(spec)
    return VariantSpecRead.model_validate(spec)


@router.put("/{spec_id}", response_model=VariantSpecRead)
def update_variant_spec(
    product_id: UUID,
    variant_id: UUID,
    spec_id: UUID,
    body: VariantSpecUpdate,
    db: db_dependency,
    current_user=Depends(require_admin_or_staff),
):
    _get_variant(db, product_id, variant_id)

    spec = db.query(VariantSpec).filter(
        VariantSpec.spec_variant_id == spec_id,
        VariantSpec.variant_id == variant_id,
    ).first()
    if not spec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant spec not found")

    update_data = body.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(spec, key, value)

    db.commit()
    db.refresh(spec)
    return VariantSpecRead.model_validate(spec)


@router.delete("/{spec_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variant_spec(
    product_id: UUID,
    variant_id: UUID,
    spec_id: UUID,
    db: db_dependency,
    current_user=Depends(require_admin_or_staff),
):
    _get_variant(db, product_id, variant_id)

    spec = db.query(VariantSpec).filter(
        VariantSpec.spec_variant_id == spec_id,
        VariantSpec.variant_id == variant_id,
    ).first()
    if not spec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant spec not found")

    db.delete(spec)
    db.commit()
