'use client';

import React from 'react';

interface NavigationControlsProps {
  currentIndex: number;
  totalQuestions: number;
  hasAnswered: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentIndex,
  totalQuestions,
  hasAnswered,
  onPrevious,
  onNext,
  onFinish,
}) => {
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isFirstQuestion
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        ← Anterior
      </button>

      {/* Question Counter */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Questão {currentIndex + 1} de {totalQuestions}
        </span>
        
        {/* Question Navigation Dots */}
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(totalQuestions, 10) }, (_, i) => {
            const questionIndex = i < 5 ? i : Math.max(0, totalQuestions - 10 + i);
            const isActive = questionIndex === currentIndex;
            const isAnswered = false; // Você pode implementar lógica para verificar se foi respondida
            
            return (
              <div
                key={questionIndex}
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-blue-500' :
                  isAnswered ? 'bg-green-500' :
                  'bg-gray-300'
                }`}
              />
            );
          })}
          {totalQuestions > 10 && (
            <span className="text-xs text-gray-400 ml-1">...</span>
          )}
        </div>
      </div>

      {/* Next/Finish Button */}
      {isLastQuestion ? (
        <button
          onClick={onFinish}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Finalizar Exame
        </button>
      ) : (
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Próxima →
        </button>
      )}
    </div>
  );
};

export default NavigationControls;
