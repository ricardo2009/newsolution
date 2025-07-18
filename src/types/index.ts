export interface Question {
  id: string;
  questionText: string;
  questionType: 'multiple-choice' | 'true-false' | 'code-completion' | 'drag-drop';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  codeExample?: string;
  relatedTopics: string[];
  imageUrl?: string;
  page?: number;
}

export interface ExamResult {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface UserProgress {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  currentQuestionIndex: number;
  results: ExamResult[];
}

export interface ExamSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  isPaused: boolean;
  questions: Question[];
  userProgress: UserProgress;
  mode: 'practice' | 'timed' | 'review';
}

export interface PDFContent {
  text: string;
  images: string[];
  tables: string[][];
  metadata: {
    title: string;
    author: string;
    pageCount: number;
  };
}

export interface ParsedExamData {
  questions: Question[];
  metadata: {
    totalQuestions: number;
    categories: string[];
    extractedAt: Date;
    pdfPages?: number;
    pdfSize?: number;
  };
}
