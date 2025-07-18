'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, className = '' }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const renderCount = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!elementRef.current || !code) return;

      setIsLoading(true);
      setError(null);

      try {
        // Importar Mermaid dinamicamente
        const mermaid = await import('mermaid');
        
        // Configurar Mermaid com configurações otimizadas
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'base',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 20,
            nodeSpacing: 50,
            rankSpacing: 50,
            diagramPadding: 20,
            wrappingWidth: 200
          },
          themeVariables: {
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            background: '#ffffff',
            primaryColor: '#ffffff',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#374151',
            lineColor: '#6b7280',
            secondaryColor: '#f3f4f6',
            tertiaryColor: '#ffffff'
          },
          maxTextSize: 50000,
          maxEdges: 500,
          deterministicIds: true,
          securityLevel: 'loose'
        });

        // Limpar conteúdo anterior
        if (elementRef.current) {
          elementRef.current.innerHTML = '';
        }

        // Renderizar o diagrama
        const id = `mermaid-${Date.now()}-${renderCount.current++}`;
        const { svg } = await mermaid.default.render(id, code);
        
        if (elementRef.current) {
          elementRef.current.innerHTML = svg;
          
          // Adicionar responsividade ao SVG
          const svgElement = elementRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.display = 'block';
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao renderizar Mermaid:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setIsLoading(false);
        
        if (elementRef.current) {
          elementRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full">
              <div class="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 class="text-red-800 font-semibold mb-2 text-center">Erro ao renderizar fluxograma</h4>
                <p class="text-red-600 text-sm text-center mb-4">Não foi possível processar o diagrama Mermaid.</p>
                <details class="mt-2">
                  <summary class="text-red-700 cursor-pointer text-sm">Ver detalhes do erro</summary>
                  <pre class="text-xs text-red-500 mt-2 p-2 bg-red-100 rounded overflow-x-auto">${error}</pre>
                </details>
                <div class="mt-4 text-center">
                  <button 
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                    onclick="window.open('https://mermaid.live', '_blank')"
                  >
                    🔗 Abrir no Mermaid Live
                  </button>
                </div>
              </div>
            </div>
          `;
        }
      }
    };

    renderMermaid();
  }, [code]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600 mt-2">Renderizando fluxograma...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={elementRef}
        className="mermaid-container w-full h-full overflow-auto"
        style={{ 
          minHeight: '400px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      />
      
      {/* Controles de zoom (opcional) */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
        <button
          onClick={() => {
            const svg = elementRef.current?.querySelector('svg');
            if (svg) {
              const currentScale = svg.style.transform.match(/scale\(([^)]+)\)/)?.[1] || '1';
              const newScale = Math.min(parseFloat(currentScale) * 1.2, 3);
              svg.style.transform = `scale(${newScale})`;
            }
          }}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
          title="Zoom In"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <button
          onClick={() => {
            const svg = elementRef.current?.querySelector('svg');
            if (svg) {
              const currentScale = svg.style.transform.match(/scale\(([^)]+)\)/)?.[1] || '1';
              const newScale = Math.max(parseFloat(currentScale) * 0.8, 0.3);
              svg.style.transform = `scale(${newScale})`;
            }
          }}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
          title="Zoom Out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={() => {
            const svg = elementRef.current?.querySelector('svg');
            if (svg) {
              svg.style.transform = 'scale(1)';
            }
          }}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
          title="Reset Zoom"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MermaidRenderer;
