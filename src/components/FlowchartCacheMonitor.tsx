'use client';

import React, { useState, useEffect } from 'react';
import FlowchartCacheManager from '@/lib/flowchartCache';

interface FlowchartCacheMonitorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

const FlowchartCacheMonitor: React.FC<FlowchartCacheMonitorProps> = ({
  position = 'bottom-left',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalEntries: 0,
    cacheSize: '0 Bytes',
    oldestEntry: null as Date | null,
    newestEntry: null as Date | null
  });

  const cacheManager = FlowchartCacheManager.getInstance();

  useEffect(() => {
    updateCacheStats();
  }, []);

  const updateCacheStats = () => {
    const stats = cacheManager.getCacheStats();
    setCacheStats(stats);
  };

  const handleClearCache = () => {
    if (confirm('Tem certeza que deseja limpar o cache de fluxogramas?')) {
      cacheManager.clear();
      updateCacheStats();
    }
  };

  const handleExportCache = () => {
    const cacheData = cacheManager.exportCache();
    const blob = new Blob([cacheData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowchart-cache-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCache = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const cacheData = e.target?.result as string;
          if (cacheManager.importCache(cacheData)) {
            updateCacheStats();
            alert('Cache importado com sucesso!');
          } else {
            alert('Erro ao importar cache');
          }
        } catch (error) {
          alert('Arquivo inválido');
        }
      };
      reader.readAsText(file);
    }
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            🎯 Cache Fluxogramas
            <span className="bg-purple-800 text-white px-2 py-0.5 rounded-full text-xs">
              {cacheStats.totalEntries}
            </span>
          </span>
          <span className="text-purple-200">
            {isExpanded ? '▼' : '▶'}
          </span>
        </button>

        {isExpanded && (
          <div className="p-4 space-y-4 max-w-xs">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total de Entradas:</span>
                <span className="font-medium">{cacheStats.totalEntries}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tamanho do Cache:</span>
                <span className="font-medium">{cacheStats.cacheSize}</span>
              </div>
              {cacheStats.oldestEntry && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mais Antigo:</span>
                  <span className="font-medium text-xs">
                    {cacheStats.oldestEntry.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {cacheStats.newestEntry && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mais Recente:</span>
                  <span className="font-medium text-xs">
                    {cacheStats.newestEntry.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <button
                onClick={updateCacheStats}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                🔄 Atualizar Stats
              </button>
              
              <button
                onClick={handleExportCache}
                className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                📤 Exportar Cache
              </button>
              
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportCache}
                  className="hidden"
                />
                <span className="block w-full px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors cursor-pointer text-center">
                  📥 Importar Cache
                </span>
              </label>
              
              <button
                onClick={handleClearCache}
                className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                🗑️ Limpar Cache
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                O cache armazena fluxogramas gerados para evitar regeneração.
                Fluxogramas são automaticamente removidos após 7 dias.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowchartCacheMonitor;
