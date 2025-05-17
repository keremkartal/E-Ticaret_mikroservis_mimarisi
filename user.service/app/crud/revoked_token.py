from sqlalchemy.orm import Session
from app.models.revoked_token import RevokedToken

def is_revoked(db: Session, jti: str) -> bool:
    return db.query(RevokedToken).filter(RevokedToken.jti == jti).first() is not None

def add_revoked(db: Session, jti: str) -> None:
    if not is_revoked(db, jti):
        db.add(RevokedToken(jti=jti))
        db.commit()
