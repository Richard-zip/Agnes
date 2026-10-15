import React, { useEffect, useRef, useState, useCallback } from "react";
import { Protocol } from "../../core/entities/protocol.entity";
import { IDocumentExporter } from "../../core/interfaces/document-exporter.interface";

interface DocxPreviewProps {
  protocol: Protocol;
  documentExporter: IDocumentExporter;
  materia?: string;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onExportWord?: () => void;
  onExportPdf?: () => void;
  exportingWord?: boolean;
  exportingPdf?: boolean;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const DocxPreview: React.FC<DocxPreviewProps> = ({
  protocol,
  documentExporter,
  materia,
  isExpanded: controlledExpanded,
  onToggleExpanded: controlledToggleExpanded,
  onExportWord,
  onExportPdf,
  exportingWord,
  exportingPdf,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>("Iniciando...");
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(100);
  const [internalExpanded, setInternalExpanded] = useState<boolean>(false);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggleExpanded = useCallback(() => {
    if (controlledToggleExpanded) {
      controlledToggleExpanded();
    } else {
      setInternalExpanded((v) => !v);
    }
  }, [controlledToggleExpanded]);

  const handleZoomIn = () => setZoom((prev) => Math.min(150, prev + 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(50, prev - 10));
  const handleZoomReset = () => setZoom(100);

  const handleFitWidth = useCallback(() => {
    if (!scrollAreaRef.current) return;
    const availableWidth = scrollAreaRef.current.clientWidth - 56;
    const sheetBaseWidth = 816; // 8.5in estándar a 96 DPI
    if (availableWidth > 0) {
      const calculated = Math.min(150, Math.max(50, Math.floor((availableWidth / sheetBaseWidth) * 100)));
      setZoom(calculated);
    } else {
      setZoom(100);
    }
  }, []);

  const handleToggleExpanded = () => {
    toggleExpanded();
  };

  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        handleFitWidth();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, handleFitWidth]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleExpanded();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, toggleExpanded]);

  const renderWithLibreOffice = useCallback(
    async (docxBlob: Blob): Promise<boolean> => {
      if (!window.electronAPI?.renderProtocolPages) {
        return false;
      }

      setLoadingStep("Generando y estructurando vista previa del documento...");
      const docxBase64 = await blobToBase64(docxBlob);

      const result = await window.electronAPI.renderProtocolPages({ docxBase64 });
      if (!result.success) {
        console.warn("[DocxPreview] No se pudo renderizar la vista previa:", result.error);
        return false;
      }

      // 1. Si pdftoppm generó imágenes de página directamente
      if (result.pageImages && result.pageImages.length > 0) {
        setPages(result.pageImages);
        return true;
      }

      // 2. Fallback con pdfjs-dist si solo se recibió pdfBase64
      if (result.pdfBase64) {
        setLoadingStep("Rasterizando páginas de alta fidelidad...");
        try {
          const pdfjsLib = await import("pdfjs-dist");
          const binaryString = atob(result.pdfBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const loadingTask = pdfjsLib.getDocument({ data: bytes });
          const pdfDoc = await loadingTask.promise;
          const renderedPages: string[] = [];

          for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.75 }); // Alta resolución
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              await page.render({ canvasContext: ctx, viewport }).promise;
              renderedPages.push(canvas.toDataURL("image/png"));
            }
          }

          if (renderedPages.length > 0) {
            setPages(renderedPages);
            return true;
          }
        } catch (pdfErr) {
          console.warn("[DocxPreview] Fallback pdfjs-dist falló:", pdfErr);
        }
      }

      return false;
    },
    []
  );

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setLoadingStep("Preparando documento institucional...");
      const exportFile = await documentExporter.exportDocument(protocol);

      const success = await renderWithLibreOffice(exportFile.blob);
      if (!success) {
        throw new Error(
          "No se pudo compilar la vista previa de las páginas del protocolo. Por favor haz clic en reintentar."
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`No se pudo generar la vista previa: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [protocol, documentExporter, renderWithLibreOffice]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument, retryKey]);

  return (
    <div className={`docx-preview-root ${isExpanded ? "is-expanded" : ""}`}>
      {!loading && !error && (
        <div className="docx-preview-toolbar" role="toolbar" aria-label="Controles de vista previa">
          <div className="docx-preview-toolbar-left">
            <div className="docx-preview-badge-status">
              <span className="docx-pages-pill">
                {pages.length} {pages.length === 1 ? "página" : "páginas"}
              </span>
              {isExpanded && materia && (
                <span className="docx-expanded-materia-title" title={materia}>
                  {materia}
                </span>
              )}
            </div>
          </div>

          <div className="docx-preview-zoom-controls">
            <button
              type="button"
              className="docx-zoom-btn"
              onClick={handleZoomOut}
              title="Reducir zoom"
              aria-label="Reducir zoom"
              disabled={zoom <= 50}
            >
              −
            </button>
            <span
              className="docx-zoom-level"
              onClick={handleZoomReset}
              title="Restablecer zoom al 100%"
            >
              {zoom}%
            </span>
            <button
              type="button"
              className="docx-zoom-btn"
              onClick={handleZoomIn}
              title="Aumentar zoom"
              aria-label="Aumentar zoom"
              disabled={zoom >= 150}
            >
              +
            </button>
            <button
              type="button"
              className="docx-zoom-fit-btn"
              onClick={handleFitWidth}
              title="Ajustar ancho del documento a la pantalla"
            >
              Ajustar
            </button>

            <button
              type="button"
              className={`docx-zoom-fit-btn docx-expand-btn ${isExpanded ? "active" : ""}`}
              onClick={handleToggleExpanded}
              title={isExpanded ? "Salir de vista ampliada (Esc)" : "Ver protocolo en vista ampliada completa (Esc para salir)"}
              aria-label={isExpanded ? "Salir de vista ampliada" : "Ver protocolo en vista ampliada"}
            >
              {isExpanded ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span>Cerrar (Esc)</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                  <span>Vista ampliada</span>
                </>
              )}
            </button>

            {isExpanded && onExportWord && (
              <button
                type="button"
                className="download-word-btn docx-expanded-dl-btn"
                onClick={onExportWord}
                disabled={exportingWord || exportingPdf}
                title="Descargar documento Word (.docx)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6" />
                  <path d="m9 15 3 3 3-3" />
                </svg>
                <span>Word</span>
              </button>
            )}

            {isExpanded && onExportPdf && (
              <button
                type="button"
                className="download-pdf-btn docx-expanded-dl-btn"
                onClick={onExportPdf}
                disabled={exportingWord || exportingPdf}
                title="Descargar documento PDF (.pdf)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M10 12h4" />
                  <path d="M12 18v-6" />
                  <path d="m9 15 3 3 3-3" />
                </svg>
                <span>PDF</span>
              </button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="docx-preview-loading" role="status">
          <svg className="spinner-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5">
            <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
            <path d="M12 3a9 9 0 0 1 9 9" />
          </svg>
          <div className="docx-preview-loading-text">
            <span>{loadingStep}</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="docx-preview-error">
          <p>{error}</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setRetryKey((k) => k + 1)}
          >
            Reintentar visualización
          </button>
        </div>
      )}

      {/* Contenedor de visualización de páginas oficiales */}
      <div
        ref={scrollAreaRef}
        className={`docx-preview-viewport ${loading ? "is-loading" : ""}`}
        style={{
          "--docx-zoom": `${zoom / 100}`,
          "--sheet-zoom": `${zoom / 100}`,
        } as React.CSSProperties}
      >
        {pages.length > 0 && !loading && (
          <div className="protocol-pages-flow">
            {pages.map((pageSrc, pageIdx) => (
              <div
                key={pageIdx}
                className="protocol-paper-sheet"
                data-page-index={pageIdx + 1}
              >
                <div className="protocol-paper-sheet-badge">
                  <span className="protocol-sheet-page-label">
                    Página {pageIdx + 1} de {pages.length}
                  </span>
                  <span className="protocol-sheet-doc-type">Formato Carta • Oficial</span>
                </div>
                <img
                  src={pageSrc}
                  alt={`Página ${pageIdx + 1} del protocolo oficial`}
                  className="protocol-sheet-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


