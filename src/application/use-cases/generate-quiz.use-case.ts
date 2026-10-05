import { Protocol } from "../../core/entities/protocol.entity";
import { Quiz, QuizQuestion } from "../../core/entities/quiz.entity";
import { IAIService } from "../../core/interfaces/ai-service.interface";
import { ILogger } from "../../core/interfaces/logger.interface";
import { buildQuizPrompt } from "../../core/prompts/quiz.prompt";

export class GenerateQuizUseCase {
  constructor(
    private readonly aiService: IAIService,
    private readonly logger: ILogger
  ) {}

  async execute(protocol: Protocol, signal?: AbortSignal): Promise<Quiz> {
    const reqId = Date.now();
    const materia = protocol.metadata.materia || "Materia";
    this.logger.info(`(${reqId}) Generando cuestionario de 10 preguntas para "${materia}"...`);

    const prompt = buildQuizPrompt(protocol.rawText, materia);

    try {
      const rawResponse = await this.aiService.generateContent(prompt, signal);
      const parsedQuestions = this.parseQuestions(rawResponse);

      if (parsedQuestions && parsedQuestions.length >= 10) {
        const top10 = parsedQuestions.slice(0, 10).map((q, idx) => ({
          ...q,
          id: idx + 1,
        }));
        this.logger.info(`(${reqId}) Cuestionario de 10 preguntas generado con IA con éxito.`);
        return new Quiz(String(reqId), protocol.formattedTitle, top10);
      }

      this.logger.info(`(${reqId}) La IA devolvió formato incompleto de preguntas. Empleando generador de respaldo estructurado.`);
    } catch (err) {
      if (signal?.aborted || (err instanceof Error && err.name === "AbortError")) {
        throw err;
      }
      this.logger.error(`(${reqId}) Error al generar preguntas con IA: ${err instanceof Error ? err.message : String(err)}. Generando cuestionario de respaldo.`);
    }

    const fallbackQuestions = this.generateFallbackQuiz(protocol);
    return new Quiz(String(reqId), protocol.formattedTitle, fallbackQuestions);
  }

  private parseQuestions(rawText: string): QuizQuestion[] | null {
    try {
      // 1. Limpiar bloques markdown ```json ... ``` si la IA los incluyó
      let cleaned = rawText.trim();
      const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        cleaned = codeBlockMatch[1].trim();
      }

      // 2. Extraer el primer array JSON detectado
      const firstBracket = cleaned.indexOf("[");
      const lastBracket = cleaned.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      }

      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) return null;

      const validQuestions: QuizQuestion[] = [];
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (
          item &&
          typeof item.question === "string" &&
          item.question.trim().length > 0 &&
          Array.isArray(item.options) &&
          item.options.length === 4 &&
          item.options.every((opt: unknown) => typeof opt === "string" && (opt as string).trim().length > 0) &&
          typeof item.correctOptionIndex === "number" &&
          item.correctOptionIndex >= 0 &&
          item.correctOptionIndex < 4
        ) {
          validQuestions.push({
            id: typeof item.id === "number" ? item.id : i + 1,
            question: item.question.trim(),
            options: item.options.map((opt: string) => opt.trim()),
            correctOptionIndex: item.correctOptionIndex,
            explanation: typeof item.explanation === "string" && item.explanation.trim().length > 0
              ? item.explanation.trim()
              : "Respuesta correcta conforme a las directrices y contenido del protocolo.",
          });
        }
      }

      return validQuestions.length > 0 ? validQuestions : null;
    } catch {
      return null;
    }
  }

  /**
   * Generador determinista de 10 preguntas cuando la IA falla o no tiene conexión,
   * garantizando que el usuario siempre pueda responder y descargar su documento.
   */
  private generateFallbackQuiz(protocol: Protocol): QuizQuestion[] {
    const materia = protocol.metadata.materia || "la materia";
    const temas = protocol.metadata.temas || [];
    const primerTema = temas[0] || "los temas centrales";
    const segundoTema = temas[1] || primerTema;

    return [
      {
        id: 1,
        question: `¿Cuál es el propósito formativo primordial del protocolo académico en ${materia}?`,
        options: [
          `Consolidar el aprendizaje conceptual y metodológico sobre ${primerTema}.`,
          "Cumplir con un requisito puramente administrativo sin análisis crítico.",
          "Memorizar listas bibliográficas sin aplicación práctica en el área.",
          "Sustituir las sesiones presenciales de evaluación por texto libre.",
        ],
        correctOptionIndex: 0,
        explanation: "El protocolo tiene como fin pedagógico evidenciar la asimilación conceptual y metodológica de la materia.",
      },
      {
        id: 2,
        question: `Respecto a los objetivos formulados en el protocolo, ¿cuál es su enfoque cardinal?`,
        options: [
          "Definir metas orientadas a la comprensión profunda y la aplicación técnica de los temas.",
          "Limitar el alcance exclusivamente a un repaso somero de conceptos básicos.",
          "Evitar la vinculación con marcos o estándares internacionales del sector.",
          "Redactar metas ambiguas sin indicadores verificables de aprendizaje.",
        ],
        correctOptionIndex: 0,
        explanation: "Los objetivos articulan metas verificables de aprendizaje teórico y práctico.",
      },
      {
        id: 3,
        question: `En relación con ${primerTema}, ¿qué aspecto metodológico se resalta en el documento?`,
        options: [
          "La investigación estructurada, el análisis crítico y la síntesis conceptual rigurosa.",
          "La copia textual de fuentes secundarias sin contrastación de fuentes.",
          "La omisión de definiciones operativas para simplificar la lectura.",
          "El desinterés por la aplicabilidad profesional en entornos reales.",
        ],
        correctOptionIndex: 0,
        explanation: "La metodología promueve un proceso ordenado de indagación, síntesis y reflexión.",
      },
      {
        id: 4,
        question: `¿Qué función cumplen los conceptos clave y sus definiciones dentro de la estructura curricular del protocolo?`,
        options: [
          "Establecer la base semántica y teórica común necesaria para dominar los temas tratados.",
          "Aumentar artificialmente la extensión del documento sin relevancia disciplinar.",
          "Reemplazar los objetivos específicos del proceso de aprendizaje.",
          "Desconectar la teoría de los casos de estudio aplicados.",
        ],
        correctOptionIndex: 0,
        explanation: "Los conceptos clave precisan las definiciones operativas que sustentan el aprendizaje.",
      },
      {
        id: 5,
        question: `Al abordar ${segundoTema}, ¿cómo se relacionan las discusiones con la práctica profesional?`,
        options: [
          "Permiten identificar escenarios reales de implementación, ventajas y desafíos técnicos.",
          "Se limitan a conjeturas hipotéticas sin vigencia en el sector productivo.",
          "Sostienen que la teoría debe mantenerse desvinculada del ámbito laboral.",
          "Ignoran los criterios de calidad y buenas prácticas reconocidos en la disciplina.",
        ],
        correctOptionIndex: 0,
        explanation: "Las discusiones contrastan el marco teórico con situaciones reales y criterios de calidad.",
      },
      {
        id: 6,
        question: "¿Por qué es crucial contrastar diferentes perspectivas al analizar los temas del protocolo?",
        options: [
          "Porque enriquece el pensamiento crítico y permite fundamentar decisiones técnicas sólidas.",
          "Porque elimina la necesidad de contar con conclusiones definitivas.",
          "Porque genera confusión metodológica innecesaria en el proceso de estudio.",
          "Porque descarta el uso de bibliografía académica en favor de opiniones aisladas.",
        ],
        correctOptionIndex: 0,
        explanation: "El contraste de perspectivas fortalece el análisis crítico y la solidez argumentativa.",
      },
      {
        id: 7,
        question: "¿Cuál es el valor pedagógico de la sección de metodología reportada en el protocolo?",
        options: [
          "Transparentar el proceso cognitivo, investigativo y de análisis seguido para la actividad.",
          "Ocultar las fuentes de información utilizadas durante el desarrollo.",
          "Demostrar que el aprendizaje no requiere planificación previa ni método alguno.",
          "Servir únicamente como relleno formal sin relevancia evaluativa.",
        ],
        correctOptionIndex: 0,
        explanation: "La metodología detalla las etapas de indagación y consolidación seguidas por el estudiante.",
      },
      {
        id: 8,
        question: `¿Qué importancia reviste la formulación de conclusiones orientadas a la asignatura "${materia}"?`,
        options: [
          "Sintetizar los hallazgos principales y proyectar su impacto medible en proyectos del área.",
          "Reiterar palabra por palabra la introducción sin aportar conclusiones integradoras.",
          "Demostrar que los temas no tienen repercusión práctica en la industria o la academia.",
          "Evadir compromisos conceptuales con los estándares vigentes de la disciplina.",
        ],
        correctOptionIndex: 0,
        explanation: "Las conclusiones condensan el valor del aprendizaje obtenido y su aplicación futura.",
      },
      {
        id: 9,
        question: "¿Cuál es la exigencia institucional respecto a las fuentes bibliográficas citadas?",
        options: [
          "Estar referenciadas con rigor académico (normas APA) priorizando fuentes recientes y verificables.",
          "Incluir enlaces rotos o fuentes sin verificación de autoría institucional.",
          "Citar únicamente blogs anónimos o publicaciones en redes sociales no científicas.",
          "Prescindir de la fecha y del autor para agilizar la entrega del informe.",
        ],
        correctOptionIndex: 0,
        explanation: "Las referencias deben responder al estándar APA y asegurar fuentes acreditadas y verificables.",
      },
      {
        id: 10,
        question: "¿Qué compromiso asume el estudiante al aprobar y descargar este protocolo académico?",
        options: [
          "Reconocer y validar activamente los conocimientos plasmados para su aplicación ética y profesional.",
          "Desatender las recomendaciones propuestas una vez archivado el archivo digital.",
          "Considerar el protocolo como un fin en sí mismo sin continuidad académica.",
          "Delegar la responsabilidad del contenido exclusivamente en herramientas externas.",
        ],
        correctOptionIndex: 0,
        explanation: "El protocolo representa la asimilación responsable y ética de las competencias del curso.",
      },
    ];
  }
}
