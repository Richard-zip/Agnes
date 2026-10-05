import React, { useMemo, useState } from "react";
import { IProtocolStrategy } from "../../core/interfaces/protocol-strategy.interface";
import { MAX_USER_INSTRUCTIONS_LENGTH } from "../../core/prompts/user-instructions.prompt";

interface ProtocolFormProps {
  materia: string;
  onMateriaChange: (value: string) => void;
  temasTexto: string;
  onTemasTextoChange: (value: string) => void;
  tipo: string;
  onTipoChange: (tipo: string) => void;
  instruccionesAdicionales: string;
  onInstruccionesAdicionalesChange: (value: string) => void;
  availableStrategies: IProtocolStrategy[];
  loading: boolean;
  onGenerate: () => void;
  onStop?: () => void;
}

export const ProtocolForm: React.FC<ProtocolFormProps> = ({
  materia,
  onMateriaChange,
  temasTexto,
  onTemasTextoChange,
  tipo,
  onTipoChange,
  instruccionesAdicionales,
  onInstruccionesAdicionalesChange,
  availableStrategies,
  loading,
  onGenerate,
  onStop,
}) => {
  const [instruccionesAbiertas, setInstruccionesAbiertas] = useState(
    () => instruccionesAdicionales.trim().length > 0
  );
  const tieneInstrucciones = instruccionesAdicionales.trim().length > 0;
  const temasCount = useMemo(() => {
    return temasTexto
      .split(/\r?\n+/)
      .map((t) => t.replace(/^[•*-]\s*/, "").trim())
      .filter(Boolean).length;
  }, [temasTexto]);

  return (
    <section className="panel panel-form" aria-labelledby="form-heading">
      <div className="panel-header">
        <div className="panel-header-info">
          <h2 id="form-heading">Configuración del Protocolo</h2>
          <p>Ingresa los datos para estructurar y redactar el protocolo académico.</p>
        </div>
      </div>

      {/* Selector de estrategia / tipo de protocolo */}
      <div className="strategy-switcher">
        <span className="strategy-switcher-label">Tipo de protocolo</span>
        <div className="segmented-control" role="radiogroup" aria-label="Tipo de protocolo">
          {availableStrategies.map((strategy) => {
            const isActive = tipo === strategy.id;
            return (
              <label
                key={strategy.id}
                className={`segmented-option ${isActive ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="protocol-type"
                  value={strategy.id}
                  checked={isActive}
                  onChange={() => onTipoChange(strategy.id)}
                />
                {strategy.id === "individual" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                )}
                <span>{strategy.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Campo Asignatura */}
      <div className="field">
        <div className="field-header">
          <label htmlFor="input-materia" className="field-label">
            Asignatura o Materia
          </label>
        </div>
        <input
          id="input-materia"
          className="field-input"
          value={materia}
          onChange={(e) => onMateriaChange(e.target.value)}
          placeholder="Ej. Ingeniería de Software, Metodología..."
          autoComplete="off"
        />
      </div>

      {/* Campo Temas */}
      <div className="field">
        <div className="field-header">
          <label htmlFor="textarea-temas" className="field-label">
            Temas de Aprendizaje
          </label>
          {temasCount > 0 && (
            <span className="field-badge">{temasCount} {temasCount === 1 ? "tema" : "temas"}</span>
          )}
        </div>
        <textarea
          id="textarea-temas"
          className="field-textarea"
          value={temasTexto}
          onChange={(e) => onTemasTextoChange(e.target.value)}
          placeholder="Escribe los temas tratados (uno por línea o como texto corrido)..."
          rows={5}
        />
        <p className="field-hint">
          Puedes pegar viñetas o texto continuo; la IA estructurará cada unidad académica.
        </p>
      </div>

      {/* Instrucciones adicionales para la IA (opcional) */}
      <div className={`instructions-section ${instruccionesAbiertas ? "open" : ""}`}>
        <button
          type="button"
          className="instructions-toggle"
          onClick={() => setInstruccionesAbiertas((v) => !v)}
          aria-expanded={instruccionesAbiertas}
          aria-controls="instructions-body"
        >
          <svg className="instructions-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="field-label">Instrucciones adicionales</span>
          <span className="instructions-optional">Opcional</span>
          {tieneInstrucciones && !instruccionesAbiertas && (
            <span className="field-badge">Activas</span>
          )}
        </button>

        {instruccionesAbiertas && (
          <div id="instructions-body" className="instructions-body">
            <textarea
              id="textarea-instrucciones"
              className="field-textarea instructions-textarea"
              value={instruccionesAdicionales}
              onChange={(e) => onInstruccionesAdicionalesChange(e.target.value)}
              placeholder={
                "Ej. En Conclusiones usa un tono más crítico y menciona casos colombianos.\n" +
                "Ej. Los objetivos específicos deben ser 3 y enfocarse en seguridad."
              }
              rows={4}
              maxLength={MAX_USER_INSTRUCTIONS_LENGTH}
              disabled={loading}
              aria-describedby="instrucciones-hint"
            />
            <div className="instructions-footer">
              <p id="instrucciones-hint" className="field-hint">
                Ajusta cómo se redacta el texto o una sección concreta. Los encabezados y el formato de la plantilla se mantienen.
              </p>
              <div className="instructions-meta">
                <span className="instructions-counter">
                  {instruccionesAdicionales.length}/{MAX_USER_INSTRUCTIONS_LENGTH}
                </span>
                {tieneInstrucciones && !loading && (
                  <button
                    type="button"
                    className="instructions-clear"
                    onClick={() => onInstruccionesAdicionalesChange("")}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción principal */}
      <div className="actions-row">
        {loading ? (
          <div className="loading-actions-group">
            <button
              type="button"
              className="btn btn-primary btn-generating"
              disabled
            >
              <svg className="spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              <span>Redactando con IA...</span>
            </button>
            {onStop && (
              <button
                type="button"
                className="btn btn-stop"
                onClick={onStop}
                title="Detener la generación del protocolo"
                aria-label="Detener generación"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                <span>Detener</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onGenerate}
            disabled={!materia.trim()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
            </svg>
            <span>Generar protocolo</span>
          </button>
        )}
      </div>

      <p className="form-disclaimer-note">
        Agnes AI puede cometer errores. Es importante que revises la información generada.
      </p>
    </section>
  );
};

