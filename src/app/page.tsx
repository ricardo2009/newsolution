'use client';

import { useState, useEffect } from 'react';
import { Question, ExamSession, ParsedExamData } from '@/types';
import ExamManager from '@/lib/examManager';
import { ResultsExporter } from '@/lib/resultsExporter';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import StatsPanel from '@/components/StatsPanel';
import Timer from '@/components/Timer';
import NavigationControls from '@/components/NavigationControls';
import LoadingSpinner from '@/components/LoadingSpinner';
import PDFUploader from '@/components/PDFUploader';
import SampleQuestionsLoader from '@/components/SampleQuestionsLoader';
import FilterPanel from '@/components/FilterPanel';
import SearchBar from '@/components/SearchBar';
import ResultsExport from '@/components/ResultsExport';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [examMode, setExamMode] = useState<'practice' | 'timed' | 'review'>('practice');
  const [showStats, setShowStats] = useState(false);
  const [showPDFUploader, setShowPDFUploader] = useState(false);
  const [loadedQuestions, setLoadedQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const examManager = ExamManager.getInstance();

  useEffect(() => {
    // Começar com questões de exemplo
    initializeExam();
  }, []);

  const initializeExam = async () => {
    try {
      setIsLoading(true);
      
      // Usar questões carregadas do PDF ou questões de exemplo
      const questionsToUse = loadedQuestions.length > 0 ? loadedQuestions : await generateSampleQuestions();
      
      const session = examManager.createExamSession(questionsToUse, examMode);
      setExamSession(session);
      
      if (session.questions.length > 0) {
        setCurrentQuestion(session.questions[0]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao inicializar exame:', error);
      setIsLoading(false);
    }
  };

  const handlePDFQuestionsLoaded = (data: ParsedExamData) => {
    setLoadedQuestions(data.questions);
    setFilteredQuestions(data.questions);
    setSearchResults(data.questions);
    setShowPDFUploader(false);
    
    // Reinicializar exame com novas questões
    const session = examManager.createExamSession(data.questions, examMode);
    setExamSession(session);
    
    if (session.questions.length > 0) {
      setCurrentQuestion(session.questions[0]);
    }
  };

  const handleStartWithPDF = () => {
    setShowPDFUploader(true);
  };

  const handleStartWithSample = () => {
    setShowPDFUploader(false);
    initializeExam();
  };

  const generateSampleQuestions = async (): Promise<Question[]> => {
    return [
      {
        id: 'q1',
        questionText: 'Qual é o arquivo de configuração principal para definir workflows no GitHub Actions?',
        questionType: 'multiple-choice',
        options: [
          '.github/workflows/main.yml',
          '.github/actions/workflow.yml',
          '.github/workflow.yaml',
          'github-actions.yml'
        ],
        correctAnswer: 'A',
        explanation: 'Os workflows do GitHub Actions são definidos em arquivos YAML localizados no diretório .github/workflows/ do repositório. O nome do arquivo pode ser qualquer um, mas deve ter extensão .yml ou .yaml.',
        category: 'Workflows',
        difficulty: 'beginner',
        relatedTopics: ['GitHub Actions', 'Workflows', 'YAML', 'Configuration'],
        codeExample: `name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Run tests
      run: npm test`
      },
      {
        id: 'q2',
        questionText: 'Quais são os tipos de eventos (triggers) que podem iniciar um workflow no GitHub Actions?',
        questionType: 'multiple-choice',
        options: [
          'Apenas push e pull_request',
          'Push, pull_request, schedule, workflow_dispatch',
          'Somente eventos de webhook',
          'Apenas eventos manuais'
        ],
        correctAnswer: 'B',
        explanation: 'O GitHub Actions suporta uma ampla variedade de eventos que podem disparar workflows, incluindo push, pull_request, schedule (cron), workflow_dispatch (manual), issues, releases, e muitos outros.',
        category: 'Workflows',
        difficulty: 'intermediate',
        relatedTopics: ['Events', 'Triggers', 'Webhooks', 'Scheduling'],
        codeExample: `on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'`
      },
      {
        id: 'q3',
        questionText: 'Como você pode acessar secrets em um workflow do GitHub Actions?',
        questionType: 'multiple-choice',
        options: [
          'Usando a sintaxe ${{ secrets.SECRET_NAME }}',
          'Através de variáveis de ambiente ENV.SECRET_NAME',
          'Importando diretamente do arquivo .env',
          'Usando process.env.SECRET_NAME'
        ],
        correctAnswer: 'A',
        explanation: 'Secrets no GitHub Actions são acessados usando a sintaxe de expressão ${{ secrets.SECRET_NAME }}. Eles são criptografados e só ficam disponíveis durante a execução do workflow.',
        category: 'Secrets',
        difficulty: 'intermediate',
        relatedTopics: ['Secrets', 'Security', 'Environment Variables', 'Expressions'],
        codeExample: `jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to production
      env:
        API_KEY: \${{ secrets.API_KEY }}
        DATABASE_URL: \${{ secrets.DATABASE_URL }}
      run: |
        echo "Deploying with API key"
        ./deploy.sh`
      },
      {
        id: 'q4',
        questionText: 'Qual é a diferença entre "runs-on" e "container" em um job do GitHub Actions?',
        questionType: 'multiple-choice',
        options: [
          'runs-on especifica o runner, container especifica a imagem Docker',
          'São sinônimos e podem ser usados intercambiavelmente',
          'runs-on é para Linux, container é para Windows',
          'container é obsoleto, use apenas runs-on'
        ],
        correctAnswer: 'A',
        explanation: 'runs-on especifica o tipo de runner (ubuntu-latest, windows-latest, etc.), enquanto container permite executar o job dentro de um container Docker específico no runner.',
        category: 'Runners',
        difficulty: 'advanced',
        relatedTopics: ['Runners', 'Docker', 'Containers', 'Jobs'],
        codeExample: `jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: node:18
      env:
        NODE_ENV: test
    steps:
    - uses: actions/checkout@v3
    - run: npm test`
      },
      {
        id: 'q5',
        questionText: 'Como você pode fazer cache de dependências para acelerar builds no GitHub Actions?',
        questionType: 'multiple-choice',
        options: [
          'Usando a action actions/cache@v3',
          'Armazenando em artifacts',
          'Usando secrets para guardar dependências',
          'Não é possível fazer cache no GitHub Actions'
        ],
        correctAnswer: 'A',
        explanation: 'A action actions/cache@v3 permite cachear dependências e outros arquivos entre execuções de workflow, reduzindo significativamente o tempo de build.',
        category: 'Workflows',
        difficulty: 'intermediate',
        relatedTopics: ['Caching', 'Performance', 'Dependencies', 'Build Optimization'],
        codeExample: `steps:
- uses: actions/checkout@v3
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-node-
- run: npm ci
- run: npm run build`
      }
    ];
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setHasAnswered(true);
    setShowExplanation(true);
    
    if (examSession && currentQuestion) {
      const updatedSession = examManager.submitAnswer(
        examSession,
        currentQuestion.id,
        answer,
        60 // tempo simulado
      );
      setExamSession(updatedSession);
    }
  };

  const handleNextQuestion = () => {
    if (examSession) {
      const updatedSession = examManager.nextQuestion(examSession);
      setExamSession(updatedSession);
      
      const nextQuestion = updatedSession.questions[updatedSession.userProgress.currentQuestionIndex];
      setCurrentQuestion(nextQuestion);
      
      // Reset estado da questão
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (examSession) {
      const updatedSession = examManager.previousQuestion(examSession);
      setExamSession(updatedSession);
      
      const prevQuestion = updatedSession.questions[updatedSession.userProgress.currentQuestionIndex];
      setCurrentQuestion(prevQuestion);
      
      // Reset estado da questão
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowExplanation(false);
    }
  };

  const handleFinishExam = () => {
    if (examSession) {
      const finishedSession = examManager.finishExam(examSession);
      setExamSession(finishedSession);
      setShowStats(true);
    }
  };

  const handleRestartExam = () => {
    setShowStats(false);
    initializeExam();
  };

  const handleSearch = (results: Question[]) => {
    setSearchResults(results);
    applyFilters(results);
  };

  const applyFilters = (questions: Question[]) => {
    let filtered = questions;

    // Filtro por categoria
    if (selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Filtro por dificuldade
    if (selectedDifficulty) {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    // Filtro por questões incorretas
    if (showOnlyIncorrect && examSession) {
      filtered = filtered.filter(q => {
        const result = examSession.userProgress.results.find(r => r.questionId === q.id);
        return result && !result.isCorrect;
      });
    }

    // Filtro por favoritos
    if (showOnlyFavorites) {
      filtered = filtered.filter(q => favorites.has(q.id));
    }

    setFilteredQuestions(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const questions = searchResults.length > 0 ? searchResults : (loadedQuestions.length > 0 ? loadedQuestions : []);
    applyFilters(questions);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    const questions = searchResults.length > 0 ? searchResults : (loadedQuestions.length > 0 ? loadedQuestions : []);
    applyFilters(questions);
  };

  const handleShowIncorrectChange = (show: boolean) => {
    setShowOnlyIncorrect(show);
    const questions = searchResults.length > 0 ? searchResults : (loadedQuestions.length > 0 ? loadedQuestions : []);
    applyFilters(questions);
  };

  const handleShowFavoritesChange = (show: boolean) => {
    setShowOnlyFavorites(show);
    const questions = searchResults.length > 0 ? searchResults : (loadedQuestions.length > 0 ? loadedQuestions : []);
    applyFilters(questions);
  };

  const handleToggleFavorite = (questionId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(questionId)) {
      newFavorites.delete(questionId);
    } else {
      newFavorites.add(questionId);
    }
    setFavorites(newFavorites);
  };

  const handleExportResults = (format: 'json' | 'csv' | 'pdf') => {
    if (!examSession) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
      switch (format) {
        case 'json':
          const jsonData = ResultsExporter.exportToJSON(examSession);
          ResultsExporter.downloadFile(jsonData, `exam-results-${timestamp}.json`, 'application/json');
          break;
        case 'csv':
          const csvData = ResultsExporter.exportToCSV(examSession);
          ResultsExporter.downloadFile(csvData, `exam-results-${timestamp}.csv`, 'text/csv');
          break;
        case 'pdf':
          const htmlData = ResultsExporter.exportToPDF(examSession);
          ResultsExporter.downloadFile(htmlData, `exam-results-${timestamp}.html`, 'text/html');
          break;
      }
    } catch (error) {
      console.error('Erro ao exportar resultados:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (showStats && examSession) {
    const stats = examManager.getDetailedStats(examSession);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <StatsPanel stats={stats} onRestart={handleRestartExam} />
        </div>
      </div>
    );
  }

  if (showPDFUploader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setShowPDFUploader(false)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          </div>
          <PDFUploader onQuestionsLoaded={handlePDFQuestionsLoaded} />
          
          <div className="mt-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">ou</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
            </div>
            
            <SampleQuestionsLoader onQuestionsLoaded={handlePDFQuestionsLoaded} />
          </div>
        </div>
      </div>
    );
  }

  // Tela inicial de seleção
  if (!examSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">
              GitHub Actions
              <span className="block text-blue-600">GH-200</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Simulador Interativo de Certificação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Carregar PDF do Exame
                </h2>
                <p className="text-gray-600 mb-6">
                  Faça upload do arquivo PDF oficial com as 70+ questões do exame GH-200
                </p>
                <ul className="text-sm text-gray-500 mb-8 space-y-2">
                  <li>✓ Extração automática de questões</li>
                  <li>✓ Identificação de respostas corretas</li>
                  <li>✓ Categorização inteligente</li>
                  <li>✓ Exemplos de código incluídos</li>
                </ul>
              </div>
              <button
                onClick={handleStartWithPDF}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Carregar PDF
              </button>
            </div>

            <SampleQuestionsLoader onQuestionsLoaded={handlePDFQuestionsLoaded} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Sobre o Simulador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>Questões Reais:</strong> Baseadas no conteúdo oficial da certificação GH-200
              </div>
              <div>
                <strong>Explicações:</strong> Cada resposta inclui explicação detalhada
              </div>
              <div>
                <strong>Progresso:</strong> Acompanhe seu desempenho em tempo real
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Erro ao carregar o exame
          </h1>
          <button
            onClick={initializeExam}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                GitHub Actions GH-200
              </h1>
              <p className="text-gray-600">Simulador de Certificação</p>
            </div>
            <div className="flex items-center space-x-4">
              <Timer 
                isRunning={!examSession.isPaused && !examSession.isCompleted}
                startTime={examSession.startTime}
              />
              <button
                onClick={() => setShowPDFUploader(true)}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                📄 Carregar PDF
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver Estatísticas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <ProgressBar
            current={examSession.userProgress.currentQuestionIndex + 1}
            total={examSession.questions.length}
            answered={examSession.userProgress.answeredQuestions}
            correct={examSession.userProgress.correctAnswers}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Questões ({filteredQuestions.length})
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>
          
          <SearchBar 
            questions={loadedQuestions.length > 0 ? loadedQuestions : []}
            onSearch={handleSearch}
          />
          
          {showFilters && (
            <FilterPanel
              questions={loadedQuestions.length > 0 ? loadedQuestions : []}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={handleDifficultyChange}
              showOnlyIncorrect={showOnlyIncorrect}
              onShowIncorrectChange={handleShowIncorrectChange}
              showOnlyFavorites={showOnlyFavorites}
              onShowFavoritesChange={handleShowFavoritesChange}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              hasAnswered={hasAnswered}
              showExplanation={showExplanation}
              onAnswerSelect={handleAnswerSelect}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.has(currentQuestion.id)}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Progresso</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questões:</span>
                  <span className="font-medium">
                    {examSession.userProgress.currentQuestionIndex + 1} de {examSession.questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Respondidas:</span>
                  <span className="font-medium">
                    {examSession.userProgress.answeredQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Corretas:</span>
                  <span className="font-medium text-green-600">
                    {examSession.userProgress.correctAnswers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pontuação:</span>
                  <span className="font-medium text-blue-600">
                    {examSession.userProgress.score}%
                  </span>
                </div>
              </div>
            </div>

            {/* Question Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Informações</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 block">Categoria:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {currentQuestion.category}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block">Dificuldade:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentQuestion.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestion.difficulty === 'beginner' ? 'Iniciante' :
                     currentQuestion.difficulty === 'intermediate' ? 'Intermediário' :
                     'Avançado'}
                  </span>
                </div>
                {currentQuestion.relatedTopics.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-2">Tópicos:</span>
                    <div className="flex flex-wrap gap-1">
                      {currentQuestion.relatedTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Export Results */}
            {examSession.userProgress.answeredQuestions > 0 && (
              <ResultsExport
                session={examSession}
                onExport={handleExportResults}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8">
          <NavigationControls
            currentIndex={examSession.userProgress.currentQuestionIndex}
            totalQuestions={examSession.questions.length}
            hasAnswered={hasAnswered}
            onPrevious={handlePreviousQuestion}
            onNext={handleNextQuestion}
            onFinish={handleFinishExam}
          />
        </div>
      </div>
    </div>
  );
}
