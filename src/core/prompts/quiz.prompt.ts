export function buildQuizPrompt(protocolText: string, materia: string): string {
  return `Eres un profesor universitario experto evaluando la comprensión de un estudiante sobre el contenido de su protocolo académico.
A partir del texto del protocolo generado para la materia "${materia}", elabora un cuestionario de evaluación riguroso y formativo de exactamente 10 preguntas de selección múltiple.

REGLAS OBLIGATORIAS:
1. Genera exactamente 10 preguntas numeradas del 1 al 10 en la propiedad "id".
2. Cada pregunta debe basarse en el contenido real del protocolo (conceptos clave y sus definiciones, objetivos de aprendizaje, resumen de temas/discusiones, metodología de trabajo, recomendaciones o conclusiones).
3. Cada pregunta debe tener EXACTAMENTE 4 opciones de respuesta distintas en el array "options" (índices 0, 1, 2, 3).
4. Solo una de las 4 opciones debe ser la respuesta correcta. Las otras 3 deben ser alternativas plausibles pero incorrectas según lo expresado en el texto.
5. "correctOptionIndex" debe ser un número entero entre 0 y 3 que coincida exactamente con la posición de la respuesta correcta dentro del array "options".
6. "explanation" debe ser una explicación clara y concisa (1 o 2 oraciones) indicando por qué esa opción es la correcta según el protocolo.
7. La respuesta debe ser ESTRICTAMENTE un array JSON válido, sin bloques de markdown adicionales (sin \`\`\`json ni \`\`\`), sin texto introductorio y sin comentarios.

FORMATO JSON ESPERADO:
[
  {
    "id": 1,
    "question": "¿Cuál es el objetivo principal planteado en el protocolo sobre ...?",
    "options": [
      "Opción de respuesta A",
      "Opción de respuesta B",
      "Opción de respuesta C",
      "Opción de respuesta D"
    ],
    "correctOptionIndex": 0,
    "explanation": "El protocolo indica expresamente que ..."
  }
]

CONTENIDO DEL PROTOCOLO PARA EL CUESTIONARIO:
"""
${protocolText}
"""`;
}
