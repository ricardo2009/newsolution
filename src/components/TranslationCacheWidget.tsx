import React, { useState } from 'react';
import TranslationCacheMonitor from '@/components/TranslationCacheMonitor';

/**
 * 🎯 WIDGET COMPACTO DO CACHE DE TRADUÇÃO
 * 
 * Widget que pode ser usado em qualquer página para mostrar
 * informações básicas do cache de tradução.
 */
interface TranslationCacheWidgetProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function TranslationCacheWidget({
  className = '',
  position = 'bottom-right'
}: TranslationCacheWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {isExpanded ? (
        <div className="w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border">
          <div className="p-2 border-b flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Cache de Tradução</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <TranslationCacheMonitor 
              compact={true}
              showControls={false}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Monitorar Cache de Tradução"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
