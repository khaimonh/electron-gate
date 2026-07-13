from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import (
    auth,
    categories,
    people,
    product_specs,
    product_variants,
    products,
    variant_specs,
    ingestion
)
from api.database import Base, engine, SessionLocal
from api.models import Role

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(people.router)
app.include_router(ingestion.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(product_variants.router)
app.include_router(product_specs.router)
app.include_router(variant_specs.router)
app.include_router(ingestion.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(product_variants.router)
app.include_router(product_specs.router)
app.include_router(variant_specs.router)


def seed_default_roles() -> None:
    db = SessionLocal()
    try:
        for role_name in ("User", "Admin", "Staff"):
            existing_role = db.query(Role).filter(Role.role_name == role_name).first()
            if not existing_role:
                db.add(Role(role_name=role_name))
        db.commit()
    finally:
        db.close()


seed_default_roles()

@app.get("/")
def health_check():
    return "Health check complete"