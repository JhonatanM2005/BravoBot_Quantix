import logging
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.insert(0, str(Path(__file__).parent.parent))

from rag.pipeline import ask
from rag.retriever import get_collection
from rag.router import VALID_CATEGORIES

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("bravobot.api")

app = FastAPI(
    title="BravoBot API",
    description="Asistente inteligente para aspirantes de la I.U. Pascual Bravo",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    try:
        get_collection()
        logger.info("ChromaDB cargado correctamente al iniciar.")
    except Exception as exc:
        logger.warning(
            f"No se pudo cargar ChromaDB al iniciar: {exc}. "
            "Ejecuta run_ingestion.py primero."
        )


class ChatRequest(BaseModel):
    query: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    respuesta: str
    fuentes: list[str]
    categoria: str
    categorias: list[str]
    session_id: str | None = None


# Almacenamiento en memoria para el historial de conversaciones
# Formato: { "session_id": [{"role": "user", "text": "..." }, {"role": "model", "text": "..."}] }
sessions: dict[str, list[dict]] = {}
MAX_HISTORY_LENGTH = 10  # Máximo número de mensajes a guardar por sesión


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="La query no puede estar vacía.")
    
    try:
        session_id = request.session_id
        history = []
        
        if session_id:
            if session_id not in sessions:
                sessions[session_id] = []
            history = sessions[session_id]

        # Llamada al pipeline RAG con historial
        result = ask(request.query, history=history)

        # Actualizar historial
        if session_id:
            sessions[session_id].append({"role": "user", "text": request.query})
            sessions[session_id].append({"role": "model", "text": result["respuesta"]})
            # Mantener solo los últimos N mensajes
            if len(sessions[session_id]) > MAX_HISTORY_LENGTH:
                sessions[session_id] = sessions[session_id][-MAX_HISTORY_LENGTH:]

        return ChatResponse(
            respuesta=result["respuesta"],
            fuentes=result["fuentes"],
            categoria=result["categoria"],
            categorias=result.get("categorias", [result["categoria"]]),
            session_id=session_id
        )
    except Exception as exc:
        logger.error(f"Error en /chat: {exc}")
        raise HTTPException(status_code=500, detail="Error interno del servidor.")


@app.get("/categorias")
async def get_categorias():
    return {"categorias": list(VALID_CATEGORIES)}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "BravoBot API"}
