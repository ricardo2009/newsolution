'use client';

import React from 'react';
import { ExamSession } from '@/types';

interface ResultsExportProps {
  session: ExamSession;
  onExport: (format: 'json' | 'csv' | 'pdf') => void;
}

const ResultsExport: React.FC<ResultsExportProps> = ({ session, onExport }) => {
  const { userProgress, questions } = session;
  const { score, totalQuestions, timeSpent: timeElapsed, results } = userProgress;
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Calcular estatísticas por categoria
  const categoryStats = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = { total: 0, correct: 0 };
    }
    acc[question.category].total++;
    
    const result = results.find(r => r.questionId === question.id);
    if (result && result.isCorrect) {
      acc[question.category].correct++;
    }
    
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    onExport(format);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Exportar Resultados</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 space-y-1">
          <div>Pontuação: {score}/{totalQuestions} ({percentage}%)</div>
          <div>Tempo: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
          <div>Categorias: {Object.keys(categoryStats).length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => handleExport('json')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          📄 JSON
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
        >
          📊 CSV
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
        >
          📋 PDF
        </button>
      </div>
    </div>
  );
};

export default ResultsExport;
