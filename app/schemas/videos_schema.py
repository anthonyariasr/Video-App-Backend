from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Esquema para la creación de un video
class VideoCreate(BaseModel):
    title: str
    description: str
    videoPath: str
    thumbnailPath: str

class VideoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    videoPath: str
    thumbnailPath: Optional[str] = None
    isFavorite: bool

    class Config:
        orm_mode  = True
