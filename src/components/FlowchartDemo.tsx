'use client';

import React, { useState } from 'react';
import QuestionCard from '@/components/QuestionCard';
import MermaidArchitectureFlowchart from '@/components/MermaidArchitectureFlowchart';
import { Question } from '@/types';

const FlowchartDemo: React.FC = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const demoQuestions: Question[] = [
    {
      id: "demo-workflow",
      questionText: "Qual é o trigger correto para executar um workflow GitHub Actions quando um Pull Request é criado?",
      questionType: "multiple-choice",
      options: [
        "on: pull_request",
        "on: push",
        "on: merge",
        "on: create"
      ],
      correctAnswer: ["on: pull_request"],
      explanation: "O trigger 'on: pull_request' é usado para executar workflows quando Pull Requests são criados, atualizados ou fechados. Este é o método padrão para validar código antes da integração.",
      category: "GitHub Actions",
      difficulty: "beginner",
      relatedTopics: ["Workflows", "Triggers", "Pull Requests", "CI/CD"]
    },
    {
      id: "demo-azure",
      questionText: "Qual comando é usado para fazer login no Azure CLI em um workflow GitHub Actions?",
      questionType: "multiple-choice",
      options: [
        "az login",
        "azure login",
        "az auth login",
        "az account login"
      ],
      correctAnswer: ["az login"],
      explanation: "O comando 'az login' é usado para autenticar no Azure CLI. Em workflows GitHub Actions, geralmente é usado com service principal ou managed identity para autenticação automatizada.",
      category: "Azure",
      difficulty: "intermediate",
      relatedTopics: ["Azure CLI", "Authentication", "Deployment", "DevOps"]
    },
    {
      id: "demo-security",
      questionText: "Qual é a melhor prática para armazenar credenciais sensíveis em GitHub Actions?",
      questionType: "multiple-choice",
      options: [
        "Hardcodar no código",
        "Usar GitHub Secrets",
        "Colocar em variáveis de ambiente",
        "Salvar em arquivos"
      ],
      correctAnswer: ["Usar GitHub Secrets"],
      explanation: "GitHub Secrets é o método mais seguro para armazenar credenciais sensíveis. Os secrets são criptografados e só ficam disponíveis durante a execução do workflow, nunca aparecendo nos logs.",
      category: "Security",
      difficulty: "intermediate",
      relatedTopics: ["GitHub Secrets", "Security", "Best Practices", "Credentials"]
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = demoQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answers: string[]) => {
    setSelectedAnswers(answers);
    setSelectedAnswer(answers[0] || null);
  };
  
  const handleSubmitAnswer = () => {
    setHasAnswered(true);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % demoQuestions.length);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setHasAnswered(false);
    setShowExplanation(false);
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev - 1 + demoQuestions.length) % demoQuestions.length);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setHasAnswered(false);
    setShowExplanation(false);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setHasAnswered(false);
    setShowExplanation(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎯 Demo: Fluxograma Explicativo Animado
        </h1>
        <p className="text-gray-600 mb-6">
          Responda às questões e veja o fluxograma animado explicando o processo de raciocínio!
        </p>
        
        <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-600">
              Questão {currentQuestionIndex + 1} de {demoQuestions.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevQuestion}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Próxima →
              </button>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            🔄 Resetar
          </button>
        </div>
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswers={selectedAnswers}
        hasAnswered={hasAnswered}
        showExplanation={showExplanation}
        onAnswerSelect={handleAnswerSelect}
        onSubmitAnswer={handleSubmitAnswer}
      />

      {/* Mermaid Architecture Flowchart Demo */}
      {(hasAnswered || selectedAnswers.length > 0) && (
        <div className="mt-8">
          <MermaidArchitectureFlowchart
            question={currentQuestion}
            userAnswers={selectedAnswers}
            isCorrect={selectedAnswers.length > 0 && 
              currentQuestion.correctAnswer.includes(selectedAnswers[0])}
            onComplete={() => console.log('Fluxograma demo concluído')}
          />
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">💡 Funcionalidades da Demo:</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✅</span>
            <span>Responda a questão e veja o fluxograma explicativo aparecer</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-500">🎯</span>
            <span>Fluxograma colorido e animado mostra o processo de raciocínio</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-500">🔄</span>
            <span>Navegue entre diferentes questões para ver variações do fluxograma</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-orange-500">📊</span>
            <span>Cada questão tem seu próprio fluxograma personalizado</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FlowchartDemo;
