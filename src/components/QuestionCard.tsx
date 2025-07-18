'use client';

import React from 'react';
import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  hasAnswered: boolean;
  showExplanation: boolean;
  onAnswerSelect: (answer: string) => void;
  onToggleFavorite?: (questionId: string) => void;
  isFavorite?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  hasAnswered,
  showExplanation,
  onAnswerSelect,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  const getOptionClass = (optionIndex: number): string => {
    const optionLabel = getOptionLabel(optionIndex);
    const isSelected = selectedAnswer === optionLabel;
    const isCorrect = question.correctAnswer === optionLabel;
    
    if (!hasAnswered) {
      return `w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 ${
        isSelected ? 'border-blue-500 bg-blue-100' : ''
      }`;
    }
    
    if (isCorrect) {
      return 'w-full text-left p-4 rounded-lg border-2 border-green-500 bg-green-100';
    }
    
    if (isSelected && !isCorrect) {
      return 'w-full text-left p-4 rounded-lg border-2 border-red-500 bg-red-100';
    }
    
    return 'w-full text-left p-4 rounded-lg border-2 border-gray-200 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-500 fade-in">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {question.category}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            question.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty === 'beginner' ? 'Iniciante' :
             question.difficulty === 'intermediate' ? 'Intermediário' :
             'Avançado'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(question.id)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          )}
          <div className="text-sm text-gray-500">
            ID: {question.id}
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {question.questionText}
        </h2>
      </div>

      {/* Code Example (if exists) */}
      {question.codeExample && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Exemplo de Código:</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <code>{question.codeExample}</code>
          </pre>
        </div>
      )}

      {/* Options */}
      {question.options && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Opções:</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !hasAnswered && onAnswerSelect(getOptionLabel(index))}
                disabled={hasAnswered}
                className={getOptionClass(index)}
              >
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {getOptionLabel(index)}
                  </span>
                  <span className="flex-1 text-left">{option}</span>
                  {hasAnswered && question.correctAnswer === getOptionLabel(index) && (
                    <span className="flex-shrink-0 text-green-600">
                      ✓
                    </span>
                  )}
                  {hasAnswered && selectedAnswer === getOptionLabel(index) && selectedAnswer !== question.correctAnswer && (
                    <span className="flex-shrink-0 text-red-600">
                      ✗
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            {hasAnswered && selectedAnswer === question.correctAnswer ? (
              <span className="text-green-600">✓ Correto!</span>
            ) : (
              <span className="text-red-600">✗ Incorreto</span>
            )}
          </h3>
          <p className="text-gray-700 mb-4">{question.explanation}</p>
          
          {question.relatedTopics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tópicos Relacionados:</h4>
              <div className="flex flex-wrap gap-2">
                {question.relatedTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Answer Status */}
      {hasAnswered && (
        <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Sua resposta: <strong>{selectedAnswer}</strong>
            </span>
            <span className="text-sm text-gray-600">
              Resposta correta: <strong>{question.correctAnswer}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
