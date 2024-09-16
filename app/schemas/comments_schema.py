from pydantic import BaseModel
from datetime import datetime

# Esquema para la creación de un comentario
class CommentCreate(BaseModel):
    comment: str

# Esquema para devolver un comentario
class CommentResponse(BaseModel):
    id: int
    videoID: int
    comment: str
    creationDate: datetime

    class Config:
        orm_mode = True
