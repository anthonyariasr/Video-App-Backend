from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class FavoriteVideo(Base):
    __tablename__ = "favorite_videos"
    
    id = Column(Integer, primary_key=True, index=True)
    videoID = Column(Integer, ForeignKey("videos.id"))
    favoriteDate = Column(DateTime)

    # Relación con el video
    video = relationship("Video")