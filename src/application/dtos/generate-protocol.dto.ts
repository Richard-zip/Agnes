export interface GenerateProtocolDto {
  materia: string;
  temas: string[];
  tipo: string;
  /** Instrucciones extra del usuario para ajustar la redacción del protocolo (opcional). */
  instruccionesAdicionales?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateGenerateProtocolInput(dto: GenerateProtocolDto): ValidationResult {
  const errors: string[] = [];

  if (!dto.materia || !dto.materia.trim()) {
    errors.push("Falta ingresar la materia.");
  }

  const validTemas = (dto.temas || []).map((t) => t.trim()).filter(Boolean);
  if (validTemas.length === 0) {
    errors.push("Falta ingresar al menos un tema.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
