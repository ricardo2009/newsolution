'use client';

import React from 'react';

interface StatsData {
  overall: {
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    score: number;
    totalTime: number;
    avgTimePerQuestion: number;
  };
  byCategory: Record<string, { correct: number; total: number }>;
  byDifficulty: Record<string, { correct: number; total: number }>;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
}

interface StatsPanelProps {
  stats: StatsData;
  onRestart: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, onRestart }) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (start: Date, end?: Date): string => {
    if (!end) return 'Em andamento';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return formatTime(duration);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return 'Excelente! Você está muito bem preparado!';
    if (score >= 80) return 'Muito bom! Continue estudando os tópicos com dificuldade.';
    if (score >= 70) return 'Bom progresso! Revise os conceitos principais.';
    if (score >= 60) return 'Você está no caminho certo! Estude mais os tópicos em vermelho.';
    return 'Continue estudando! Foque nos fundamentos do GitHub Actions.';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Resultados do Exame
        </h1>
        <p className="text-gray-600">
          {stats.isCompleted ? 'Exame concluído!' : 'Estatísticas atuais'}
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border-l-4 border-blue-500">
        <div className="text-center">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(stats.overall.score)}`}>
            {stats.overall.score}%
          </div>
          <div className="text-lg text-gray-600 mb-4">
            {stats.overall.correctAnswers} de {stats.overall.totalQuestions} corretas
          </div>
          <div className="text-gray-700 font-medium">
            {getScoreMessage(stats.overall.score)}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">
            {stats.overall.answeredQuestions}
          </div>
          <div className="text-sm text-gray-600">Respondidas</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">
            {stats.overall.correctAnswers}
          </div>
          <div className="text-sm text-gray-600">Corretas</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">
            {formatDuration(stats.startTime, stats.endTime)}
          </div>
          <div className="text-sm text-gray-600">Tempo Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-orange-500">
          <div className="text-2xl font-bold text-orange-600">
            {formatTime(stats.overall.avgTimePerQuestion)}
          </div>
          <div className="text-sm text-gray-600">Média/Questão</div>
        </div>
      </div>

      {/* Performance by Category */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Desempenho por Categoria
        </h2>
        <div className="space-y-3">
          {Object.entries(stats.byCategory).map(([category, data]) => {
            const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
            return (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-sm text-gray-600">
                    {data.correct}/{data.total} ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-green-500' :
                      percentage >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance by Difficulty */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Desempenho por Dificuldade
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.byDifficulty).map(([difficulty, data]) => {
            const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
            const difficultyLabels = {
              beginner: 'Iniciante',
              intermediate: 'Intermediário',
              advanced: 'Avançado'
            };
            
            return (
              <div key={difficulty} className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    difficulty === 'beginner' ? 'text-green-600' :
                    difficulty === 'intermediate' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {Math.round(percentage)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {difficultyLabels[difficulty as keyof typeof difficultyLabels]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.correct}/{data.total} corretas
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          Recomendações de Estudo
        </h2>
        <div className="space-y-2">
          {Object.entries(stats.byCategory).map(([category, data]) => {
            const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
            if (percentage < 70) {
              return (
                <div key={category} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Revise <strong>{category}</strong> - {Math.round(percentage)}% de acerto
                  </span>
                </div>
              );
            }
            return null;
          })}
          {Object.entries(stats.byCategory).every(([_, data]) => 
            data.total > 0 ? (data.correct / data.total) * 100 >= 70 : true
          ) && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                Parabéns! Você está bem preparado em todas as categorias!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRestart}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Fazer Novo Exame
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Imprimir Resultados
        </button>
      </div>
    </div>
  );
};

export default StatsPanel;
