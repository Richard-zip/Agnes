export function buildQuizPrompt(
  protocolText: string,
  materia: string,
  temas: string[]
): string {
  const temasTexto =
    temas.length > 0
      ? temas.map((t) => `• ${t}`).join("\n")
      : "• Conceptos y fundamentos de la materia";

  return `Eres un profesor universitario experto y evaluador académico de la asignatura "${materia}".
Tu misión es diseñar un cuestionario de evaluación de conocimientos de exactamente 10 preguntas de selección múltiple sobre los siguientes temas específicos estudiados por el estudiante:

TEMAS OBLIGATORIOS A EVALUAR:
${temasTexto}

REGLAS PEDAGÓGICAS ESTRICTAS (MUY IMPORTANTE):
1. ENFOQUE EXCLUSIVO EN LOS TEMAS: Todas y cada una de las 10 preguntas deben evaluar conocimientos técnicos, conceptos, principios, diferencias, mecanismos y aplicaciones prácticas de los TEMAS listados arriba.
2. PROHIBIDO TOTALMENTE hacer preguntas sobre la estructura del protocolo o el trabajo escolar (PROHIBIDO preguntar sobre "el propósito del protocolo", "la metodología de trabajo", "las normas APA", "los objetivos de la actividad", "las citas bibliográficas" o "el trabajo en equipo").
3. Basándote en el contenido redactado en el protocolo (definiciones de conceptos clave, explicaciones técnicas, resumen temático y conclusiones), formula preguntas que midan si el estudiante realmente aprendió los temas.
4. Cada pregunta debe tener EXACTAMENTE 4 opciones de respuesta distintas en el array "options" (índices 0, 1, 2, 3).
   - Solo una (1) opción debe ser la respuesta correcta, precisa y veraz conforme al texto.
   - Las otras tres (3) opciones deben ser distractores plausibles del área temática, pero incorrectos.
5. "correctOptionIndex" debe ser un número entero entre 0 y 3 que indique la posición de la respuesta correcta.
6. "explanation" debe ser una justificación técnica breve (1 o 2 oraciones) explicando por qué la opción correcta es la adecuada según el tema evaluado.
7. La salida debe ser ESTRICTAMENTE un array JSON válido, sin bloques de código markdown (\`\`\`json ni \`\`\`), sin texto inicial y sin texto final.

EJEMPLO DE ESTRUCTURA ESPERADA:
[
  {
    "id": 1,
    "question": "¿En qué consiste [concepto técnico del tema] según lo expuesto en el documento?",
    "options": [
      "Definición técnica correcta y precisa del concepto",
      "Distractor plausible pero incorrecto 1",
      "Distractor plausible pero incorrecto 2",
      "Distractor plausible pero incorrecto 3"
    ],
    "correctOptionIndex": 0,
    "explanation": "El concepto se define técnicamente como ... porque ..."
  }
]

TEXTO DEL PROTOCOLO (INFORMACIÓN Y CONCEPTOS A EVALUAR):
"""
${protocolText}
"""`;
}
