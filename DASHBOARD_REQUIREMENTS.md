# 🌱 Alerta Verde — Dashboard Requirements

## Contexto del proyecto

Sistema de monitoreo de anomalías en paneles solares para Palmira, Valle del Cauca.
Detecta fallos usando un modelo Random Forest que identificó que la **humedad** (no la temperatura)
es el predictor principal de anomalías (+0.28 correlación vs -0.06 temperatura).

El dashboard es la pieza central del pitch en la hackathon. Debe verse profesional,
cargar datos reales de Supabase y tener un **botón simulador** que dispara el flujo
completo en vivo (INSERT → n8n → ML → Telegram) ante el jurado.

---

## Stack técnico

- **Framework:** Next.js 14 con App Router
- **Estilos:** Tailwind CSS
- **Gráficas:** Recharts
- **Base de datos:** @supabase/supabase-js (conexión directa, sin API intermedia)
- **Deploy:** Vercel (el proyecto debe estar listo para `vercel deploy` sin configuración extra)
- **Lenguaje:** TypeScript

---

## Variables de entorno

Crear archivo `.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=https://kepxfkuvtsffwtvfrptp.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_5V5ji6AuhJSnAA2fSvpw_Q_0CR31Dxu
```

Estas variables son públicas (prefijo `NEXT_PUBLIC_`) — se usan en el cliente directamente.

---

## Schema de base de datos (Supabase / PostgreSQL)

```sql
sensores:  id UUID, codigo TEXT, ubicacion_nombre TEXT, latitud NUMERIC, longitud NUMERIC, potencia_nominal_kw NUMERIC
lecturas:  id UUID, sensor_id UUID FK, fecha TIMESTAMPTZ, irradiancia_wm2 NUMERIC, temperatura_panel_c NUMERIC,
           temperatura_ambiente_c NUMERIC, humedad_pct NUMERIC, voltaje_dc_v NUMERIC, corriente_dc_a NUMERIC,
           potencia_kw NUMERIC, eficiencia_pct NUMERIC, anomalia BOOLEAN, tipo_anomalia TEXT,
           probabilidad_anomalia NUMERIC, usuario_registro TEXT, created_at TIMESTAMPTZ
alertas:   id UUID, sensor_id UUID FK, lectura_id UUID FK, tipo TEXT ('reactiva'|'predictiva'),
           severidad TEXT ('baja'|'media'|'alta'|'critica'), mensaje TEXT,
           accion_recomendada TEXT, estado TEXT ('pendiente'|'atendida'|'descartada'), created_at TIMESTAMPTZ
```

### Sensores existentes
| codigo   | ubicacion_nombre | UUID                                  |
|----------|-----------------|---------------------------------------|
| sensor01 | Zona Norte      | 20142fa1-a1f4-4239-9149-563646f67dae  |
| sensor02 | Zona Centro     | 032cd4a6-03c0-4f62-9588-812c89ce13fc  |
| sensor03 | Zona Sur        | 701f8dbf-20d0-455f-9aab-6af9a94e9ac6  |

> sensor02 es el problemático — tasa de anomalías ~42% vs ~20% de los otros.

---

## Paleta de colores

```css
--verde:    #10b981   /* color principal, éxito, normal */
--rojo:     #ef4444   /* alerta, anomalía, crítico */
--amarillo: #f59e0b   /* advertencia, pendiente */
--fondo:    #0f172a   /* background principal */
--card:     #1e293b   /* background de cards */
--borde:    #334155   /* bordes de cards y tablas */
--texto:    #f8fafc   /* texto principal */
--muted:    #94a3b8   /* texto secundario */
```

---

## Estructura de páginas

```
app/
├── page.tsx          ← dashboard principal (única página)
├── layout.tsx        ← fuente, metadata, background
components/
├── Header.tsx
├── KpiCards.tsx
├── HumidityChart.tsx
├── AlertsTable.tsx
├── SimulatorButton.tsx
├── SensorMap.tsx     ← opcional
lib/
├── supabase.ts       ← cliente Supabase singleton
├── queries.ts        ← todas las queries a la BD
types/
└── index.ts          ← tipos TypeScript de las tablas
```

---

## Componentes requeridos

### 1. Header

```
[🌱 ALERTA VERDE]  ·  [● SISTEMA ACTIVO]  ·  [Última actualización: hace 5s]
```

- Logo: emoji 🌱 + texto "Alerta Verde" en bold
- Indicador de estado: punto verde parpadeante si hay lecturas recientes (< 10 min),
  rojo si no hay datos recientes
- Timestamp de última lectura actualizado en tiempo real
- Background: `#0f172a` con borde inferior sutil

---

### 2. KPI Cards (fila de 4 tarjetas)

| Card | Valor | Cómo calcularlo |
|------|-------|-----------------|
| Total lecturas | `1,000` | `COUNT(*) FROM lecturas` |
| Anomalías hoy | `12` | `COUNT(*) WHERE anomalia=true AND fecha >= today` |
| Sensor crítico | `sensor02` | sensor con mayor % anomalías en últimas 24h |
| Tasa de anomalías | `28.5%` | `AVG(anomalia::int) * 100 FROM lecturas` |

- Cards con fondo `#1e293b`, borde `#334155`
- Número grande (3xl), label pequeño abajo
- Ícono a la izquierda de cada card (puede ser emoji o lucide-react)
- "Anomalías hoy" y "Sensor crítico": borde izquierdo rojo si hay anomalías activas

---

### 3. Gráfica principal — Humedad por sensor

**Tipo:** LineChart de Recharts  
**Datos:** últimas 100 lecturas ordenadas por `fecha ASC`  
**Eje X:** `fecha` formateada como `HH:mm DD/MM`  
**Eje Y:** `humedad_pct` (0 a 100)

**Series:**
- sensor01 → línea verde `#10b981`
- sensor02 → línea roja `#ef4444` (el problemático)
- sensor03 → línea azul `#3b82f6`

**Puntos especiales:**
- Cuando `anomalia = true` → punto rojo de mayor tamaño (`r=6`) sobre la línea
- Tooltip personalizado mostrando: sensor, humedad, temperatura, tipo_anomalia, fecha

**Título del panel:** `"Humedad por sensor — últimas 100 lecturas"`  
**Subtítulo:** `"La humedad es el predictor principal de anomalías (+0.28 correlación)"`

---

### 4. Tabla de alertas recientes

**Datos:** últimas 10 alertas de `alertas` ordenadas por `created_at DESC`  
**Join:** incluir `sensores.codigo` para mostrar el nombre del sensor

| Columna | Descripción |
|---------|-------------|
| Fecha | `created_at` formateada, relativa si < 24h ("hace 5 min") |
| Sensor | `sensores.codigo` (sensor01, sensor02, sensor03) |
| Tipo | Badge: `reactiva` (azul) / `predictiva` (púrpura) |
| Severidad | Badge: `baja`(gris) `media`(amarillo) `alta`(naranja) `critica`(rojo) |
| Mensaje | texto truncado a 60 chars con tooltip completo |
| Estado | Badge: `pendiente`(amarillo) `atendida`(verde) `descartada`(gris) |

Si no hay alertas mostrar estado vacío con mensaje "Sin alertas recientes".

---

### 5. Botón simulador ⭐ (pieza central del pitch)

```
[🔴  Simular lectura crítica]
```

- Botón rojo prominente, tamaño grande, centrado o en posición destacada
- **Al hacer click:**
  1. Cambiar a estado `loading` con spinner: "Enviando lectura..."
  2. Hacer INSERT en `lecturas`:
     ```json
     {
       "sensor_id": "032cd4a6-03c0-4f62-9588-812c89ce13fc",
       "temperatura_ambiente_c": 24.6,
       "temperatura_panel_c": 38.2,
       "humedad_pct": 80.0,
       "irradiancia_wm2": 650.0,
       "voltaje_dc_v": 342.5,
       "corriente_dc_a": 7.8,
       "potencia_kw": 2.67,
       "eficiencia_pct": 14.2,
       "velocidad_viento_ms": 2.1,
       "anomalia": false,
       "tipo_anomalia": "normal",
       "probabilidad_anomalia": 0.0,
       "usuario_registro": "simulador_pitch"
     }
     ```
  3. Esperar 1.5s (simula el tiempo de procesamiento)
  4. Cambiar a estado `success`: "✓ Alerta enviada — revisa Telegram"
  5. Volver al estado normal después de 4 segundos
- Nota en el pitch: "El modelo en Render detectará humedad 80% en sensor02 y disparará la alerta"
- **Manejo de error:** si el INSERT falla mostrar "Error — reintenta" en rojo

---

### 6. Mapa de sensores (opcional, si hay tiempo)

Mapa simple con 3 marcadores usando **Leaflet** (`react-leaflet`):

```
sensor01 — Zona Norte  — lat: 3.5394, lng: -76.3036
sensor02 — Zona Centro — lat: 3.5350, lng: -76.3000
sensor03 — Zona Sur    — lat: 3.5300, lng: -76.2960
```

- Marcador verde si el sensor no tiene alertas pendientes
- Marcador rojo si tiene alertas en estado `pendiente`
- Popup al hacer click: nombre, última lectura de humedad, estado

Si Leaflet genera problemas de SSR usar dynamic import:
```tsx
const SensorMap = dynamic(() => import('@/components/SensorMap'), { ssr: false })
```

---

## Comportamiento de datos

### Polling automático
- Refrescar KPIs y tabla de alertas cada **10 segundos**
- Refrescar gráfica cada **30 segundos** (es más pesada)
- Usar `setInterval` con `useEffect` y cleanup correcto
- Mostrar indicador de carga sutil (no bloquear la UI)

### Query de la gráfica
```sql
SELECT l.fecha, l.humedad_pct, l.anomalia, l.tipo_anomalia,
       l.temperatura_ambiente_c, s.codigo as sensor_codigo
FROM lecturas l
JOIN sensores s ON s.id = l.sensor_id
ORDER BY l.fecha DESC
LIMIT 100
```

Invertir el array en el cliente para que el eje X vaya de más antiguo a más reciente.

### Query de KPIs
```sql
-- Total lecturas
SELECT COUNT(*) FROM lecturas

-- Anomalías hoy
SELECT COUNT(*) FROM lecturas
WHERE anomalia = true
AND fecha >= CURRENT_DATE

-- Tasa global
SELECT ROUND(AVG(anomalia::int) * 100, 1) as tasa FROM lecturas

-- Sensor crítico (últimas 24h)
SELECT s.codigo, COUNT(*) as total,
       SUM(CASE WHEN l.anomalia THEN 1 ELSE 0 END) as anomalias
FROM lecturas l JOIN sensores s ON s.id = l.sensor_id
WHERE l.fecha >= NOW() - INTERVAL '24 hours'
GROUP BY s.codigo
ORDER BY anomalias DESC
LIMIT 1
```

---

## Requisitos de despliegue (Vercel)

1. El proyecto debe tener `vercel.json` o funcionar con configuración por defecto
2. Las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   deben documentarse en un `README.md` para configurarlas en Vercel dashboard
3. No usar `output: 'export'` — el dashboard necesita datos dinámicos
4. El build (`npm run build`) debe completarse sin errores de TypeScript

---

## README mínimo (incluir en el proyecto)

```md
# 🌱 Alerta Verde — Dashboard

Dashboard de monitoreo de anomalías en paneles solares.

## Setup local
npm install
cp .env.example .env.local
# Editar .env.local con las credenciales de Supabase
npm run dev

## Variables de entorno (configurar en Vercel)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

## Deploy
git push origin main  # Vercel despliega automáticamente
```

---

## Orden de implementación sugerido para hackathon

1. `lib/supabase.ts` + `lib/queries.ts` — conexión y queries
2. `KpiCards.tsx` — valida que los datos llegan de Supabase
3. `HumidityChart.tsx` — la gráfica es la pieza más visual del pitch
4. `SimulatorButton.tsx` — crítico para la demo en vivo
5. `AlertsTable.tsx`
6. `Header.tsx` con estado del sistema
7. `SensorMap.tsx` — solo si sobra tiempo

---

## Notas para el pitch

- El botón simulador es el **climax de la demo** — el jurado ve la alerta llegar al Telegram en vivo
- Tener el dashboard en **pantalla completa** (F11) durante la presentación
- La frase del gráfico "La humedad es el predictor principal" refuerza el insight del pitch
- Si Vercel falla usar `localhost:3000` como plan B (está en el plan de contingencias)
