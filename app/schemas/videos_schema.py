from pydantic import BaseModel
from datetime import datetime

# Esquema para la creación de un video
class VideoCreate(BaseModel):
    title: str
    description: str
    videoPath: str
    thumbnailPath: str

# Esquema para devolver un video
class VideoResponse(BaseModel):
    id: int
    title: str
    creationDate: datetime
    description: str
    videoPath: str
    thumbnailPath: str
    viewsCount: int
    isFavorite: bool

    class Config:
        orm_mode = True
