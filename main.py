from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import json
import pandas as pd

app = FastAPI(title="Alerta Verde — Modelo ML", version="2.0")

# Cargar modelo y columnas al iniciar el servidor
modelo = joblib.load("modelo_alerta_verde.pkl")
with open("columnas.json") as f:
    config = json.load(f)
FEATURES = config["features"]

class LecturaInput(BaseModel):
    sensor_id: str                          # "sensor01", "sensor02" o "sensor03"
    temperatura_ambiente_c: float           # renombrado del schema v2
    humedad_pct: float
    # Campos opcionales del schema v2 (no los usa el modelo, pero los acepta)
    irradiancia_wm2: float = 0.0
    temperatura_panel_c: float = 0.0
    voltaje_dc_v: float = 0.0
    corriente_dc_a: float = 0.0
    potencia_kw: float = 0.0
    eficiencia_pct: float = 0.0
    velocidad_viento_ms: float = 0.0

class PrediccionOutput(BaseModel):
    anomalia: bool
    probabilidad: float
    mensaje: str

@app.get("/health")
def health():
    return {"status": "ok", "modelo": "RandomForest v2.0"}

@app.post("/predict", response_model=PrediccionOutput)
def predict(lectura: LecturaInput):
    # Feature engineering idéntico al entrenamiento
    # El modelo usa solo 5 features: temperatura_ambiente_c, humedad_pct, sensores dummies
    datos = {
        "temperatura_ambiente_c": lectura.temperatura_ambiente_c,
        "humedad_pct":            lectura.humedad_pct,
        "sensor_id_sensor01":     1 if lectura.sensor_id == "sensor01" else 0,
        "sensor_id_sensor02":     1 if lectura.sensor_id == "sensor02" else 0,
        "sensor_id_sensor03":     1 if lectura.sensor_id == "sensor03" else 0,
    }

    df = pd.DataFrame([datos])[FEATURES]

    prediccion   = int(modelo.predict(df)[0])
    probabilidad = float(modelo.predict_proba(df)[0][1])

    if prediccion == 1:
        mensaje = (
            f"ANOMALÍA DETECTADA en {lectura.sensor_id}. "
            f"Humedad: {lectura.humedad_pct}%. "
            f"Probabilidad: {probabilidad:.1%}. "
            f"Acción: revisar conexiones y sellado del módulo."
        )
    else:
        mensaje = (
            f"Lectura normal en {lectura.sensor_id}. "
            f"Probabilidad de anomalía: {probabilidad:.1%}."
        )

    return PrediccionOutput(
        anomalia=bool(prediccion),
        probabilidad=round(probabilidad, 4),
        mensaje=mensaje
    )
