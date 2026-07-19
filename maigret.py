from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, EmailStr, Field, validator
import re

app = FastAPI()

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=100)
    type: str

    @validator('type')
    def validate_type(cls, v):
        allowed = ['email', 'username', 'discord_id', 'ip', 'phone']
        if v not in allowed:
            raise ValueError('Type invalide')
        return v

@app.post("/api/search")
async def perform_search(data: SearchRequest):
    # Sanitize: Enlever les caractères dangereux
    clean_query = re.sub(r'[^\w\s@.-]', '', data.query)

    try:
        # Ici, vous appellerez Maigret.
        # Exemple : await maigret_search(username=clean_query, ...)
        return {"status": "success", "message": f"Analyse lancée pour {data.type} : {clean_query}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur lors de l'analyse")
