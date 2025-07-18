'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/types';
import { useTranslation } from '@/lib/useTranslation';
import MermaidArchitectureFlowchartNew from './MermaidArchitectureFlowchartNew';

interface QuestionCardProps {
  question: Question;
  selectedAnswers: string[];
  hasAnswered: boolean;
  showExplanation: boolean;
  onAnswerSelect: (answers: string[]) => void;
  onSubmitAnswer: () => void;
  onToggleFavorite?: (questionId: string) => void;
  isFavorite?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswers,
  hasAnswered,
  showExplanation,
  onAnswerSelect,
  onSubmitAnswer,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(question);
  const [showFlowchart, setShowFlowchart] = useState(false);
  const { 
    isTranslating, 
    translationError, 
    isTranslationEnabled, 
    translateQuestion, 
    getTranslatedQuestion,
    toggleTranslation,
    hasTranslation 
  } = useTranslation();

  useEffect(() => {
    setCurrentQuestion(getTranslatedQuestion(question));
  }, [question, getTranslatedQuestion]);

  const handleTranslate = async () => {
    if (!isTranslationEnabled) {
      toggleTranslation();
      if (!hasTranslation(question.id)) {
        await translateQuestion(question);
      }
    } else {
      toggleTranslation();
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
    onAnswerSelect(correctAnswers);
  };

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  const handleOptionClick = (optionLabel: string) => {
    if (hasAnswered || showAnswer) return;
    
    const isMultipleSelect = question.questionType === 'multiple-select' || question.multipleCorrectAnswers;
    
    if (isMultipleSelect) {
      // Para múltipla seleção, toggle a opção
      const newSelectedAnswers = selectedAnswers.includes(optionLabel)
        ? selectedAnswers.filter(answer => answer !== optionLabel)
        : [...selectedAnswers, optionLabel];
      onAnswerSelect(newSelectedAnswers);
    } else {
      // Para seleção única, substitui a seleção
      onAnswerSelect([optionLabel]);
    }
  };

  const getOptionClass = (optionIndex: number): string => {
    const optionLabel = getOptionLabel(optionIndex);
    const isSelected = selectedAnswers.includes(optionLabel);
    const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
    const isCorrect = correctAnswers.includes(optionLabel);
    
    if (!hasAnswered && !showAnswer) {
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

  // Detectar se é questão de múltipla seleção
  const isMultipleSelect = question.questionType === 'multiple-select' || question.multipleCorrectAnswers;
  const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];

  const isCorrectAnswer = () => {
    if (selectedAnswers.length === 0) return false;
    
    if (isMultipleSelect) {
      // Para múltipla seleção, deve ter todas as respostas corretas e nenhuma incorreta
      return selectedAnswers.length === correctAnswers.length && 
             selectedAnswers.every(answer => correctAnswers.includes(answer));
    } else {
      // Para seleção única, deve ter a resposta correta
      return selectedAnswers.length === 1 && correctAnswers.includes(selectedAnswers[0]);
    }
  };

  const renderQuestionImage = () => {
    if (!question.imageUrl && !question.visualContent) return null;
    
    const imageUrl = question.imageUrl || question.visualContent?.url;
    const altText = question.visualContent?.alt || 'Question image';
    const caption = question.visualContent?.caption;
    
    if (!imageUrl) return null;
    
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={altText}
            className="w-full max-w-2xl mx-auto h-auto rounded-lg shadow-md"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
          {question.visualContent?.annotations && (
            <div className="absolute inset-0">
              {question.visualContent.annotations.map((annotation, index) => (
                <div
                  key={index}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-semibold ${
                    annotation.type === 'info' ? 'bg-blue-500 text-white' :
                    annotation.type === 'warning' ? 'bg-yellow-500 text-white' :
                    annotation.type === 'success' ? 'bg-green-500 text-white' :
                    'bg-red-500 text-white'
                  }`}
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                  }}
                >
                  {annotation.text}
                </div>
              ))}
            </div>
          )}
        </div>
        {caption && (
          <p className="text-sm text-gray-600 mt-2 text-center italic">
            {caption}
          </p>
        )}
      </div>
    );
  };

  const renderImagePreview = () => {
    if (!question.imageUrl && !question.visualContent) return null;
    
    const imageUrl = question.imageUrl || question.visualContent?.url;
    if (!imageUrl) return null;
    
    return (
      <div className="mb-4">
        <button
          onClick={() => window.open(imageUrl, '_blank')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Ver imagem em tamanho completo
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-500 fade-in">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {currentQuestion.category}
          </span>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {currentQuestion.difficulty === 'beginner' ? 'Iniciante' : 
             currentQuestion.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
          </span>
          {isMultipleSelect && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Múltipla Seleção
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Translation Button */}
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isTranslationEnabled 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isTranslating ? '🔄' : isTranslationEnabled ? '🇧🇷' : '🇺🇸'}
          </button>
          
          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(question.id)}
              className={`p-2 rounded-lg ${
                isFavorite ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      </div>

      {/* Translation Error */}
      {translationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            ⚠️ Erro na tradução: {translationError}
          </p>
        </div>
      )}

      {/* Question Text */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 leading-relaxed">
          {currentQuestion.questionText}
        </h2>
        
        {/* Question Image */}
        {renderQuestionImage()}
        
        {/* Image Preview Button */}
        {renderImagePreview()}
        
        {/* Multiple Selection Instructions */}
        {isMultipleSelect && !hasAnswered && !showAnswer && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-700 text-sm">
              💡 Esta questão permite múltiplas respostas. Selecione todas as opções corretas e clique em &quot;Confirmar Resposta&quot;.
            </p>
          </div>
        )}

        {/* Code Example */}
        {currentQuestion.codeExample && (
          <div className="mb-4 p-4 bg-gray-900 rounded-lg overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{currentQuestion.codeExample}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(getOptionLabel(index))}
            disabled={hasAnswered || showAnswer}
            className={getOptionClass(index)}
          >
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                {getOptionLabel(index)}
              </span>
              <span className="flex-1 text-left">{option}</span>
              {selectedAnswers.includes(getOptionLabel(index)) && (
                <span className="text-blue-500">✓</span>
              )}
              {hasAnswered && selectedAnswers.includes(getOptionLabel(index)) && (() => {
                const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
                return !correctAnswers.includes(getOptionLabel(index));
              })() && (
                <span className="text-red-500">✗</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      {!hasAnswered && !showAnswer && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={onSubmitAnswer}
            disabled={selectedAnswers.length === 0}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedAnswers.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Confirmar Resposta
          </button>
          <button
            onClick={handleRevealAnswer}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Revelar Resposta
          </button>
        </div>
      )}

      {/* Explanation Section */}
      {showExplanation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            {showAnswer ? (
              <span className="text-blue-600">💡 Resposta Revelada</span>
            ) : isCorrectAnswer() ? (
              <span className="text-green-600">✓ Correto!</span>
            ) : (
              <span className="text-red-600">✗ Incorreto</span>
            )}
          </h3>
          <p className="text-gray-700 mb-4">{currentQuestion.explanation}</p>
          
          {currentQuestion.relatedTopics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tópicos Relacionados:</h4>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.relatedTopics.map((topic, index) => (
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
      {(hasAnswered || showAnswer) && (
        <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {showAnswer ? 'Resposta revelada' : 'Sua resposta'}: <strong>{selectedAnswers.join(', ')}</strong>
            </span>
            <span className="text-sm text-gray-600">
              Resposta correta: <strong>{correctAnswers.join(', ')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Mermaid Architecture Flowchart */}
      {showFlowchart && selectedAnswers.length > 0 && (
        <div className="mt-6">
          <MermaidArchitectureFlowchartNew
            question={currentQuestion}
            userAnswers={selectedAnswers}
            isCorrect={isCorrectAnswer()}
            onComplete={() => console.log('Fluxograma concluído')}
          />
        </div>
      )}

      {/* Flowchart Toggle Button */}
      {(hasAnswered || showAnswer) && selectedAnswers.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowFlowchart(!showFlowchart)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center gap-2"
          >
            {showFlowchart ? '🔼' : '🔽'}
            {showFlowchart ? 'Ocultar' : 'Ver'} Fluxograma Arquitetural
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
