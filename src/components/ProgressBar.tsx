'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  answered: number;
  correct: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, answered, correct }) => {
  const progressPercentage = (current / total) * 100;
  const answeredPercentage = (answered / total) * 100;
  const correctPercentage = total > 0 ? (correct / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            Questão {current} de {total}
          </span>
          <span className="text-sm text-gray-500">
            Respondidas: {answered}/{total}
          </span>
          <span className="text-sm text-green-600">
            Corretas: {correct}/{total} ({Math.round(correctPercentage)}%)
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Progresso: {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
        {/* Total Progress */}
        <div
          className="bg-blue-200 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Answered Progress */}
        <div
          className="absolute top-0 left-0 bg-blue-400 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${answeredPercentage}%` }}
        />
        
        {/* Correct Progress */}
        <div
          className="absolute top-0 left-0 bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${correctPercentage}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-2">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
          <span className="text-xs text-gray-600">Progresso</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span className="text-xs text-gray-600">Respondidas</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Corretas</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
