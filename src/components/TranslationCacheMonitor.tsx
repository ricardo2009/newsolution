import React, { useState, useEffect } from 'react';
import { useTranslationCache } from '@/lib/useTranslationCache';
import { CacheMetrics } from '@/types';

/**
 * 📊 PAINEL DE MONITORAMENTO DO CACHE DE TRADUÇÃO
 * 
 * Exibe métricas em tempo real, estatísticas de economia e controles
 * para gerenciar o cache de tradução inteligente.
 */
interface TranslationCacheMonitorProps {
  className?: string;
  showControls?: boolean;
  compact?: boolean;
}

export default function TranslationCacheMonitor({
  className = '',
  showControls = true,
  compact = false
}: TranslationCacheMonitorProps) {
  const {
    metrics,
    generateSavingsReport,
    cleanupExpiredCache,
    updateCacheConfiguration,
    clearAllCache,
    isLoading
  } = useTranslationCache();

  const [savingsReport, setSavingsReport] = useState<any>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);

  // Atualizar relatório de economia
  useEffect(() => {
    const report = generateSavingsReport();
    setSavingsReport(report);
  }, [metrics, generateSavingsReport]);

  // Limpeza automática do cache
  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      await cleanupExpiredCache();
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Limpar cache completo
  const handleClearAll = async () => {
    if (confirm('Tem certeza que deseja limpar todo o cache de tradução? Esta ação não pode ser desfeita.')) {
      await clearAllCache();
    }
  };

  // Componente compacto para uso em dashboards
  if (compact) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm border ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Cache de Tradução</h3>
            <p className="text-xs text-gray-500">
              {metrics.hitRate ? `${(metrics.hitRate * 100).toFixed(1)}% hit rate` : 'Inicializando...'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              metrics.cacheHealth === 'excellent' ? 'bg-green-500' :
              metrics.cacheHealth === 'good' ? 'bg-yellow-500' :
              metrics.cacheHealth === 'poor' ? 'bg-orange-500' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-gray-600">
              {savingsReport?.totalSavings ? `$${savingsReport.totalSavings} economizados` : ''}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            📊 Monitor de Cache de Tradução
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              metrics.cacheHealth === 'excellent' ? 'bg-green-500' :
              metrics.cacheHealth === 'good' ? 'bg-yellow-500' :
              metrics.cacheHealth === 'poor' ? 'bg-orange-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600 capitalize">
              {metrics.cacheHealth === 'excellent' ? 'Excelente' :
               metrics.cacheHealth === 'good' ? 'Bom' :
               metrics.cacheHealth === 'poor' ? 'Ruim' :
               'Crítico'}
            </span>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Entradas no Cache</p>
                <p className="text-lg font-semibold text-blue-600">{metrics.totalEntries}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Taxa de Acerto</p>
                <p className="text-lg font-semibold text-green-600">
                  {metrics.hitRate ? `${(metrics.hitRate * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Tempo Médio</p>
                <p className="text-lg font-semibold text-purple-600">
                  {metrics.averageRetrievalTime.toFixed(0)}ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Economia Total</p>
                <p className="text-lg font-semibold text-yellow-600">
                  ${savingsReport?.totalSavings || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Distribuição por Camadas */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Distribuição por Camadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Memória</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.layerDistribution.memory}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${metrics.totalEntries > 0 ? (metrics.layerDistribution.memory / metrics.totalEntries) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">localStorage</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.layerDistribution.localStorage}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${metrics.totalEntries > 0 ? (metrics.layerDistribution.localStorage / metrics.totalEntries) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">IndexedDB</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.layerDistribution.indexedDB}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${metrics.totalEntries > 0 ? (metrics.layerDistribution.indexedDB / metrics.totalEntries) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Relatório de Economia */}
        {savingsReport && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              💰 Relatório de Economia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Traduções Economizadas</p>
                <p className="text-lg font-semibold text-green-600">
                  {savingsReport.translationsSaved}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Economia Total</p>
                <p className="text-lg font-semibold text-green-600">
                  ${savingsReport.totalSavings}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tempo Médio</p>
                <p className="text-lg font-semibold text-blue-600">
                  {savingsReport.averageResponseTime}ms
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Projeção Mensal</p>
                <p className="text-lg font-semibold text-purple-600">
                  ${savingsReport.estimatedMonthlySavings}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controles */}
        {showControls && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCleanup}
              disabled={isCleaningUp}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isCleaningUp ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Limpando...
                </>
              ) : (
                <>
                  🧹 Limpar Cache Expirado
                </>
              )}
            </button>

            <button
              onClick={() => setShowConfiguration(!showConfiguration)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ⚙️ Configurações
            </button>

            <button
              onClick={handleClearAll}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              🗑️ Limpar Tudo
            </button>
          </div>
        )}

        {/* Painel de Configurações */}
        {showConfiguration && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Configurações do Cache
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Max Entradas na Memória
                </label>
                <input
                  type="number"
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={1000}
                  min={100}
                  max={10000}
                  onChange={(e) => {
                    updateCacheConfiguration({
                      maxMemoryEntries: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Expiração (dias)
                </label>
                <input
                  type="number"
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={30}
                  min={1}
                  max={365}
                  onChange={(e) => {
                    updateCacheConfiguration({
                      defaultExpiration: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
