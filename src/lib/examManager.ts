import { Question, ExamSession, UserProgress, ExamResult } from '@/types';

export class ExamManager {
  private static instance: ExamManager;
  
  public static getInstance(): ExamManager {
    if (!ExamManager.instance) {
      ExamManager.instance = new ExamManager();
    }
    return ExamManager.instance;
  }

  /**
   * Cria uma nova sessão de exame
   */
  createExamSession(questions: Question[], mode: 'practice' | 'timed' | 'review' = 'practice'): ExamSession {
    const sessionId = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: sessionId,
      startTime: new Date(),
      isCompleted: false,
      isPaused: false,
      questions: this.shuffleArray([...questions]),
      userProgress: {
        totalQuestions: questions.length,
        answeredQuestions: 0,
        correctAnswers: 0,
        score: 0,
        timeSpent: 0,
        currentQuestionIndex: 0,
        results: []
      },
      mode
    };
  }

  /**
   * Embaralha array de questões
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Submete resposta para uma questão
   */
  submitAnswer(
    session: ExamSession,
    questionId: string,
    userAnswer: string | string[],
    timeSpent: number
  ): ExamSession {
    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Questão não encontrada');
    }

    const isCorrect = this.checkAnswer(question, userAnswer);
    
    const result: ExamResult = {
      questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      timestamp: new Date()
    };

    // Atualizar progresso
    const existingResultIndex = session.userProgress.results.findIndex(r => r.questionId === questionId);
    
    if (existingResultIndex >= 0) {
      // Atualizar resposta existente
      session.userProgress.results[existingResultIndex] = result;
    } else {
      // Nova resposta
      session.userProgress.results.push(result);
      session.userProgress.answeredQuestions++;
    }

    // Recalcular estatísticas
    session.userProgress.correctAnswers = session.userProgress.results.filter(r => r.isCorrect).length;
    session.userProgress.score = Math.round((session.userProgress.correctAnswers / session.userProgress.totalQuestions) * 100);
    session.userProgress.timeSpent = session.userProgress.results.reduce((total, r) => total + r.timeSpent, 0);

    return session;
  }

  /**
   * Verifica se a resposta está correta
   */
  private checkAnswer(question: Question, userAnswer: string | string[]): boolean {
    const correctAnswer = question.correctAnswer;
    
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      // Para questões de múltipla seleção
      return correctAnswer.length === userAnswer.length &&
             correctAnswer.every(answer => userAnswer.includes(answer));
    }
    
    if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
      return correctAnswer.toLowerCase() === userAnswer.toLowerCase();
    }
    
    return false;
  }

  /**
   * Avança para a próxima questão
   */
  nextQuestion(session: ExamSession): ExamSession {
    if (session.userProgress.currentQuestionIndex < session.questions.length - 1) {
      session.userProgress.currentQuestionIndex++;
    }
    return session;
  }

  /**
   * Volta para a questão anterior
   */
  previousQuestion(session: ExamSession): ExamSession {
    if (session.userProgress.currentQuestionIndex > 0) {
      session.userProgress.currentQuestionIndex--;
    }
    return session;
  }

  /**
   * Vai para uma questão específica
   */
  goToQuestion(session: ExamSession, questionIndex: number): ExamSession {
    if (questionIndex >= 0 && questionIndex < session.questions.length) {
      session.userProgress.currentQuestionIndex = questionIndex;
    }
    return session;
  }

  /**
   * Finaliza a sessão de exame
   */
  finishExam(session: ExamSession): ExamSession {
    session.isCompleted = true;
    session.endTime = new Date();
    return session;
  }

  /**
   * Pausa/Resume a sessão de exame
   */
  togglePause(session: ExamSession): ExamSession {
    session.isPaused = !session.isPaused;
    return session;
  }

  /**
   * Obtém estatísticas detalhadas da sessão
   */
  getDetailedStats(session: ExamSession) {
    const { results, totalQuestions, correctAnswers } = session.userProgress;
    
    // Estatísticas por categoria
    const categoryStats = new Map<string, { correct: number; total: number }>();
    
    session.questions.forEach(question => {
      const result = results.find(r => r.questionId === question.id);
      const category = question.category;
      
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { correct: 0, total: 0 });
      }
      
      const stats = categoryStats.get(category)!;
      stats.total++;
      
      if (result?.isCorrect) {
        stats.correct++;
      }
    });

    // Estatísticas por dificuldade
    const difficultyStats = new Map<string, { correct: number; total: number }>();
    
    session.questions.forEach(question => {
      const result = results.find(r => r.questionId === question.id);
      const difficulty = question.difficulty;
      
      if (!difficultyStats.has(difficulty)) {
        difficultyStats.set(difficulty, { correct: 0, total: 0 });
      }
      
      const stats = difficultyStats.get(difficulty)!;
      stats.total++;
      
      if (result?.isCorrect) {
        stats.correct++;
      }
    });

    // Tempo médio por questão
    const avgTimePerQuestion = results.length > 0 
      ? results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length 
      : 0;

    return {
      overall: {
        totalQuestions,
        answeredQuestions: results.length,
        correctAnswers,
        score: session.userProgress.score,
        totalTime: session.userProgress.timeSpent,
        avgTimePerQuestion
      },
      byCategory: Object.fromEntries(categoryStats),
      byDifficulty: Object.fromEntries(difficultyStats),
      startTime: session.startTime,
      endTime: session.endTime,
      isCompleted: session.isCompleted
    };
  }

  /**
   * Salva sessão no localStorage
   */
  saveSession(session: ExamSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`exam_session_${session.id}`, JSON.stringify(session));
    }
  }

  /**
   * Carrega sessão do localStorage
   */
  loadSession(sessionId: string): ExamSession | null {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`exam_session_${sessionId}`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }

  /**
   * Lista todas as sessões salvas
   */
  listSavedSessions(): string[] {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      return keys.filter(key => key.startsWith('exam_session_'));
    }
    return [];
  }

  /**
   * Remove sessão do localStorage
   */
  removeSession(sessionId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`exam_session_${sessionId}`);
    }
  }
}

export default ExamManager;
