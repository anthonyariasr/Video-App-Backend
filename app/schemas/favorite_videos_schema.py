from pydantic import BaseModel
from datetime import datetime

# Esquema para agregar un video a los favoritos
class FavoriteVideoCreate(BaseModel):
    videoID: int

# Esquema para devolver un video favorito
class FavoriteVideoResponse(BaseModel):
    id: int
    videoID: int
    favoriteDate: datetime

    class Config:
        orm_mode = True
