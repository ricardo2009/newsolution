'use client';

import React, { useState, useEffect } from 'react';
import { Question, MemorizationData, UserProfile } from '@/types';
import AdvancedMemorization from '@/lib/advancedMemorization';

interface SmartQuestionSystemProps {
  questions: Question[];
  memorization: MemorizationData[];
  userProfile: UserProfile;
  onQuestionAnswered: (questionId: string, isCorrect: boolean, confidence: 'low' | 'medium' | 'high', responseTime: number) => void;
  onMemorizationUpdate: (data: MemorizationData) => void;
}

const SmartQuestionSystem: React.FC<SmartQuestionSystemProps> = ({
  questions,
  memorization,
  userProfile,
  onQuestionAnswered,
  onMemorizationUpdate
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [startTime, setStartTime] = useState<number>(0);
  const [memoryStrength, setMemoryStrength] = useState<any>(null);

  const advancedMemorization = AdvancedMemorization.getInstance();

  useEffect(() => {
    selectNextQuestion();
  }, [memorization, questions]);

  const selectNextQuestion = () => {
    if (questions.length === 0) return;

    // Primeiro, questões que precisam de revisão
    const questionsForReview = advancedMemorization.getQuestionsForReview(memorization);
    
    if (questionsForReview.length > 0) {
      const questionId = questionsForReview[0];
      const question = questions.find(q => q.id === questionId);
      if (question) {
        setCurrentQuestion(question);
        setStartTime(Date.now());
        updateMemoryStrength(question.id);
        return;
      }
    }

    // Senão, questões novas ou com baixa retenção
    const weakQuestions = memorization
      .filter(m => m.retentionLevel === 'weak' || m.retentionLevel === 'medium')
      .sort((a, b) => a.correctCount / a.attempts - b.correctCount / b.attempts);

    if (weakQuestions.length > 0) {
      const questionId = weakQuestions[0].questionId;
      const question = questions.find(q => q.id === questionId);
      if (question) {
        setCurrentQuestion(question);
        setStartTime(Date.now());
        updateMemoryStrength(question.id);
        return;
      }
    }

    // Senão, questões aleatórias
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setStartTime(Date.now());
    updateMemoryStrength(randomQuestion.id);
  };

  const updateMemoryStrength = (questionId: string) => {
    const memData = memorization.find(m => m.questionId === questionId);
    if (memData) {
      const strength = advancedMemorization.calculateMemoryStrength(memData);
      setMemoryStrength(strength);
    } else {
      setMemoryStrength(null);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const responseTime = (Date.now() - startTime) / 1000; // em segundos
    const correctAnswer = currentQuestion.correctAnswer;
    const isCorrect = selectedAnswer === correctAnswer;

    setHasAnswered(true);
    setShowExplanation(true);

    // Atualizar dados de memorização
    const existingData = memorization.find(m => m.questionId === currentQuestion.id);
    const responseQuality = isCorrect ? 
      (confidence === 'high' ? 5 : confidence === 'medium' ? 4 : 3) : 
      (confidence === 'high' ? 2 : confidence === 'medium' ? 1 : 0);

    // Calcular novo intervalo usando SuperMemo
    const superMemoResult = advancedMemorization.calculateSuperMemoInterval(
      existingData || {
        questionId: currentQuestion.id,
        attempts: 0,
        correctCount: 0,
        lastAttempt: new Date(),
        nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 dia
        difficultyMultiplier: 1.0,
        retentionLevel: 'weak' as const,
        confidenceHistory: [],
        interval: 1,
        easeFactor: 2.5,
        stability: 0,
        retrievability: 0
      },
      responseQuality
    );

    const finalData = {
      ...(existingData || {
        questionId: currentQuestion.id,
        attempts: 0,
        correctCount: 0,
        lastAttempt: new Date(),
        nextReviewDate: new Date(),
        difficultyMultiplier: 1.0,
        retentionLevel: 'weak' as const,
        confidenceHistory: []
      }),
      easeFactor: superMemoResult.easeFactor,
      interval: superMemoResult.interval,
      stability: superMemoResult.stability,
      nextReviewDate: new Date(Date.now() + superMemoResult.interval * 24 * 60 * 60 * 1000),
      correctCount: isCorrect ? (existingData?.correctCount || 0) + 1 : (existingData?.correctCount || 0),
      attempts: (existingData?.attempts || 0) + 1,
      lastAttempt: new Date(),
      confidenceHistory: [...(existingData?.confidenceHistory || []), confidence]
    };

    onMemorizationUpdate(finalData);
    onQuestionAnswered(currentQuestion.id, isCorrect, confidence, responseTime);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setHasAnswered(false);
    setConfidence('medium');
    setMemoryStrength(null);
    selectNextQuestion();
  };

  const renderMemoryStrength = () => {
    if (!memoryStrength) return null;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200 mb-4">
        <h3 className="text-sm font-semibold text-purple-800 mb-2">🧠 Força da Memória</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-600">Recordação</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${memoryStrength.recall * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{Math.round(memoryStrength.recall * 100)}%</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-600">Estabilidade</div>
            <div className="text-sm font-semibold">{Math.round(memoryStrength.stability)} dias</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-600">Dificuldade</div>
            <div className="text-sm font-semibold">{Math.round(memoryStrength.difficulty)}/10</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-600">Recuperação</div>
            <div className="text-sm font-semibold">{Math.round(memoryStrength.retrievability * 100)}%</div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfidenceSelector = () => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Como você se sente sobre esta resposta?</h3>
        <div className="flex space-x-2">
          {[
            { value: 'low', label: 'Incerto', color: 'red', icon: '😰' },
            { value: 'medium', label: 'Moderado', color: 'yellow', icon: '😐' },
            { value: 'high', label: 'Confiante', color: 'green', icon: '😊' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setConfidence(option.value as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                confidence === option.value 
                  ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700` 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{option.icon}</span>
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-600">Carregando próxima questão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderMemoryStrength()}
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {currentQuestion.category}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              {currentQuestion.difficulty}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            ID: {currentQuestion.id}
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {currentQuestion.questionText}
        </h2>

        <div className="space-y-3 mb-6">
          {currentQuestion.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => !hasAnswered && setSelectedAnswer(option)}
              disabled={hasAnswered}
              className={`w-full p-4 text-left rounded-lg border transition-all ${
                hasAnswered
                  ? option === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : option === selectedAnswer
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : 'border-gray-300 bg-gray-50 text-gray-700'
                  : selectedAnswer === option
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {!hasAnswered && selectedAnswer && renderConfidenceSelector()}

        {showExplanation && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Explicação</h3>
            <p className="text-blue-700">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>⏱️ {Math.round((Date.now() - startTime) / 1000)}s</span>
          </div>
          
          <div className="flex space-x-2">
            {!hasAnswered ? (
              <button
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Próxima Questão
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartQuestionSystem;
