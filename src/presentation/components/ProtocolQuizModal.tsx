import React, { useState, useEffect, useMemo, useRef } from "react";
import { Quiz, QuizEvaluationResult } from "../../core/entities/quiz.entity";

export interface ProtocolQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  loadingQuiz: boolean;
  onRetryGenerateQuiz?: () => void;
  onPassed: () => void;
  targetDownloadFormat: "word" | "pdf";
}

export const ProtocolQuizModal: React.FC<ProtocolQuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  loadingQuiz,
  onRetryGenerateQuiz,
  onPassed,
  targetDownloadFormat,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [evaluation, setEvaluation] = useState<QuizEvaluationResult | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Reiniciar estado si cambia el quiz
  useEffect(() => {
    if (quiz) {
      setUserAnswers({});
      setEvaluation(null);
      setValidationWarning(null);
      setCurrentIndex(0);
      bodyRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [quiz]);

  const totalQuestions = quiz?.questions.length || 10;
  const answeredCount = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter((q) => userAnswers[q.id] !== undefined).length;
  }, [quiz, userAnswers]);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setValidationWarning(null);
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setValidationWarning(null);
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setValidationWarning(null);
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentIndex(index);
    setValidationWarning(null);
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEvaluate = () => {
    if (!quiz) return;

    if (answeredCount < totalQuestions) {
      setValidationWarning(
        `Has respondido ${answeredCount} de ${totalQuestions} preguntas. Por favor responde todas las preguntas antes de verificar.`
      );
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setValidationWarning(null);
    const result = quiz.evaluate(userAnswers);
    setEvaluation(result);

    // Si reprobó, redirigir automáticamente a la primera pregunta incorrecta para facilitarle la corrección
    if (!result.passed) {
      const firstWrong = quiz.questions.findIndex((q) => {
        const r = result.questionResults.find((res) => res.questionId === q.id);
        return r && !r.isCorrect;
      });
      if (firstWrong !== -1) {
        setCurrentIndex(firstWrong);
      }
    }

    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProceedDownload = () => {
    if (evaluation?.passed) {
      onPassed();
      onClose();
    }
  };

  const formatLabel = targetDownloadFormat === "word" ? "Word (.docx)" : "PDF (.pdf)";
  const currentQuestion = quiz?.questions[currentIndex];
  const selectedOption = currentQuestion ? userAnswers[currentQuestion.id] : undefined;
  const currentResult = evaluation?.questionResults.find((r) => r.questionId === currentQuestion?.id);
  const isCorrect = evaluation !== null && currentResult?.isCorrect;
  const isIncorrect = evaluation !== null && currentResult && !currentResult.isCorrect;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="quiz-modal-title">
      <div className="modal-dialog quiz-modal-dialog">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-icon-wrap quiz-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="m9 15 2 2 4-4" />
            </svg>
          </div>
          <div className="modal-header-text">
            <h2 id="quiz-modal-title" className="modal-title">
              Evaluación de Comprensión del Protocolo
            </h2>
            <p className="modal-subtitle">
              Responde las 10 preguntas de selección múltiple sobre los temas estudiados para habilitar la descarga.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar evaluación"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="modal-body quiz-modal-body">
          {/* Regla de aprobación y contador */}
          <div className="quiz-target-banner">
            <div className="quiz-target-info">
              <span className="quiz-target-badge">Requisito Obligatorio</span>
              <span className="quiz-target-text">
                Porcentaje mínimo de aprobación: <strong>80% (mínimo 8 de 10 respuestas correctas)</strong>.
              </span>
            </div>
            {quiz && !loadingQuiz && (
              <span className="quiz-progress-badge">
                {answeredCount} / {totalQuestions} respondidas
              </span>
            )}
          </div>

          {/* Stepper / Paginación numérica interactiva (1 a 10) */}
          {!loadingQuiz && quiz && (
            <div className="quiz-stepper-wrap">
              <div className="quiz-stepper-info">
                <span className="quiz-stepper-label">
                  Pregunta {currentIndex + 1} de {totalQuestions}
                </span>
                <span className="quiz-stepper-hint">
                  Haz clic en cualquier número para ir directamente a esa pregunta
                </span>
              </div>
              <div className="quiz-stepper" role="tablist" aria-label="Selector de preguntas">
                {quiz.questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const qResult = evaluation?.questionResults.find((r) => r.questionId === q.id);
                  const isQCorrect = evaluation !== null && qResult && qResult.isCorrect;
                  const isQIncorrect = evaluation !== null && qResult && !qResult.isCorrect;

                  let statusClass = "";
                  if (evaluation !== null) {
                    statusClass = isQCorrect ? "step-correct" : "step-incorrect";
                  } else if (isAnswered) {
                    statusClass = "step-answered";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      className={`quiz-step-chip ${isCurrent ? "current" : ""} ${statusClass}`}
                      onClick={() => handleGoToQuestion(idx)}
                      title={`Pregunta ${idx + 1}${isAnswered ? " (Respondida)" : ""}${
                        isQCorrect ? " (Correcta)" : ""
                      }${isQIncorrect ? " (Incorrecta)" : ""}`}
                    >
                      <span className="step-num">{idx + 1}</span>
                      {evaluation !== null && (
                        <span className="step-icon">{isQCorrect ? "✓" : "✗"}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado de carga */}
          {loadingQuiz && (
            <div className="quiz-loading-container">
              <div className="quiz-loading-spinner" />
              <p className="quiz-loading-title">Elaborando cuestionario con IA...</p>
              <p className="quiz-loading-subtitle">
                Analizando los conceptos técnicos y temas de tu protocolo para formular 10 preguntas personalizadas.
              </p>
            </div>
          )}

          {/* Error al generar */}
          {!loadingQuiz && !quiz && (
            <div className="quiz-error-container">
              <p>No se pudo estructurar el cuestionario en este momento.</p>
              {onRetryGenerateQuiz && (
                <button type="button" className="btn btn-primary" onClick={onRetryGenerateQuiz}>
                  Reintentar generación
                </button>
              )}
            </div>
          )}

          {/* Resultado de la evaluación */}
          {evaluation && (
            <div
              className={`quiz-evaluation-banner ${evaluation.passed ? "passed" : "failed"}`}
              role="alert"
            >
              <div className="quiz-eval-icon">
                {evaluation.passed ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
              </div>
              <div className="quiz-eval-text">
                <strong>
                  {evaluation.passed
                    ? `¡Aprobado con éxito! Calificación: ${evaluation.scorePercentage}% (${evaluation.correctCount}/10 correctas)`
                    : `No alcanzaste el puntaje mínimo: ${evaluation.scorePercentage}% (${evaluation.correctCount}/10 correctas)`}
                </strong>
                <p>
                  {evaluation.passed
                    ? `Has demostrado un dominio sobresaliente del protocolo. Ya puedes descargar tu documento en formato ${formatLabel}.`
                    : "Revisa las preguntas marcadas en rojo usando los números arriba, modifica tus respuestas y vuelve a comprobarlas hasta alcanzar el 80%."}
                </p>
              </div>
            </div>
          )}

          {/* Advertencia de preguntas pendientes */}
          {validationWarning && (
            <div className="quiz-warning-banner" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{validationWarning}</span>
            </div>
          )}

          {/* Pregunta Paginada Activa (1 pregunta a la vez) */}
          {!loadingQuiz && quiz && currentQuestion && (
            <div className="quiz-paginated-container">
              <div
                key={currentQuestion.id}
                className={`quiz-question-card paginated ${isIncorrect ? "incorrect" : ""} ${isCorrect ? "correct" : ""}`}
              >
                <div className="quiz-question-header">
                  <span className="quiz-question-number">
                    {String(currentIndex + 1).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
                  </span>
                  <h3 className="quiz-question-title">{currentQuestion.question}</h3>
                  {isCorrect && <span className="quiz-badge-correct">✓ Correcta</span>}
                  {isIncorrect && <span className="quiz-badge-incorrect">✗ Incorrecta</span>}
                </div>

                <div className="quiz-options-group" role="radiogroup" aria-label={`Pregunta ${currentIndex + 1}`}>
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <div
                        key={optIdx}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`quiz-option-label ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            handleSelectOption(currentQuestion.id, optIdx);
                          }
                        }}
                      >
                        <span className="quiz-option-letter">{optionLetter}</span>
                        <span className="quiz-option-text">{option}</span>
                      </div>
                    );
                  })}
                </div>

                {isIncorrect && (
                  <div className="quiz-question-feedback">
                    <span className="quiz-feedback-label">Pista conceptual:</span>
                    <p className="quiz-feedback-text">{currentQuestion.explanation}</p>
                  </div>
                )}

                {/* Controles de navegación de la tarjeta paginada */}
                <div className="quiz-card-nav">
                  <button
                    type="button"
                    className="btn btn-secondary quiz-nav-btn"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span>Pregunta anterior</span>
                  </button>

                  <span className="quiz-nav-status">
                    {selectedOption !== undefined ? "✓ Opción seleccionada" : "Selecciona una opción"}
                  </span>

                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      className="btn btn-primary quiz-nav-btn quiz-btn-next"
                      onClick={handleNext}
                    >
                      <span>Siguiente pregunta</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary quiz-nav-btn quiz-btn-verify"
                      onClick={handleEvaluate}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 12 2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      <span>{evaluation ? "Reintentar comprobación" : "Verificar respuestas"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer quiz-modal-footer">
          <div className="quiz-footer-left">
            <span className="quiz-footer-counter">
              Respondidas: <strong>{answeredCount}</strong> de <strong>{totalQuestions}</strong>
            </span>
          </div>

          <div className="modal-footer-main-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>

            {evaluation?.passed ? (
              <button
                type="button"
                className="btn btn-primary quiz-btn-download"
                onClick={handleProceedDownload}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Descargar {formatLabel}</span>
              </button>
            ) : (
              <>
                {currentIndex > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary quiz-footer-prev-btn"
                    onClick={handlePrevious}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span>Anterior</span>
                  </button>
                )}

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary quiz-footer-next-btn"
                    onClick={handleNext}
                  >
                    <span>Siguiente pregunta</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleEvaluate}
                    disabled={loadingQuiz || !quiz}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 12 2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span>{evaluation ? "Reintentar comprobación" : "Verificar respuestas"}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
