from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    videoID = Column(Integer, ForeignKey("videos.id"))
    comment = Column(String)
    creationDate = Column(DateTime)

    # Relación con el video
    video = relationship("Video", back_populates="comments")