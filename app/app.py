import os
from datetime import datetime
# FastAPI
from fastapi import FastAPI, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
# SQLAlchemy
from sqlalchemy.orm import Session
from app.database import engine, get_db
from app.database import Base
# Models and Schemas
from app.models import Video, Comment, FavoriteVideo
from app.schemas import VideoCreate, VideoResponse, CommentResponse, CommentCreate

from typing import Optional, List

# Crear todas las tablas
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # Permite solicitudes del puerto 5500
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PATCH, DELETE, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

@app.get("/")
def is_running():
    return {
        "status": "running"
    }

""" GET Methods """

# Retornar los 10 videos más vistos
@app.get("/videos/top", response_model=List[VideoResponse])
def get_top_videos(db: Session = Depends(get_db)):
    top_videos = db.query(Video).order_by(Video.viewsCount.desc()).limit(10).all()
    return top_videos

# Retornar 10 videos favoritos más recientes
@app.get("/videos/favorites", response_model=List[VideoResponse])
def get_recent_favorite_videos(db: Session = Depends(get_db)):
    favorite_videos = db.query(Video).join(FavoriteVideo).order_by(FavoriteVideo.favoriteDate.desc()).limit(10).all()
    return favorite_videos

# Buscar videos en la base de datos
@app.get("/videos/search", response_model=List[VideoResponse])
def search_videos(query: str, db: Session = Depends(get_db)):
    videos = db.query(Video).filter(Video.title.contains(query)).all()
    return videos

# Cargar un video y sus datos
@app.get("/videos/{video_id}", response_model=VideoResponse)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    return video

# Cargar la lista de comentarios de un video
@app.get("/videos/{video_id}/comments", response_model=List[CommentResponse])
def get_video_comments(video_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.videoID == video_id).all()
    return comments

""" POST Methods """

@app.post("/videos", response_model=VideoResponse)
async def add_video(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    thumbnail: Optional[UploadFile] = File(None),  # Thumbnail opcional
    db: Session = Depends(get_db)
):
    VIDEO_DIR = "app/videos"
    THUMBNAIL_DIR = "app/assets/thumbnails"
    os.makedirs(VIDEO_DIR, exist_ok=True)
    os.makedirs(THUMBNAIL_DIR, exist_ok=True)

    # Crear un timestamp para evitar duplicados
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    file_extension = file.filename.split(".")[-1]  # Obtener la extensión del archivo
    file_name = f"{file.filename.split('.')[0]}_{timestamp}.{file_extension}"

    # Guardar el archivo de video con el nuevo nombre
    file_location = os.path.join(VIDEO_DIR, file_name)
    content = await file.read()
    with open(file_location, "wb") as f:
        f.write(content)

    # Manejo del thumbnail (miniatura)
    default_thumbnail_path = "default_thumbnail.png"  # Solo el nombre del archivo por defecto
    thumbnail_path = default_thumbnail_path

    if thumbnail:
        thumbnail_extension = thumbnail.filename.split(".")[-1]  # Obtener la extensión del thumbnail
        thumbnail_name = f"{thumbnail.filename.split('.')[0]}_{timestamp}.{thumbnail_extension}"
        thumbnail_location = os.path.join(THUMBNAIL_DIR, thumbnail_name)
        thumbnail_content = await thumbnail.read()
        with open(thumbnail_location, "wb") as f:
            f.write(thumbnail_content)
        thumbnail_path = thumbnail_name  # Solo guardar el nombre del archivo

    # Crear el nuevo objeto Video y guardarlo en la base de datos
    new_video = Video(
        title=title,
        description=description,
        videoPath=file_name,  # Solo guardar el nombre del archivo de video
        thumbnailPath=thumbnail_path,  # Solo guardar el nombre del archivo de thumbnail
        creationDate=datetime.utcnow()
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    return new_video

# Agregar un comentario a un video
@app.post("/videos/{video_id}/comments", response_model=CommentResponse)
def add_comment(video_id: int, comment_data: CommentCreate, db: Session = Depends(get_db)):
    new_comment = Comment(
        videoID=video_id,
        comment=comment_data.comment,
        creationDate=datetime.utcnow()
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

""" PATCH Methods """

# Incrementar la cantidad de reproducciones de un video
@app.patch("/videos/{video_id}/views")
def increment_views(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if video:
        video.viewsCount += 1
        db.commit()
        db.refresh(video)
    return {"status": "views incremented"}

# Agregar un video a los favoritos
@app.patch("/videos/{video_id}/favorite")
def add_to_favorites(video_id: int, db: Session = Depends(get_db)):
    favorite_video = FavoriteVideo(
        videoID=video_id,
        favoriteDate=datetime.utcnow()
    )
    db.add(favorite_video)
    video = db.query(Video).filter(Video.id == video_id).first()
    if video:
        video.isFavorite = True
        db.commit()
        db.refresh(video)
    return {"status": "video added to favorites"}

""" DELETE Methods """

# Quitar un video de los favoritos
@app.delete("/videos/{video_id}/favorite")
def remove_from_favorites(video_id: int, db: Session = Depends(get_db)):
    favorite_video = db.query(FavoriteVideo).filter(FavoriteVideo.videoID == video_id).first()
    if favorite_video:
        db.delete(favorite_video)
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            video.isFavorite = False
        db.commit()
    return {"status": "video removed from favorites"}
