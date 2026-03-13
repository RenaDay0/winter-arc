from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/data", tags=["data"])

@router.get("/")
def get_data(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(models.UserData).filter(models.UserData.user_id == user.id).first()
    if not record:
        return {"payload": "{}"}
    return {"payload": record.payload}

@router.post("/")
def save_data(body: schemas.DataPayload, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(models.UserData).filter(models.UserData.user_id == user.id).first()
    if record:
        record.payload = body.payload
    else:
        record = models.UserData(user_id=user.id, payload=body.payload)
        db.add(record)
    db.commit()
    return {"ok": True}
