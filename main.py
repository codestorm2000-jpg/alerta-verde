from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import json
import pandas as pd

app = FastAPI(title="Alerta Verde — Modelo ML", version="1.0")

# Cargar modelo y columnas al iniciar el servidor
modelo = joblib.load("modelo_alerta_verde.pkl")
with open("columnas.json") as f:
    config = json.load(f)
FEATURES = config["features"]

# ✅ Nombres del schema nuevo (9 variables)
class LecturaInput(BaseModel):
    sensor_id: str
    fecha: str
    irradiancia_wm2: float
    temperatura_panel_c: float
    temperatura_ambiente_c: float
    humedad_pct: float
    voltaje_dc_v: float
    corriente_dc_a: float
    potencia_kw: float
    eficiencia_pct: float
    velocidad_viento_ms: float
    
class PrediccionOutput(BaseModel):
    anomalia: bool
    probabilidad: float
    mensaje: str

@app.get("/health")
def health():
    return {"status": "ok", "modelo": "RandomForest v1.0"}

@app.post("/predict", response_model=PrediccionOutput)
def predict(lectura: LecturaInput):
    # Feature engineering idéntico al entrenamiento
    datos = {
        "temperatura_c": lectura.temperatura_ambiente_c,
        "humedad_pct": lectura.humedad_pct,
        "sensor_id_sensor01": 1 if lectura.sensor_id == "sensor01" else 0,
        "sensor_id_sensor02": 1 if lectura.sensor_id == "sensor02" else 0,
        "sensor_id_sensor03": 1 if lectura.sensor_id == "sensor03" else 0,
    }

    df = pd.DataFrame([datos])[FEATURES]

    prediccion = int(modelo.predict(df)[0])
    probabilidad = float(modelo.predict_proba(df)[0][1])

    if prediccion == 1:
        mensaje = (f"ANOMALÍA DETECTADA en {lectura.sensor_id}. "
                   f"Humedad: {lectura.humedad_pct}%. "
                   f"Probabilidad: {probabilidad:.1%}. "
                   f"Acción: revisar conexiones y sellado del módulo.")
    else:
        mensaje = (f"Lectura normal en {lectura.sensor_id}. "
                   f"Probabilidad de anomalía: {probabilidad:.1%}.")

    return PrediccionOutput(
        anomalia=bool(prediccion),
        probabilidad=round(probabilidad, 4),
        mensaje=mensaje
    )