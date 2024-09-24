from fastapi import FastAPI
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import engine, get_db

# Crear todas las tablas
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def is_running():
    return{
        "status":"running"
        }

