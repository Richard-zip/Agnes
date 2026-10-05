import React from "react";
import { useProtocolController } from "./hooks/useProtocolController";
import { ProtocolForm } from "./components/ProtocolForm";
import { ProtocolPreview } from "./components/ProtocolPreview";
import { ProtocolQuizModal } from "./components/ProtocolQuizModal";
import { AppContainer, container as defaultContainer } from "../infrastructure/di/container";

interface ProtocolAppProps {
  appContainer?: AppContainer;
  onRequestConfig?: () => void;
}

export const ProtocolApp: React.FC<ProtocolAppProps> = ({ appContainer, onRequestConfig }) => {
  const {
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
    errorMessage,
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
  } = useProtocolController(appContainer, onRequestConfig);

  const activeContainer = appContainer || defaultContainer;

  return (
    <div className="workspace-grid">
      <ProtocolForm
        materia={materia}
        onMateriaChange={setMateria}
        temasTexto={temasTexto}
        onTemasTextoChange={setTemasTexto}
        tipo={tipo}
        onTipoChange={setTipo}
        instruccionesAdicionales={instruccionesAdicionales}
        onInstruccionesAdicionalesChange={setInstruccionesAdicionales}
        availableStrategies={availableStrategies}
        loading={loading}
        onGenerate={handleGenerate}
        onStop={handleStop}
      />

      <ProtocolPreview
        materia={materia}
        activeStrategy={activeStrategy}
        temasCount={temasFiltrados.length}
        protocol={currentProtocol}
        loading={loading}
        exportingWord={exportingWord}
        exportingPdf={exportingPdf}
        errorMessage={errorMessage}
        documentExporter={activeContainer.documentExporter}
        onRetry={handleGenerate}
        onStop={handleStop}
        onExportWord={handleExportWord}
        onExportPdf={handleExportPdf}
        onRequestConfig={onRequestConfig}
      />

      <ProtocolQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        quiz={currentQuiz}
        loadingQuiz={loadingQuiz}
        onRetryGenerateQuiz={handleRetryGenerateQuiz}
        onPassed={handleQuizPassed}
        targetDownloadFormat={pendingDownloadFormat}
      />
    </div>
  );
};

export default ProtocolApp;
