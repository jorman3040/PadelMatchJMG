# PadelMatch 🎾

**PadelMatch** es una app web (PWA) para organizar **retas de pádel**, armar **rondas por canchas**, llevar **marcadores por juego** y mostrar una **tabla de puntos** que se actualiza en tiempo real. Se puede **instalar como app** en iPhone (y Android) desde el navegador.

> **Stack:** Vite + React, PWA (Service Worker), almacenamiento local con `localStorage`. Sin backend.


## ✨ Funcionalidades

- **Generador de retas por rondas y canchas**
  - Introduce la lista de jugadores (un nombre por línea).
  - Define # de canchas, # de rondas y minutos por ronda.
  - Opcional: hora de inicio para calcular horario de cada ronda.
- **Marcador por partido**
  - En cada partido puedes registrar *juegos ganados* por **Pareja 1** y **Pareja 2**.
  - Botones **– / input / +** para ajustar rápidamente.
- **Tabla de puntos (Leaderboard)**
  - Suma a **cada jugador** los **juegos ganados por su pareja**.
  - Se actualiza en tiempo real conforme capturas marcadores.
- **Exportar/Compartir**
  - **Exportar retas** (fixture) con rondas y canchas → (WhatsApp, etc.).
  - **Exportar tabla** de puntos por jugador → (WhatsApp, etc.).
- **PWA lista para instalar**
  - `manifest.webmanifest` + `sw.js` para abrir a pantalla completa y funcionar offline.
- **Persistencia local**
  - Los marcadores se guardan en `localStorage` (clave `pm:scores`).


## 🗂 Estructura de carpetas

```
PadelMatch/
├─ index.html
├─ public/
│  ├─ manifest.webmanifest
│  ├─ sw.js
│  ├─ icons/
│  │  ├─ icon-192.png
│  │  └─ icon-512.png
│  └─ art/
│     ├─ padel-bg.svg
│     ├─ racket.svg
│     └─ ball.svg
└─ src/
   ├─ App.jsx        # Lógica de rondas, marcador y tabla de puntos
   ├─ main.jsx       # Bootstrap de React
   └─ styles.css     # Estilos (tema azul/verde/rojo)
```

> Si tu plantilla es **TypeScript**, usa `App.tsx` + `main.tsx` y asegúrate que en `index.html` el `<script src="/src/main.tsx">` apunte a **.tsx**.


## 🚀 Uso local (opcional)

Si quieres probar localmente (no es obligatorio para Vercel):

1. Instala Node.js LTS.  
2. En la carpeta del proyecto:
   ```bash
   npm install
   npm run dev
   ```
3. Abre el puerto que te indique (por ejemplo `http://localhost:5173`).


## ☁️ Deploy con GitHub + Vercel

1. En GitHub, sube el contenido de la carpeta `PadelMatch/` (acepta **reemplazar archivos** si te lo pide).
2. Vercel detectará cambios automáticamente y hará el **deploy**.
3. Abre tu URL (`https://...vercel.app`).  
   - Si ves algo viejo, añade `?v=1` al final o haz **hard reload** (Ctrl/Cmd+Shift+R).

**Instalar en iPhone:** Abre la URL en **Safari** → **Compartir** → **Agregar a pantalla de inicio**.


## 🧮 Cómo se calculan los puntos

- En cada partido se registran **juegos ganados** por **Pareja 1** y **Pareja 2** (por ejemplo 3–2).
- Los **jugadores de la Pareja 1** suman **3** puntos cada uno.
- Los **jugadores de la Pareja 2** suman **2** puntos cada uno.
- La **tabla** ordena de mayor a menor puntos (y por nombre en caso de empate).
- Los jugadores en **BYE** (descanso) **no suman** en esa ronda.


## 📤 Exportar fixture y tabla

- **Exportar retas**: genera un texto con **Ronda**, **hora** (si la definiste), **cancha** y **parejas**; además lista quiénes descansan.  
- **Exportar tabla**: genera un ranking con **Jugador** y **Puntos**.

Ambas funciones intentan abrir el **share nativo**; si no está disponible, copian el texto al **portapapeles**.


## 🎨 Personalización rápida

- **Colores**: edita las variables CSS en `:root` de `src/styles.css`:
  ```css
  :root{
    --blue:#0ea5e9;
    --green:#22c55e;
    --red:#ef4444;
  }
  ```
- **Íconos**: reemplaza `public/icons/icon-192.png` y `icon-512.png`.  
- **Nombre/tema**: cambia `name`, `short_name` y `theme_color` en `public/manifest.webmanifest`.


## 🧩 Notas técnicas

- **Sin backend**: todo vive en el navegador, ideal para clubes y retas casuales.
- **Persistencia**: `localStorage` (los datos se quedan en el dispositivo del usuario).
- **Service Worker**: `public/sw.js` realiza cache básico para funcionar offline.


## 🛠 Solución de problemas

- **Pantalla blanca**: suele ocurrir si el proyecto corre en TypeScript y `index.html` apunta a `main.jsx` o viceversa.  
  - En **TS** debe apuntar a: `<script type="module" src="/src/main.tsx"></script>`  
  - En **JS** debe apuntar a: `<script type="module" src="/src/main.jsx"></script>`
- **No veo cambios**: (cache)
  - Añade `?v=123` a la URL o haz **hard reload**.
  - En iPhone, borra caché en Ajustes → Safari si fuera necesario.
- **No abre el share nativo**: se copia automáticamente al **portapapeles** y muestra un aviso.


## 🔒 Privacidad

- Los marcadores y lista de jugadores se guardan **solo en tu navegador**.
- No se envían datos a servidores (a menos que modifiques el proyecto para hacerlo).


## 🗺️ Roadmap (ideas)

- Puntos ponderados (ej. **2** por victoria, **1** por derrota).
- Registro por **sets** además de juegos.
- Evitar que un jugador repita pareja en rondas seguidas.
- Exportar **CSV** o **PDF**.
- Tema claro/oscuro configurable.


## 🤝 Contribuir

1. Crea un branch desde `main`.  
2. Haz tus cambios y sube un PR con captura/gif.  
3. Revisa que la PWA no rompa y que el estilo siga la guía del proyecto.


## 📄 Licencia

MIT — Puedes usar, modificar y distribuir este proyecto. Cambia la licencia si lo necesitas para uso privado.
