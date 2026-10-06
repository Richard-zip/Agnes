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
    const temas = protocol.metadata.temas || [];
    this.logger.info(`(${reqId}) Generando cuestionario de 10 preguntas para "${materia}" (temas: ${temas.join(", ")})...`);

    const prompt = buildQuizPrompt(protocol.rawText, materia, temas);

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
   * Generador determinista de 10 preguntas estrictamente enfocado en los temas y conceptos
   * técnicos del protocolo, empleado cuando la IA falla o no tiene conexión.
   */
  private generateFallbackQuiz(protocol: Protocol): QuizQuestion[] {
    const materia = protocol.metadata.materia || "la materia";
    const temas =
      protocol.metadata.temas && protocol.metadata.temas.length > 0
        ? protocol.metadata.temas.filter(Boolean)
        : ["Fundamentos conceptuales de la materia"];

    const temaA = temas[0] || materia;
    const temaB = temas[1] || temaA;
    const temaC = temas[2] || temaB;

    // Extraer conceptos y definiciones reales del protocolo si existen
    const rawConceptos = protocol.extractedFields?.conceptos || "";
    const conceptRegex =
      /(?:(?:\d+[.)]|[-*•])\s*)?(?:\*\*)?([^*\n:–—]+?)(?:\*\*)?\s*(?::\s*|\s*[-–—]\s*|\s*:\s*\*\*\s*)([^\n]+)/g;
    const extractedConcepts: Array<{ term: string; def: string }> = [];
    let match: RegExpExecArray | null;
    while ((match = conceptRegex.exec(rawConceptos)) !== null) {
      const term = match[1].trim().replace(/^\*\*|\*\*$/g, "").trim();
      let def = match[2].trim().replace(/^\*\*|\*\*$/g, "").trim();
      if (def.length > 0 && !/[.?!]$/.test(def)) {
        def += ".";
      }
      if (term.length >= 2 && def.length >= 6) {
        extractedConcepts.push({ term, def });
      }
    }

    const c0 = extractedConcepts[0];
    const c1 = extractedConcepts[1];
    const c2 = extractedConcepts[2];

    const createQuestion = (
      id: number,
      question: string,
      correctText: string,
      distractors: [string, string, string],
      correctIndex: number,
      explanation: string
    ): QuizQuestion => {
      const options: string[] = [];
      let distractorIdx = 0;
      for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
          options.push(correctText);
        } else {
          options.push(distractors[distractorIdx++]);
        }
      }
      return {
        id,
        question,
        options,
        correctOptionIndex: correctIndex,
        explanation,
      };
    };

    // Distribución equilibrada de la posición de la respuesta correcta
    const positions = [0, 1, 2, 3, 1, 2, 0, 3, 2, 0];

    return [
      // 1. Definición conceptual de c0 o principio de temaA
      createQuestion(
        1,
        c0
          ? `¿Cuál de las siguientes afirmaciones define con mayor precisión técnica el concepto de «${c0.term}» en ${materia}?`
          : `En el estudio de «${temaA}» dentro de ${materia}, ¿cuál es el principio conceptual prioritario?`,
        c0
          ? c0.def
          : "Comprender los fundamentos técnicos y mecanismos esenciales que rigen su funcionamiento y diseño.",
        [
          c1 ? c1.def : "Un proceso puramente administrativo ajeno a los fundamentos operativos del área.",
          `Una técnica empírica desaconsejada por las buenas prácticas contemporáneas en ${materia}.`,
          `Un componente auxiliar sin incidencia directa en la estructura técnica de ${c0?.term || temaA}.`,
        ],
        positions[0],
        c0
          ? `En el contenido analizado, «${c0.term}» se define con precisión como: ${c0.def}`
          : `El dominio de «${temaA}» requiere comprender los mecanismos esenciales y su fundamento técnico.`
      ),

      // 2. Definición conceptual de c1 o meta de temaB
      createQuestion(
        2,
        c1
          ? `¿Cómo se define y delimita técnicamente «${c1.term}» en el contexto temático de ${materia}?`
          : `Al abordar el tema «${temaB}» en ${materia}, ¿qué meta u objetivo técnico cardinal se persigue?`,
        c1
          ? c1.def
          : "Dominar los modelos, patrones y criterios de calidad para solucionar problemas sistemáticamente.",
        [
          c0 ? c0.def : "Una convención informal sin aplicación en estándares técnicos verificables.",
          c2 ? c2.def : "Un procedimiento accesorio de bajo impacto en el diseño general.",
          `Un enfoque transitorio incompatible con arquitecturas sostenibles en ${materia}.`,
        ],
        positions[1],
        c1
          ? `En el texto técnico, «${c1.term}» se especifica formalmente como: ${c1.def}`
          : `El aprendizaje de «${temaB}» se orienta al dominio de modelos y criterios de calidad para la resolución sistemática de problemas.`
      ),

      // 3. Rol técnico de c2 o función técnica de temaA
      createQuestion(
        3,
        c2
          ? `Dentro del marco conceptual de ${materia}, ¿qué función técnica cumple «${c2.term}»?`
          : `¿Cuál es el rol o función técnica primordial de «${temaA}» en la estructuración de soluciones en ${materia}?`,
        c2
          ? c2.def
          : "Establecer los lineamientos y reglas de diseño que aseguran la modularidad y solidez de la solución.",
        [
          c0 ? c0.def : "Un mecanismo auxiliar no determinante en el comportamiento del sistema.",
          "Una directriz operativa obsoleta desestimada por los estándares actuales.",
          "Una métrica subjetiva sin parámetros verificables en la ingeniería de la disciplina.",
        ],
        positions[2],
        c2
          ? `«${c2.term}» se conceptualiza técnicamente como: ${c2.def}`
          : `«${temaA}» define los lineamientos que aseguran modularidad y solidez en las soluciones técnicas.`
      ),

      // 4. Beneficio de aplicación práctica de c0 o temaA
      createQuestion(
        4,
        c0
          ? `Al aplicar «${c0.term}» en proyectos reales de ${materia}, ¿qué beneficio técnico esencial se garantiza?`
          : `Al aplicar «${temaA}» en proyectos de ingeniería de ${materia}, ¿qué beneficio estructural directo se obtiene?`,
        "Optimizar la cohesión técnica, reducir la complejidad y facilitar el mantenimiento continuo.",
        [
          "Generar una dependencia crítica no documentada con herramientas propietarias de terceros.",
          "Incrementar la fragilidad del diseño ante modificaciones en los requerimientos del entorno.",
          "Obligar a una reescritura total del sistema ante cualquier variación menor en el flujo de trabajo.",
        ],
        positions[3],
        `La aplicación técnica correcta de «${c0?.term || temaA}» promueve cohesión, modularidad y sustentabilidad técnica.`
      ),

      // 5. Criterios de evaluación técnica y trade-offs de temaA
      createQuestion(
        5,
        `¿Qué criterio de evaluación técnica resulta prioritario al implementar soluciones basadas en «${temaA}»?`,
        "Evaluar el balance entre eficiencia, escalabilidad, mantenibilidad y restricciones operativas.",
        [
          "Priorizar exclusivamente la rapidez inicial sin medir la deuda técnica acumulada.",
          "Omitir el análisis de riesgos técnicos y tolerancias ante contingencias del sistema.",
          "Asumir que cualquier implementación funcional posee calidad arquitectónica suficiente.",
        ],
        positions[4],
        `La evaluación rigurosa de «${temaA}» demanda sopesar eficiencia, mantenibilidad y escalabilidad frente a los costos técnicos.`
      ),

      // 6. Buenas prácticas de ingeniería en temaB
      createQuestion(
        6,
        `En relación con «${temaB}», ¿cuál es la mejor práctica de ingeniería recomendada para su análisis o implementación en ${materia}?`,
        "Fundamentar las decisiones en métricas verificables, estándares reconocidos y pruebas de consistencia.",
        [
          "Tomar decisiones técnicas basadas únicamente en preferencias empíricas sin sustento analítico.",
          "Descartar la interoperabilidad y el acoplamiento con otros componentes del entorno.",
          "Prescindir de la validación de requerimientos funcionales y no funcionales del sector.",
        ],
        positions[5],
        `Las mejores prácticas en «${temaB}» exigen decisiones respaldadas por estándares y validaciones verificables.`
      ),

      // 7. Integración sinérgica entre temas
      createQuestion(
        7,
        `¿De qué manera interactúan y se articulan técnicamente «${temaA}» y «${temaB}» en el ámbito de ${materia}?`,
        `De forma complementaria y sinérgica, donde los principios de «${temaA}» fortalecen la eficacia y alcance de «${temaB}».`,
        [
          "Como paradigmas incompatibles que no pueden convivir dentro de una misma solución integral.",
          "Sin ningún tipo de interrelación conceptual ni técnica en los flujos de trabajo contemporáneos.",
          "Como alternativas redundantes en las que la aplicación de una invalida la pertinencia de la otra.",
        ],
        positions[6],
        `Los temas «${temaA}» y «${temaB}» se integran sinérgicamente para brindar una solución robusta y coherente.`
      ),

      // 8. Diagnóstico técnico y análisis de causas raíz en temaC
      createQuestion(
        8,
        `Al diagnosticar o resolver dificultades técnicas vinculadas con «${temaC}», ¿qué enfoque metodológico es el más adecuado?`,
        "Un análisis metódico de causas raíz basado en el marco conceptual y la evidencia técnica comprobable.",
        [
          "Aplicar cambios aleatorios sin registro técnico hasta que los síntomas desaparezcan temporalmente.",
          "Ignorar la degradación progresiva mientras el sistema mantenga una operatividad parcial.",
          "Reemplazar componentes arbitrariamente sin aislar primero el origen real de la discrepancia.",
        ],
        positions[7],
        `El diagnóstico técnico riguroso en «${temaC}» requiere el aislamiento metódico de causas raíz sustentado en la evidencia.`
      ),

      // 9. Adaptabilidad, desacoplamiento y evolución a largo plazo
      createQuestion(
        9,
        `¿Cómo contribuye el dominio profundo de «${temaA}» a la adaptabilidad y evolución futura de los sistemas en ${materia}?`,
        "Permitiendo diseñar arquitecturas desacopladas y extensibles que absorben cambios con mínimo impacto negativo.",
        [
          "Creando estructuras monolíticas rígidas donde cualquier alteración genera efectos colaterales imprevistos.",
          "Fomentando el uso de soluciones propietarias cerradas que impiden futuras modernizaciones.",
          "Reduciendo la trazabilidad de los componentes para acelerar ciclos de despliegue provisional.",
        ],
        positions[8],
        `El dominio de «${temaA}» facilita el desacoplamiento y la extensibilidad ante la evolución de requisitos.`
      ),

      // 10. Conclusión técnica integral de la materia y sus temas
      createQuestion(
        10,
        `A partir del análisis técnico integral de «${materia}» y sus temas («${temas.slice(0, 3).join(", ")}»), ¿cuál es la conclusión técnica fundamental?`,
        "Que su asimilación técnica rigurosa proporciona las competencias necesarias para diseñar e implementar soluciones de calidad verificable.",
        [
          "Que los fundamentos teóricos resultan prescindibles frente a la programación empírica sin diseño previo.",
          "Que las metodologías y conceptos evaluados carecen de aplicabilidad práctica en la industria moderna.",
          "Que los estándares técnicos pueden omitirse libremente sin comprometer la fiabilidad y seguridad de las soluciones.",
        ],
        positions[9],
        `El estudio integral de «${materia}» y sus temas clave fundamenta la capacidad de diseñar soluciones técnicas de alta calidad.`
      ),
    ];
  }
}
