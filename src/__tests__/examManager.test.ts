import { describe, it, expect, beforeEach } from '@jest/globals';
import { Question, ExamSession } from '@/types';
import ExamManager from '@/lib/examManager';

describe('ExamManager', () => {
  let examManager: ExamManager;
  let sampleQuestions: Question[];

  beforeEach(() => {
    examManager = ExamManager.getInstance();
    sampleQuestions = [
      {
        id: 'test-1',
        questionText: 'Qual é o arquivo de configuração principal do GitHub Actions?',
        questionType: 'multiple-choice',
        options: ['workflow.yml', 'action.yml', 'config.yml', 'github.yml'],
        correctAnswer: 'A',
        explanation: 'Os workflows são definidos em arquivos YAML no diretório .github/workflows/',
        category: 'Workflows',
        difficulty: 'beginner',
        relatedTopics: ['YAML', 'Configuração', 'Estrutura'],
      },
      {
        id: 'test-2',
        questionText: 'Qual trigger executa o workflow em push para main?',
        questionType: 'multiple-choice',
        options: ['on: push', 'on: { push: { branches: [main] } }', 'on: main', 'trigger: push'],
        correctAnswer: 'B',
        explanation: 'Para especificar branches específicas, use a sintaxe de objeto com branches.',
        category: 'Triggers',
        difficulty: 'intermediate',
        relatedTopics: ['Triggers', 'Branches', 'Events'],
      },
    ];
  });

  it('deve criar uma sessão de exame', () => {
    const session = examManager.createExamSession(sampleQuestions, 'practice');
    
    expect(session).toBeDefined();
    expect(session.questions).toHaveLength(2);
    expect(session.mode).toBe('practice');
    expect(session.userProgress.totalQuestions).toBe(2);
    expect(session.userProgress.currentQuestionIndex).toBe(0);
  });

  it('deve registrar uma resposta correta', () => {
    const session = examManager.createExamSession(sampleQuestions, 'practice');
    const question = session.questions[0];
    
    examManager.submitAnswer(session, question.id, 'A', 30);
    
    expect(session.userProgress.correctAnswers).toBe(1);
    expect(session.userProgress.score).toBe(50); // 1/2 * 100
  });

  it('deve registrar uma resposta incorreta', () => {
    const session = examManager.createExamSession(sampleQuestions, 'practice');
    const question = session.questions[0];
    
    examManager.submitAnswer(session, question.id, 'action.yml', 45);
    
    expect(session.userProgress.correctAnswers).toBe(0);
    expect(session.userProgress.score).toBe(0);
  });

  it('deve avançar para a próxima questão', () => {
    const session = examManager.createExamSession(sampleQuestions, 'practice');
    
    examManager.nextQuestion(session);
    
    expect(session.userProgress.currentQuestionIndex).toBe(1);
  });

  it('deve voltar para a questão anterior', () => {
    const session = examManager.createExamSession(sampleQuestions, 'practice');
    
    examManager.nextQuestion(session);
    examManager.previousQuestion(session);
    
    expect(session.userProgress.currentQuestionIndex).toBe(0);
  });

  it('deve finalizar a sessão', () => {
    const session = examManager.createExamSession(sampleQuestions, 'practice');
    
    examManager.finishExam(session);
    
    expect(session.isCompleted).toBe(true);
    expect(session.endTime).toBeDefined();
  });

  it('deve calcular estatísticas por categoria', () => {
    const session = examManager.createExamSession(sampleQuestions, 'practice');
    
    // Responder primeira questão corretamente
    examManager.submitAnswer(session, sampleQuestions[0].id, 'A', 30);
    
    // Responder segunda questão incorretamente
    examManager.submitAnswer(session, sampleQuestions[1].id, 'A', 45);
    
    const stats = examManager.getDetailedStats(session);
    
    expect(stats.byCategory['Workflows']).toEqual({ total: 1, correct: 1 });
    expect(stats.byCategory['Triggers']).toEqual({ total: 1, correct: 0 });
  });

  it('deve retornar progresso detalhado', () => {
    const session = examManager.createExamSession(sampleQuestions, 'practice');
    
    examManager.submitAnswer(session, sampleQuestions[0].id, 'A', 30);
    
    const stats = examManager.getDetailedStats(session);
    
    expect(stats.overall.answeredQuestions).toBe(1);
    expect(stats.overall.correctAnswers).toBe(1);
    expect(stats.overall.score).toBe(50); // 1/2 * 100
  });
});

describe('ResultsExporter', () => {
  let examManager: ExamManager;
  let session: ExamSession;

  beforeEach(() => {
    examManager = ExamManager.getInstance();
    const questions: Question[] = [
      {
        id: 'export-test-1',
        questionText: 'Teste de exportação',
        questionType: 'multiple-choice',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: 'Esta é uma questão de teste',
        category: 'Test',
        difficulty: 'beginner',
        relatedTopics: ['Export', 'Test'],
      },
    ];

    session = examManager.createExamSession(questions, 'practice');
    examManager.submitAnswer(session, questions[0].id, 'A', 30);
  });

  it('deve gerar dados JSON válidos', () => {
    const { ResultsExporter } = require('@/lib/resultsExporter');
    const jsonData = ResultsExporter.exportToJSON(session);
    
    expect(jsonData).toBeDefined();
    expect(typeof jsonData).toBe('string');
    
    const parsed = JSON.parse(jsonData);
    expect(parsed.sessionId).toBe(session.id);
    expect(parsed.summary.totalQuestions).toBe(1);
    expect(parsed.summary.correctAnswers).toBe(1);
  });

  it('deve gerar dados CSV válidos', () => {
    const { ResultsExporter } = require('@/lib/resultsExporter');
    const csvData = ResultsExporter.exportToCSV(session);
    
    expect(csvData).toBeDefined();
    expect(typeof csvData).toBe('string');
    expect(csvData).toContain('ID,Categoria,Dificuldade');
    expect(csvData).toContain('export-test-1');
  });

  it('deve gerar HTML válido', () => {
    const { ResultsExporter } = require('@/lib/resultsExporter');
    const htmlData = ResultsExporter.exportToPDF(session);
    
    expect(htmlData).toBeDefined();
    expect(typeof htmlData).toBe('string');
    expect(htmlData).toContain('<!DOCTYPE html>');
    expect(htmlData).toContain('GitHub Actions GH-200');
  });
});
