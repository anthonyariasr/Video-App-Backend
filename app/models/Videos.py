from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Video(Base):
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    creationDate = Column(DateTime)
    description = Column(String)
    videoPath = Column(String)
    thumbnailPath = Column(String)
    viewsCount = Column(Integer, default=0)
    isFavorite = Column(Boolean, default=False)

    # Relación con los comentarios
    comments = relationship("Comment", back_populates="video")
