from pydantic import BaseModel, validator
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
    creationDate: str  # Aquí mantenemos el campo como string
    videoPath: str
    thumbnailPath: Optional[str] = None
    isFavorite: bool

    @validator('creationDate', pre=True, always=True)
    def convert_creation_date(cls, value):
        # Verificar si 'creationDate' es un datetime y convertirlo a string
        if isinstance(value, datetime):
            return value.strftime('%d-%m-%Y')
        return value

    class Config:
        orm_mode = True
