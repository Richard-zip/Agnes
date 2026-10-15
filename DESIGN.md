---
name: Agnes — Obsidian Studio & Electric Violet
description: Sistema de diseño para estación de trabajo académica inspirado en interfaces de estudio profesionales (MUSO Dashboard)
colors:
  bg-app: "#0d0f16"
  bg-surface: "#13151f"
  bg-surface-elevated: "#1a1d29"
  bg-surface-paper: "#11131b"
  text-primary: "#ffffff"
  text-secondary: "#94a3b8"
  text-muted: "#64748b"
  primary: "#8b5cf6"
  primary-hover: "#7c3aed"
  violet-glow: "rgba(139, 92, 246, 0.35)"
  gold: "#c084fc"
  terracotta: "#a855f7"
  cyan: "#06b6d4"
  cobalt: "#6366f1"
  emerald: "#10b981"
  emerald-dark: "#059669"
  emerald-deep: "#047857"
  emerald-light: "#34d399"
  rose: "#f43f5e"
  rose-dark: "#e11d48"
  rose-light: "#fca5a5"
  border-subtle: "rgba(255, 255, 255, 0.07)"
  border-medium: "rgba(255, 255, 255, 0.12)"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

## Overview

Agnes es una estación de trabajo de alta fidelidad para la investigación, redacción y certificación del aprendizaje en protocolos académicos. El lenguaje visual **Obsidian Studio & Electric Violet** está inspirado en consolas y dashboards de creación profesional (referencia MUSO Dashboard):
- **Obsidiana y Carbón de Medianoche:** Fondos ultra oscuros con subtonos slate/índigo que ofrecen máxima profundidad, ergonomía visual y contraste para sesiones prolongadas.
- **Violeta Eléctrico y Orquídea Neón:** Gradientes e iluminaciones violeta vibrante (`#7c3aed` a `#a855f7`) para botones de acción principal, insignias de estado activo y halos luminosos.
- **Micro-etiquetado y Chips Studio:** Insignias de píldora compactas (`rounded-full`), tipografía técnica con tracking amplio en mayúsculas, y paneles con bordes sutiles de 1px.
- **Hojas Oficiales de Papel Flotante:** Alto contraste entre el lienzo carbón de estudio y la hoja física blanca con sombras difusas realistas.

## Colors

| Rol | Token | Hex / Valor | Uso |
|---|---|---|---|
| **Canvas** | `--bg-app` | `#0d0f16` | Fondo base de la aplicación estilo estudio |
| **Superficie** | `--bg-surface` | `#13151f` | Paneles principales de trabajo y barras de navegación |
| **Elevada** | `--bg-surface-elevated`| `#1a1d29` | Modales, tarjetas activas, popups y campos de entrada |
| **Texto Primario** | `--text-primary` | `#ffffff` | Texto principal blanco puro de alta legibilidad |
| **Texto Secundario**| `--text-secondary`| `#94a3b8` | Subtítulos, descripciones secundarias y etiquetas |
| **Texto Atenuado** | `--text-muted` | `#64748b` | Contadores, microetiquetas técnicas y metadatos |
| **Acento Primario** | `--accent-primary` | `#8b5cf6` | Botón principal de redacción y acciones clave |
| **Violeta Eléctrico**| `--accent-hover` | `#7c3aed` | Estado activo e interactivo primario |
| **Lavanda Brillante**| `--accent-gold` | `#c084fc` | Insignias, estados activos del stepper, focos |
| **Cian Estudio** | `--accent-cyan` | `#06b6d4` | Insignias de previsualización oficial e indicadores |
| **Esmeralda Éxito** | `--accent-emerald` | `#10b981` | Aprobación del cuestionario (≥80%) y respuestas correctas |
| **Rosa Carmesí** | `--accent-rose` | `#f43f5e` | Botón de detención (Stop) y respuestas incorrectas |

## Typography

- **Fuente Sans:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`.
- **Fuente Mono:** `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`.
- **Jerarquía:**
  - Títulos principales: `1.18rem`, `font-weight: 700`, `letter-spacing: -0.025em`.
  - Títulos de sección: `1.05rem`, `font-weight: 700`.
  - Texto de lectura: `0.92rem`, `line-height: 1.68`, `max-width: 75ch`.
  - Microcopia de sección: `0.68rem`, `font-weight: 700`, `letter-spacing: 0.08em`, `text-transform: uppercase`.

## Layout

- Disposición en 2 paneles de trabajo desacoplados en escritorio (>1080px):
  - **Panel Izquierdo:** Formulario de parámetros, estrategia y configuración de IA.
  - **Panel Derecho:** Previsualización fidedigna de hojas físicas oficiales de Word/PDF.
- Scroll independiente y confinado mediante `overscroll-behavior: contain`.
- En pantallas táctiles o compactas (≤1080px), colapsa fluidamente a 1 columna.

## Elevation & Depth

- **Sombras:**
  - Botones primarios: `0 8px 24px rgba(124, 58, 237, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)`.
  - Modales: `0 25px 60px rgba(0, 0, 0, 0.85), 0 0 45px rgba(124, 58, 237, 0.18)`.
  - Hoja de papel: `0 24px 60px rgba(0, 0, 0, 0.7), 0 4px 16px rgba(0, 0, 0, 0.4)`.
- **Bordes:** Finos de 1px con transparencias sobrias (`rgba(255, 255, 255, 0.07)` a `rgba(255, 255, 255, 0.12)`).

## Shapes

- Botones y controles de formulario: `8px` (`rounded.md`).
- Tarjetas y contenedores de panel: `16px` (`rounded.xl`).
- Modales: `16px` (`rounded.xl`).
- Chips de estado y badges: `9999px` (`rounded.full`).

## Components

- **`.btn-primary`:** Gradiente violeta eléctrico (`linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%)`) con halo sutil.
- **`.brand-badge`:** Píldora de estudio neón (`linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)`) inspirada en el badge PRO de MUSO.
- **`.segmented-control`:** Selector estilizado oscuro (`#10121a`) con opción activa resaltada en slate profundo y borde violeta sutil.
- **`.quiz-step-chip`:** Dimensiones táctiles accesibles `36×36px` con objetivo de `44×44px`, acentos neón para estados activo, correcto y fallido.
- **`.protocol-paper-sheet`:** Hoja física nítida blanca con relieve de sombra volumétrica.

## Do's and Don'ts

### Do's
- Emplear el violeta eléctrico (`#8b5cf6` / `#7c3aed`) como acento principal guiando acciones de alta relevancia.
- Mantener fondos oscuros profundos (`#0d0f16` a `#1a1d29`) para recrear la atmósfera de estudio profesional.
- Conservar los bordes translúcidos de 1px (`rgba(255, 255, 255, 0.07)`) que aportan sutileza arquitectónica.
- Asegurar que la hoja física de Word/PDF contraste con un blanco puro sobre el fondo oscuro.

### Don'ts
- No utilizar bordes rígidos artificiales tipo pestaña lateral (`side-tab`).
- No emplear azul cielo frío estándar de Tailwind (`#38bdf8`) como fondo de contenedor principal.
- No sobrecargar la pantalla con animaciones pesadas; respetar `prefers-reduced-motion`.
