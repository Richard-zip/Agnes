---
name: Agnes — Editorial Académico Caribe
description: Sistema de diseño editorial, institucional y académico inspirado en la Universidad de Cartagena
colors:
  bg-app: "#080c15"
  bg-surface: "#0e1626"
  bg-surface-elevated: "#162035"
  bg-surface-paper: "#121a2c"
  text-primary: "#faf8f5"
  text-secondary: "#cbd5e1"
  text-muted: "#8091a7"
  primary: "#d97706"
  primary-hover: "#b45309"
  gold: "#f59e0b"
  terracotta: "#c2410c"
  cobalt: "#1d4ed8"
  emerald: "#059669"
  rose: "#e11d48"
  border-subtle: "rgba(217, 119, 6, 0.12)"
  border-medium: "rgba(217, 119, 6, 0.22)"
rounded:
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

Agnes es una estación de trabajo académica diseñada para la investigación, redacción y certificación del aprendizaje en protocolos universitarios. El lenguaje visual **Editorial Académico Caribe** abandona deliberadamente los clichés genéricos de software (fondos azul cian/Tailwind frío) en favor de una atmósfera de biblioteca de investigación con calidez cartagenera:
- **Tinta de medianoche abisal:** Profundidad serena y descansada para lectura prolongada.
- **Oro Ámbar y Terracota:** Tonos cálidos nobles que evocan el prestigio institucional, las murallas históricas y el papel pergamino.
- **Esmeralda de Aprobación:** Identificador de dominio conceptual en el cuestionario de aprendizaje.

## Colors

| Rol | Token | Hex / Valor | Uso |
|---|---|---|---|
| **Canvas** | `--bg-app` | `#080c15` | Fondo base de la aplicación |
| **Superficie** | `--bg-surface` | `#0e1626` | Paneles principales y barras de navegación |
| **Elevada** | `--bg-surface-elevated`| `#162035` | Modales, desplegables y tarjetas activas |
| **Texto Primario** | `--text-primary` | `#faf8f5` | Texto principal marfil pergamino cálido |
| **Texto Secundario**| `--text-secondary`| `#cbd5e1` | Subtítulos, descripciones y pistas |
| **Texto Atenuado** | `--text-muted` | `#8091a7` | Etiquetas y contadores de baja jerarquía |
| **Acento Primario** | `--accent-primary` | `#d97706` | Botón principal de redacción y acciones clave |
| **Acento Dorado** | `--accent-gold` | `#f59e0b` | Insignias, estados activos del stepper, focos |
| **Terracota** | `--accent-terracotta`| `#c2410c` | Botones de descarga y gradientes cálidos |
| **Esmeralda** | `--accent-emerald` | `#059669` | Validación del cuestionario y respuestas correctas |
| **Carmesí** | `--accent-rose` | `#e11d48` | Botón de detención (Stop) y respuestas incorrectas |

## Typography

- **Fuente Sans:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`.
- **Fuente Mono:** `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`.
- **Jerarquía:**
  - Títulos principales: `1.18rem`, `font-weight: 700`, `letter-spacing: -0.025em`.
  - Títulos de sección: `1.05rem`, `font-weight: 700`.
  - Texto de lectura: `0.92rem`, `line-height: 1.68`, `max-width: 75ch`.
  - Microcopia e insignias: `0.65rem – 0.78rem`, `font-weight: 600`.

## Layout

- Disposición en 2 paneles de trabajo desacoplados en pantallas de escritorio (>1080px):
  - **Panel Izquierdo:** Formulario de parámetros, selección de estrategia y configuración.
  - **Panel Derecho:** Previsualización fidedigna de hojas físicas oficiales de Word/PDF.
- Scroll independiente y confinado mediante `overscroll-behavior: contain`.
- En pantallas táctiles o compactas (≤1080px), colapsa fluidamente a 1 columna.

## Elevation & Depth

- **Sombras:**
  - Botones primarios: `0 8px 20px rgba(217, 119, 6, 0.28)`.
  - Modales: `0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 35px rgba(217, 119, 6, 0.16)`.
  - Hoja de papel: `0 18px 45px rgba(0, 0, 0, 0.55), 0 3px 10px rgba(0, 0, 0, 0.3)`.
- **Bordes:** Finos de 1px con transparencias cálidas (`rgba(217, 119, 6, 0.12)` a `0.22)`).

## Shapes

- Botones y controles de formulario: `8px` (`rounded.md`).
- Tarjetas y contenedores: `12px` (`rounded.lg`).
- Modales: `16px` (`rounded.xl`).
- Chips de estado y badges: `9999px` (`rounded.full`).

## Components

- **`.btn-primary`:** Fondo en gradiente ámbar (`#d97706` a `#b45309`), borde con brillo dorado fino y texto blanco nítido.
- **`.segmented-control`:** Selector estilizado con borde ambarino sutil y fondo elevado en la opción activa.
- **`.quiz-step-chip`:** Dimensiones accesibles `36×36px` con objetivo táctil de `44×44px`, identificadores de estado dinámico (respondida, aprobada, fallida).
- **`.protocol-paper-sheet`:** Renderizado de hoja física con textura blanca nítida, contrastada contra el fondo marino nocturno.

## Do's and Don'ts

### Do's
- Mantener los acentos dorados y terracota para guiar la atención sin saturar el lienzo.
- Utilizar el blanco marfil (`#faf8f5`) para títulos y cuerpo de texto para máxima comodidad ocular.
- Preservar el foco `:focus-visible` con `outline: 2px solid var(--accent-gold)`.

### Don'ts
- No utilizar bordes rígidos artificiales tipo pestaña lateral (`side-tab`).
- No emplear azul cian genérico (`#38bdf8`) para evitar el aspecto de plantilla genérica.
- No animar propiedades geométricas de layout (`width` o `height`) en transiciones de interfaz.
