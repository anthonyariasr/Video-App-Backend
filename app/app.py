from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def is_running():
    return{
        "status":"running"
        }

