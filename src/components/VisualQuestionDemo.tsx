'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import EnhancedQuestionCard from './EnhancedQuestionCard';
import AnimatedConcept from './AnimatedConcept';

// Questões de exemplo com múltipla escolha e conteúdo visual
const sampleQuestionsWithVisuals: Question[] = [
  {
    id: 'workflow-triggers-multi',
    questionText: 'Quais são os eventos que podem disparar um workflow do GitHub Actions automaticamente? (Selecione todas as opções corretas)',
    questionType: 'multiple-select',
    multipleCorrectAnswers: true,
    minimumCorrectAnswers: 2,
    options: [
      'Push para repository',
      'Pull request criado ou atualizado',
      'Issue criado',
      'Release publicado',
      'Webhook personalizado',
      'Acesso SSH ao repository'
    ],
    correctAnswer: [
      'Push para repository',
      'Pull request criado ou atualizado',
      'Issue criado',
      'Release publicado'
    ],
    explanation: 'Os workflows podem ser disparados por diversos eventos do GitHub como push, pull_request, issues, release, schedule, workflow_dispatch, entre outros. Webhooks personalizados e acesso SSH não são eventos que disparam workflows diretamente.',
    category: 'Workflows & Triggers',
    difficulty: 'intermediate',
    relatedTopics: ['triggers', 'events', 'automation'],
    visualContent: {
      type: 'workflow',
      caption: 'Fluxo de execução de um workflow disparado por eventos'
    },
    codeExample: `name: Multi-trigger Workflow
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  issues:
    types: [ opened, closed ]
  release:
    types: [ published ]
  schedule:
    - cron: '0 2 * * 1-5'  # Segunda a sexta às 2h
  workflow_dispatch:  # Permite execução manual`
  },
  
  {
    id: 'matrix-strategy-visual',
    questionText: 'Em uma estratégia de matrix, quais configurações são válidas para testar uma aplicação Node.js em diferentes ambientes?',
    questionType: 'multiple-select',
    multipleCorrectAnswers: true,
    partialCredit: true,
    options: [
      'Diferentes versões do Node.js (16, 18, 20)',
      'Diferentes sistemas operacionais (ubuntu, windows, macos)',
      'Diferentes bancos de dados (postgres, mysql, mongodb)',
      'Diferentes fusos horários',
      'Diferentes branches do git',
      'Diferentes tamanhos de VM'
    ],
    correctAnswer: [
      'Diferentes versões do Node.js (16, 18, 20)',
      'Diferentes sistemas operacionais (ubuntu, windows, macos)',
      'Diferentes bancos de dados (postgres, mysql, mongodb)'
    ],
    explanation: 'Matrix strategy permite testar combinações de versões de runtime, sistemas operacionais e serviços. Fusos horários, branches e tamanhos de VM não são configurações típicas de matrix.',
    category: 'Matrix & Parallel Jobs',
    difficulty: 'advanced',
    relatedTopics: ['matrix', 'parallel-execution', 'testing'],
    visualContent: {
      type: 'diagram',
      caption: 'Visualização de uma estratégia de matrix com múltiplas configurações'
    },
    codeExample: `strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest, macos-latest]
    database: [postgres, mysql, mongodb]
    include:
      - node-version: 20
        os: ubuntu-latest
        database: postgres
        experimental: true
    exclude:
      - node-version: 16
        os: macos-latest`
  },
  
  {
    id: 'conditional-execution',
    questionText: 'Quais são as formas corretas de implementar execução condicional em GitHub Actions?',
    questionType: 'multiple-select',
    multipleCorrectAnswers: true,
    options: [
      'Usar a palavra-chave "if" em steps',
      'Usar a palavra-chave "if" em jobs',
      'Usar "continue-on-error" para ignorar falhas',
      'Usar outputs de steps anteriores',
      'Usar variáveis de ambiente personalizadas',
      'Usar "when" como no Jenkins'
    ],
    correctAnswer: [
      'Usar a palavra-chave "if" em steps',
      'Usar a palavra-chave "if" em jobs',
      'Usar outputs de steps anteriores',
      'Usar variáveis de ambiente personalizadas'
    ],
    explanation: 'GitHub Actions usa "if" para condições, pode usar outputs de steps e variáveis de ambiente. "continue-on-error" é para tratamento de erros, não condições. "when" é específico do Jenkins.',
    category: 'Conditional Execution',
    difficulty: 'intermediate',
    relatedTopics: ['conditions', 'if-statements', 'workflow-control'],
    visualContent: {
      type: 'workflow',
      caption: 'Fluxo condicional baseado em diferentes critérios'
    },
    codeExample: `jobs:
  test:
    if: github.event_name == 'push'
    steps:
      - name: Check changes
        id: changes
        run: |
          if git diff --name-only HEAD^ HEAD | grep -q "src/"; then
            echo "src-changed=true" >> $GITHUB_OUTPUT
          fi
      
      - name: Run tests
        if: steps.changes.outputs.src-changed == 'true'
        run: npm test
      
      - name: Deploy
        if: github.ref == 'refs/heads/main' && success()
        run: echo "Deploying to production"`
  },
  
  {
    id: 'secrets-management',
    questionText: 'Quais são as melhores práticas para gerenciar secrets em GitHub Actions?',
    questionType: 'multiple-select',
    multipleCorrectAnswers: true,
    options: [
      'Usar \${{ secrets.SECRET_NAME }} para acessar secrets',
      'Armazenar secrets em variáveis de ambiente no código',
      'Usar environments para controlar acesso a secrets',
      'Logs automaticamente mascaram valores de secrets',
      'Secrets podem ser compartilhados entre repositórios',
      'Secrets são visíveis para todos os colaboradores'
    ],
    correctAnswer: [
      'Usar \${{ secrets.SECRET_NAME }} para acessar secrets',
      'Usar environments para controlar acesso a secrets',
      'Logs automaticamente mascaram valores de secrets'
    ],
    explanation: 'Secrets devem ser acessados via contexto \${{ secrets.NAME }}, podem ser controlados por environments, e são automaticamente mascarados nos logs. Nunca devem ser hardcoded ou compartilhados indiscriminadamente.',
    category: 'Security & Secrets',
    difficulty: 'intermediate',
    relatedTopics: ['secrets', 'security', 'environments'],
    visualContent: {
      type: 'diagram',
      caption: 'Fluxo seguro de acesso a secrets em workflows'
    },
    codeExample: `name: Secure Deployment
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Environment com secrets protegidos
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: \\${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \\${{ secrets.AWS_SECRET_ACCESS_KEY }}
          DATABASE_URL: \\${{ secrets.DATABASE_URL }}
        run: |
          echo "Deploying with secure credentials"
          # O valor dos secrets será mascarado nos logs automaticamente\`
  },
  
  {
    id: 'artifacts-and-cache',
    questionText: 'Qual é a diferença entre Artifacts e Cache no GitHub Actions?',
    questionType: 'multiple-choice',
    options: [
      'Artifacts são para compartilhar dados entre jobs, Cache é para acelerar builds',
      'Artifacts são temporários, Cache é permanente',
      'Artifacts são públicos, Cache é privado',
      'Não há diferença, são a mesma funcionalidade'
    ],
    correctAnswer: 'Artifacts são para compartilhar dados entre jobs, Cache é para acelerar builds',
    explanation: 'Artifacts são usados para compartilhar arquivos entre jobs de um workflow ou preservar dados após o workflow. Cache é usado para acelerar builds reutilizando dependências ou resultados de builds anteriores.',
    category: 'Artifacts & Cache',
    difficulty: 'beginner',
    relatedTopics: ['artifacts', 'cache', 'optimization'],
    visualContent: {
      type: 'diagram',
      caption: 'Comparação entre Artifacts e Cache no GitHub Actions'
    },
    codeExample: \`# Usando Artifacts
- name: Upload build artifacts
  uses: actions/upload-artifact@v3
  with:
    name: build-files
    path: dist/

- name: Download artifacts
  uses: actions/download-artifact@v3
  with:
    name: build-files

# Usando Cache
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-node-\`
  }
];

interface VisualQuestionDemoProps {
  className?: string;
}

const VisualQuestionDemo: React.FC<VisualQuestionDemoProps> = ({ className = '' }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConcept, setShowConcept] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const currentQuestion = sampleQuestionsWithVisuals[currentQuestionIndex];

  const handleAnswerSubmit = (result: any) => {
    setResults([...results, result]);
    console.log('Resposta submetida:', result);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestionsWithVisuals.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentQuestionIndex(sampleQuestionsWithVisuals.length - 1);
    }
  };

  const getConceptType = () => {
    const category = currentQuestion.category.toLowerCase();
    if (category.includes('workflow')) return 'workflow';
    if (category.includes('matrix')) return 'matrix';
    if (category.includes('conditional')) return 'conditional';
    if (category.includes('security')) return 'secrets';
    if (category.includes('artifacts')) return 'artifacts';
    return 'workflow';
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-8 ${className}`}>
      {/* Cabeçalho */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🎯 Demonstração de Questões Visuais
        </h1>
        <p className="text-gray-600 mb-4">
          Questões com múltipla escolha e conteúdo visual interativo
        </p>
        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm text-gray-500">
            Questão {currentQuestionIndex + 1} de {sampleQuestionsWithVisuals.length}
          </span>
          <button
            onClick={() => setShowConcept(!showConcept)}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
          >
            {showConcept ? '📋 Ver Questão' : '🎬 Ver Conceito'}
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {showConcept ? (
        <AnimatedConcept
          concept={getConceptType()}
          title={`Conceito: ${currentQuestion.category}`}
          description={currentQuestion.explanation}
          autoPlay={true}
          showControls={true}
        />
      ) : (
        <EnhancedQuestionCard
          question={currentQuestion}
          onAnswerSubmit={handleAnswerSubmit}
          showExplanation={false}
          startTime={Date.now()}
        />
      )}

      {/* Controles de Navegação */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevQuestion}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <span>←</span>
          <span>Anterior</span>
        </button>

        <div className="flex space-x-2">
          {sampleQuestionsWithVisuals.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentQuestionIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNextQuestion}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Próxima</span>
          <span>→</span>
        </button>
      </div>

      {/* Estatísticas */}
      {results.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-800 mb-2">📊 Estatísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-gray-600">Respondidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.isCorrect).length}
              </div>
              <div className="text-sm text-gray-600">Corretas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {results.length > 0 ? Math.round((results.filter(r => r.isCorrect).length / results.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Precisão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length) : 0}s
              </div>
              <div className="text-sm text-gray-600">Tempo Médio</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualQuestionDemo;
