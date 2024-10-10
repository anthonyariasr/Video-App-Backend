from pydantic import BaseModel
from datetime import datetime
from typing import Optional

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
    description: Optional[str] = None
    videoPath: str
    thumbnailPath: str  # Asegúrate de que este campo no sea opcional
    viewsCount: int

    class Config:
        orm_mode = True