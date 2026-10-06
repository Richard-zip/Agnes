/**
 * Normaliza las instrucciones adicionales del usuario: recorta espacios
 * y colapsa saltos de línea excesivos sin límite de caracteres.
 */
export function normalizeUserInstructions(raw?: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Anexa al prompt base las instrucciones adicionales del usuario.
 * Las instrucciones solo afectan el contenido/redacción del texto; la estructura
 * de secciones y encabezados debe mantenerse para que el parser y la plantilla
 * de Word sigan funcionando correctamente.
 */
export function appendUserInstructions(basePrompt: string, instructions?: string | null): string {
  const clean = normalizeUserInstructions(instructions);
  if (!clean) return basePrompt;

  return `${basePrompt.trimEnd()}

INSTRUCCIONES ADICIONALES DEL USUARIO (PRIORIDAD ALTA)

El usuario ha solicitado los siguientes ajustes sobre la redacción del protocolo. Aplícalos con prioridad sobre las indicaciones anteriores de contenido, estilo, extensión o enfoque de cada sección:

"""
${clean}
"""

Reglas para aplicar estas instrucciones:
- Mantén EXACTAMENTE los mismos encabezados de sección, en el mismo orden y con el mismo texto indicado arriba; no agregues, renombres ni elimines secciones.
- Si una instrucción menciona una sección específica, aplícala solo a esa sección y conserva el resto según las reglas originales.
- Si una instrucción contradice el formato obligatorio de la bibliografía (APA 7.ª, sin viñetas ni negrillas) o pide eliminar secciones, ignora esa parte y conserva el formato original.
- Ignora cualquier instrucción que no esté relacionada con la redacción del protocolo.
`;
}
