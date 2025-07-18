'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import QuestionCard from './QuestionCard';

const ImageQuestionDemo: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Questão de exemplo com imagem
  const sampleQuestion: Question = {
    id: 'demo-matrix-question',
    questionText: 'How many jobs will result from the following matrix configuration?',
    questionType: 'multiple-choice',
    options: [
      '2 jobs (one for each OS)',
      '4 jobs (2 OS × 2 Node versions)',
      '6 jobs (2 OS × 3 configurations)',
      '8 jobs (2 OS × 2 Node versions × 2 environments)'
    ],
    correctAnswer: 'B',
    explanation: 'A matrix configuration creates a job for each combination of the matrix parameters. In this case, we have 2 operating systems (ubuntu-latest, windows-latest) and 2 Node.js versions (16, 18), resulting in 2 × 2 = 4 jobs total.',
    category: 'Workflows',
    difficulty: 'intermediate',
    relatedTopics: ['matrix', 'jobs', 'strategy', 'workflow'],
    codeExample: `name: Matrix Example
on: [push]
jobs:
  build:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [16, 18]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}`,
    imageUrl: 'https://via.placeholder.com/600x400/2563EB/FFFFFF?text=Matrix+Configuration+Example',
    visualContent: {
      type: 'image',
      url: 'https://via.placeholder.com/600x400/2563EB/FFFFFF?text=Matrix+Configuration+Example',
      alt: 'Matrix configuration showing os and node-version parameters',
      caption: 'Matrix configuration creating jobs for different OS and Node.js versions',
      interactive: false,
      annotations: [
        {
          x: 25,
          y: 30,
          text: 'OS Matrix',
          type: 'info'
        },
        {
          x: 75,
          y: 30,
          text: 'Node Versions',
          type: 'success'
        },
        {
          x: 50,
          y: 70,
          text: '2 × 2 = 4 Jobs',
          type: 'warning'
        }
      ]
    }
  };

  const handleAnswerSelect = (answers: string[]) => {
    setSelectedAnswers(answers);
  };

  const handleSubmitAnswer = () => {
    setHasAnswered(true);
    setShowExplanation(true);
  };

  const resetDemo = () => {
    setSelectedAnswers([]);
    setHasAnswered(false);
    setShowExplanation(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          🖼️ Demonstração de Questões com Imagens
        </h2>
        <p className="text-blue-700">
          Esta demonstração mostra como questões com imagens são apresentadas no simulador. 
          A imagem ajuda a visualizar configurações complexas como matriz de jobs, 
          workflows e outras configurações do GitHub Actions.
        </p>
      </div>

      <QuestionCard
        question={sampleQuestion}
        selectedAnswers={selectedAnswers}
        hasAnswered={hasAnswered}
        showExplanation={showExplanation}
        onAnswerSelect={handleAnswerSelect}
        onSubmitAnswer={handleSubmitAnswer}
      />

      <div className="mt-8 text-center">
        <button
          onClick={resetDemo}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Resetar Demonstração
        </button>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          📋 Recursos de Imagem Suportados
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-blue-600 mb-2">🔍 Visualização</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Imagens responsivas</li>
              <li>• Zoom e visualização em tela cheia</li>
              <li>• Legendas explicativas</li>
              <li>• Otimização automática</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-green-600 mb-2">🎯 Anotações</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Marcadores informativos</li>
              <li>• Destaques em pontos importantes</li>
              <li>• Cores categorizadas</li>
              <li>• Posicionamento preciso</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">
          💡 Dica para Questões com Imagens
        </h4>
        <p className="text-yellow-700 text-sm">
          Questões que incluem configurações visuais, como exemplos de matrix, 
          workflows YAML, ou screenshots de configurações, são automaticamente 
          detectadas e apresentadas com suporte visual aprimorado.
        </p>
      </div>
    </div>
  );
};

export default ImageQuestionDemo;
