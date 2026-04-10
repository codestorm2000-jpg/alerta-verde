"""
Reentrenamiento del modelo Alerta Verde v3.
Anomalias balanceadas para sensor01, sensor02 y sensor03.
Criterio: humedad > 85% Y temperatura > 38C
"""
import warnings; warnings.filterwarnings('ignore')
import numpy as np, pandas as pd, joblib, json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

np.random.seed(42)

def gen_sensor(sensor_id, n_normal, n_anomalia):
    rows = []
    for _ in range(n_normal):
        rows.append({
            'sensor_id': sensor_id,
            'temperatura_ambiente_c': np.random.uniform(15, 38),
            'humedad_pct': np.random.uniform(30, 75),
            'anomalia': 0
        })
    for _ in range(n_anomalia):
        rows.append({
            'sensor_id': sensor_id,
            'temperatura_ambiente_c': np.random.uniform(38, 52),
            'humedad_pct': np.random.uniform(85, 99),
            'anomalia': 1
        })
    return rows

data = []
data += gen_sensor('sensor01', 600, 200)
data += gen_sensor('sensor02', 600, 200)
data += gen_sensor('sensor03', 600, 200)

df = pd.DataFrame(data)
df = pd.get_dummies(df, columns=['sensor_id'])
for col in ['sensor_id_sensor01', 'sensor_id_sensor02', 'sensor_id_sensor03']:
    if col not in df.columns:
        df[col] = 0

FEATURES = [
    'temperatura_ambiente_c', 'humedad_pct',
    'sensor_id_sensor01', 'sensor_id_sensor02', 'sensor_id_sensor03'
]
X = df[FEATURES]
y = df['anomalia']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

clf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
clf.fit(X_train, y_train)

print("=== Reporte de clasificacion ===")
print(classification_report(y_test, clf.predict(X_test)))

print("=== Prueba por sensor (temp=44, hum=93%) ===")
for sensor in ['sensor01', 'sensor02', 'sensor03']:
    test = pd.DataFrame([{
        'temperatura_ambiente_c': 44.0,
        'humedad_pct': 93.0,
        'sensor_id_sensor01': 1 if sensor == 'sensor01' else 0,
        'sensor_id_sensor02': 1 if sensor == 'sensor02' else 0,
        'sensor_id_sensor03': 1 if sensor == 'sensor03' else 0,
    }])[FEATURES]
    prob = clf.predict_proba(test)[0][1]
    pred = bool(clf.predict(test)[0])
    print(f"  {sensor}: anomalia={pred}, prob={prob*100:.1f}%")

print("\n=== Prueba por sensor (temp=25, hum=50%) — debe ser normal ===")
for sensor in ['sensor01', 'sensor02', 'sensor03']:
    test = pd.DataFrame([{
        'temperatura_ambiente_c': 25.0,
        'humedad_pct': 50.0,
        'sensor_id_sensor01': 1 if sensor == 'sensor01' else 0,
        'sensor_id_sensor02': 1 if sensor == 'sensor02' else 0,
        'sensor_id_sensor03': 1 if sensor == 'sensor03' else 0,
    }])[FEATURES]
    prob = clf.predict_proba(test)[0][1]
    pred = bool(clf.predict(test)[0])
    print(f"  {sensor}: anomalia={pred}, prob={prob*100:.1f}%")

# Guardar modelo y config
joblib.dump(clf, 'modelo_alerta_verde.pkl')
with open('columnas.json', 'w') as f:
    json.dump({
        "features": FEATURES,
        "version": "3.0",
        "modelo": "RandomForestClassifier",
        "target": "anomalia",
        "notas": "v3: anomalias balanceadas para sensor01/02/03. Criterio: humedad>85% AND temp>38C"
    }, f, indent=2)

print("\nModelo guardado: modelo_alerta_verde.pkl")
print("Config guardada: columnas.json")
