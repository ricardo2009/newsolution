'use client';

import { useState } from 'react';
import { ParsedExamData } from '@/types';

interface SampleQuestionsLoaderProps {
  onQuestionsLoaded: (data: ParsedExamData) => void;
}

const SampleQuestionsLoader: React.FC<SampleQuestionsLoaderProps> = ({ onQuestionsLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSampleQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sample-questions');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar questões de exemplo');
      }

      const data: ParsedExamData = await response.json();
      onQuestionsLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🎯 Questões de Exemplo
        </h3>
        <p className="text-gray-600 mb-4">
          Experimente o simulador com questões de exemplo sobre GitHub Actions
        </p>
        
        <button
          onClick={loadSampleQuestions}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Carregando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Carregar Questões de Exemplo
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          <p>📚 8 questões sobre tópicos essenciais</p>
          <p>🎓 Níveis: Iniciante e Intermediário</p>
          <p>💡 Inclui explicações detalhadas e exemplos de código</p>
        </div>
      </div>
    </div>
  );
};

export default SampleQuestionsLoader;
