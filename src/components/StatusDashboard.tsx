'use client';

import { useState, useEffect } from 'react';

interface StatusData {
  timestamp: string;
  apiStatus: string;
  pdfParseStatus: string;
  nodeVersion: string;
  platform: string;
  issues: Array<{
    type: string;
    message: string;
    solution?: string;
    details?: string;
  }>;
  recommendations: string[];
}

const StatusDashboard = () => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/status');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Erro ao carregar status</h1>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchStatus}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Status do Sistema</h1>
        <p className="text-gray-600">Diagnóstico do simulador GH-200</p>
        <p className="text-sm text-gray-500 mt-2">
          Última atualização: {status ? new Date(status.timestamp).toLocaleString('pt-BR') : 'N/A'}
        </p>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">API Status</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            status?.apiStatus === 'OK' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status?.apiStatus === 'OK' ? '✅' : '❌'} {status?.apiStatus}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Parse</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            status?.pdfParseStatus === 'OK' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status?.pdfParseStatus === 'OK' ? '✅' : '❌'} {status?.pdfParseStatus}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ambiente</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Node:</strong> {status?.nodeVersion}</p>
            <p><strong>Platform:</strong> {status?.platform}</p>
          </div>
        </div>
      </div>

      {/* Problemas Identificados */}
      {status?.issues && status.issues.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🚨 Problemas Identificados
            </h2>
            <div className="space-y-4">
              {status.issues.map((issue, index) => (
                <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {issue.type}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium mb-2">{issue.message}</p>
                      {issue.details && (
                        <p className="text-sm text-gray-600 mb-2">{issue.details}</p>
                      )}
                      {issue.solution && (
                        <p className="text-sm text-green-700 font-medium">
                          💡 Solução: {issue.solution}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recomendações */}
      {status?.recommendations && status.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💡 Recomendações
            </h2>
            <ul className="space-y-3">
              {status.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Instruções de Uso */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          📋 Como Usar o Simulador
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Opção 1: Questões de Exemplo</h3>
            <p className="text-blue-600 text-sm">
              Clique em "Carregar Questões de Exemplo" na página principal para testar o simulador 
              com 8 questões sobre GitHub Actions.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Opção 2: PDF Não Protegido</h3>
            <p className="text-blue-600 text-sm">
              Use um arquivo PDF que não esteja protegido por senha ou DRM. O simulador pode extrair 
              questões de PDFs com texto legível.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDashboard;
