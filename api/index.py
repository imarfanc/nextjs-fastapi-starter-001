from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import os
import subprocess
import uvicorn
from typing import List, Dict
import time
import logging

logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory storage for folder structure
folder_structure: Dict[str, List[Dict[str, str]]] = {}
last_used_app = "None"
python_interpreter = "/usr/bin/python3"  # Default Python interpreter

class FolderPath(BaseModel):
    folder_path: str

class AppInfo(BaseModel):
    name: str
    path: str
    is_streamlit: bool

class PythonInterpreter(BaseModel):
    path: str

@app.get("/", response_class=HTMLResponse)
async def root():
    with open("static/index.html", "r") as f:
        return f.read()

@app.post("/process_folder")
async def process_folder(folder_data: FolderPath):
    global folder_structure
    folder_path = folder_data.folder_path
    if not os.path.isdir(folder_path):
        raise HTTPException(status_code=400, detail="Invalid folder path")
    folder_structure = process_folder_structure(folder_path)
    return {"message": "Folder processed successfully", "structure": folder_structure}

@app.post("/run_app")
async def run_app(app_info: AppInfo):
    global last_used_app
    main_py_path = os.path.join(app_info.path, 'main.py')
    if os.path.exists(main_py_path):
        try:
            if app_info.is_streamlit:
                logging.debug(f"Launching Streamlit app: {main_py_path}")
                streamlit_process = subprocess.Popen(
                    [python_interpreter, "-m", "streamlit", "run", main_py_path, "--server.headless", "true"],
                    cwd=app_info.path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=True
                )

                streamlit_url = None
                for line in streamlit_process.stdout:
                    if "Network URL" in line:
                        logging.debug(line.strip())
                    if "Local URL" in line:
                        streamlit_url = line.split()[-1]
                        logging.debug(f"Streamlit Local URL: {streamlit_url}")
                        break

                if not streamlit_url:
                    raise Exception("Failed to get Streamlit URL")

                last_used_app = app_info.name
                return {
                    "message": f"Streamlit app '{app_info.name}' started successfully",
                    "streamlit_url": streamlit_url
                }
            else:
                subprocess.Popen([python_interpreter, main_py_path], cwd=app_info.path)
                last_used_app = app_info.name
                return {"message": f"App '{app_info.name}' started successfully"}
        except Exception as e:
            logging.error(f"Error running the app: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error running the app: {str(e)}")
    else:
        raise HTTPException(status_code=404, detail=f"main.py not found in {app_info.path}")

@app.get("/last_used_app")
async def get_last_used_app():
    return {"last_used_app": last_used_app}

@app.post("/set_python_interpreter")
async def set_python_interpreter(interpreter: PythonInterpreter):
    global python_interpreter
    if os.path.exists(interpreter.path):
        python_interpreter = interpreter.path
        return {"message": "Python interpreter path updated successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid Python interpreter path")

def process_folder_structure(folder_path: str) -> dict:
    result = {}
    for item in os.listdir(folder_path):
        item_path = os.path.join(folder_path, item)
        if os.path.isdir(item_path) and '-' in item:
            category, script_name = item.split('-', 1)
            if category not in result:
                result[category] = []
            result[category].append({
                "name": script_name.replace('_', ' '),
                "path": item_path
            })
    return result

@app.get("/api/python")
def hello_world():
    return {"message": "Hello World"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
