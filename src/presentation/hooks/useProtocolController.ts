import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Protocol } from "../../core/entities/protocol.entity";
import { Quiz } from "../../core/entities/quiz.entity";
import { AppContainer, container as defaultContainer } from "../../infrastructure/di/container";

export function useProtocolController(
  appContainer: AppContainer = defaultContainer,
  onRequestConfig?: () => void
) {
  const [materia, setMateria] = useState("");
  const [temasTexto, setTemasTexto] = useState("");
  const [tipo, setTipo] = useState("individual");
  const [instruccionesAdicionales, setInstruccionesAdicionales] = useState("");
  const [currentProtocol, setCurrentProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados del cuestionario obligatorio
  const [isQuizApproved, setIsQuizApproved] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<"word" | "pdf">("word");

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      appContainer.logger.info("Generación de protocolo detenida por el usuario.");
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, [appContainer]);

  // Subscribe to logger events
  useEffect(() => {
    setLogs(appContainer.logger.getRecentLogs());
    const unsubscribe = appContainer.logger.subscribe((entry) => {
      setLogs((prev) => [...prev, entry].slice(-200));
    });
    return unsubscribe;
  }, [appContainer]);

  // Available strategies queryable from the registry (Open/Closed Principle)
  const availableStrategies = useMemo(() => {
    return appContainer.protocolRegistry.getAll();
  }, [appContainer]);

  const activeStrategy = useMemo(() => {
    return appContainer.protocolRegistry.get(tipo);
  }, [appContainer, tipo]);

  const temasFiltrados = useMemo(() => {
    return temasTexto
      .split(/\r?\n+/)
      .map((tema) => tema.replace(/^[•*-]\s*/, "").replace(/[.,;:\s]+$/, "").trim())
      .filter(Boolean);
  }, [temasTexto]);

  const handleGenerate = async () => {
    setErrorMessage(null);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const generatedProtocol = await appContainer.generateProtocolUseCase.execute(
        {
          materia,
          temas: temasFiltrados,
          tipo,
          instruccionesAdicionales,
        },
        controller.signal
      );
      setCurrentProtocol(generatedProtocol);
      setIsQuizApproved(false);
      setCurrentQuiz(null);
    } catch (err) {
      if (
        controller.signal.aborted ||
        (err instanceof Error && err.name === "AbortError") ||
        (err instanceof Error && err.message.toLowerCase().includes("detenida")) ||
        (err instanceof Error && err.message.toLowerCase().includes("cancelada"))
      ) {
        // Cancelado limpiamente por el usuario
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      if (msg.toLowerCase().includes("api key") && onRequestConfig) {
        onRequestConfig();
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const fetchQuiz = useCallback(async (protocol: Protocol) => {
    setLoadingQuiz(true);
    try {
      const generatedQuiz = await appContainer.generateQuizUseCase.execute(protocol);
      setCurrentQuiz(generatedQuiz);
    } catch (err) {
      appContainer.logger.error("Error al estructurar el cuestionario de evaluación:", err);
    } finally {
      setLoadingQuiz(false);
    }
  }, [appContainer]);

  const executeExportWord = useCallback(async (protocol: Protocol) => {
    setExportingWord(true);
    try {
      await appContainer.exportProtocolUseCase.execute(protocol);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Error al descargar Word: ${msg}`);
    } finally {
      setExportingWord(false);
    }
  }, [appContainer]);

  const executeExportPdf = useCallback(async (protocol: Protocol) => {
    setExportingPdf(true);
    try {
      await appContainer.exportPdfUseCase.execute(protocol);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Error al descargar PDF: ${msg}`);
    } finally {
      setExportingPdf(false);
    }
  }, [appContainer]);

  const handleExportWord = useCallback(async () => {
    if (!currentProtocol) return;

    if (!isQuizApproved) {
      setPendingDownloadFormat("word");
      setIsQuizModalOpen(true);
      if (!currentQuiz) {
        fetchQuiz(currentProtocol);
      }
      return;
    }

    await executeExportWord(currentProtocol);
  }, [currentProtocol, isQuizApproved, currentQuiz, fetchQuiz, executeExportWord]);

  const handleExportPdf = useCallback(async () => {
    if (!currentProtocol) return;

    if (!isQuizApproved) {
      setPendingDownloadFormat("pdf");
      setIsQuizModalOpen(true);
      if (!currentQuiz) {
        fetchQuiz(currentProtocol);
      }
      return;
    }

    await executeExportPdf(currentProtocol);
  }, [currentProtocol, isQuizApproved, currentQuiz, fetchQuiz, executeExportPdf]);

  const handleQuizPassed = useCallback(async () => {
    setIsQuizApproved(true);
    if (currentProtocol) {
      if (pendingDownloadFormat === "word") {
        await executeExportWord(currentProtocol);
      } else {
        await executeExportPdf(currentProtocol);
      }
    }
  }, [currentProtocol, pendingDownloadFormat, executeExportWord, executeExportPdf]);

  const handleRetryGenerateQuiz = useCallback(() => {
    if (currentProtocol) {
      fetchQuiz(currentProtocol);
    }
  }, [currentProtocol, fetchQuiz]);

  return {
    materia,
    setMateria,
    temasTexto,
    setTemasTexto,
    tipo,
    setTipo,
    instruccionesAdicionales,
    setInstruccionesAdicionales,
    availableStrategies,
    activeStrategy,
    temasFiltrados,
    currentProtocol,
    loading,
    exportingWord,
    exportingPdf,
    logs,
    errorMessage,
    // Cuestionario
    isQuizApproved,
    isQuizModalOpen,
    setIsQuizModalOpen,
    currentQuiz,
    loadingQuiz,
    pendingDownloadFormat,
    handleQuizPassed,
    handleRetryGenerateQuiz,
    handleGenerate,
    handleStop,
    handleExportWord,
    handleExportPdf,
  };
}
