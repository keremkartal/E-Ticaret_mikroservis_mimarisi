import os
import sys
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from dotenv import load_dotenv
load_dotenv()
sys.path.append('.')  # Ensure project root is in path
from app.db.session import SessionLocal
from app.models.role import Role
from app.models.user import User

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
ADMIN_USER = os.getenv("BOOTSTRAP_ADMIN_USER", "admin")
ADMIN_EMAIL = os.getenv("BOOTSTRAP_ADMIN_EMAIL", "admin@example.com")
ADMIN_PASS = os.getenv("BOOTSTRAP_ADMIN_PASS", "Admin123!")


def main():
    db: Session = SessionLocal()
    admin_role = db.query(Role).filter(Role.name == ADMIN_USER).first()
    if not admin_role:
        admin_role = Role(name="admin", description="Super administrator")
        db.add(admin_role)
        db.commit()
        print("Created 'admin' role.")

    existing = db.query(User).filter(User.username == ADMIN_USER).first()
    if not existing:
        user = User(
            username=ADMIN_USER,
            email=ADMIN_EMAIL,
            hashed_password=pwd_ctx.hash(ADMIN_PASS),
            is_active=True,
            roles=[admin_role],
        )
        db.add(user)
        db.commit()
        print(f"Admin user '{ADMIN_USER}' created with password '{ADMIN_PASS}'.")
    else:
        print("Admin user already exists, skipping.")

    db.close()


if __name__ == "__main__":
    main()
