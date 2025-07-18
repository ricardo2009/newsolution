export interface Question {
  id: string;
  questionText: string;
  questionType: 'multiple-choice' | 'multiple-select' | 'true-false' | 'code-completion' | 'drag-drop';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  codeExample?: string;
  relatedTopics: string[];
  imageUrl?: string;
  page?: number;
  // Conteúdo visual melhorado
  visualContent?: {
    type: 'image' | 'gif' | 'diagram' | 'workflow' | 'code-flow';
    url?: string;
    alt?: string;
    caption?: string;
    interactive?: boolean;
    annotations?: Array<{
      x: number;
      y: number;
      text: string;
      type: 'info' | 'warning' | 'success' | 'error';
    }>;
  };
  // Suporte para múltiplas respostas
  multipleCorrectAnswers?: boolean;
  minimumCorrectAnswers?: number;
  partialCredit?: boolean;
  // Traduções para português-br
  translations?: {
    questionText?: string;
    options?: string[];
    explanation?: string;
    category?: string;
    relatedTopics?: string[];
  };
}

export interface ExamResult {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
  wasRevealed?: boolean;
  confidenceLevel?: 'low' | 'medium' | 'high';
  timestamp: Date;
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

// 🎮 GAMIFICATION TYPES

export interface GameStats {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  dailyStreak: number;
  questionsAnswered: number;
  questionsCorrect: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  badges: Badge[];
  achievements: Achievement[];
  lastActivityDate: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'performance' | 'dedication' | 'knowledge' | 'special';
  earnedAt: Date;
  isRare?: boolean;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'milestone' | 'streak' | 'performance' | 'time' | 'special';
  target: number;
  current: number;
  isCompleted: boolean;
  completedAt?: Date;
  reward: {
    experience: number;
    badge?: Badge;
  };
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  target: number;
  current: number;
  deadline: Date;
  reward: {
    experience: number;
    badge?: Badge;
  };
  isCompleted: boolean;
  completedAt?: Date;
}

export interface MemorizationData {
  questionId: string;
  attempts: number;
  correctCount: number;
  lastAttempt: Date;
  nextReviewDate: Date;
  difficultyMultiplier: number;
  retentionLevel: 'weak' | 'medium' | 'strong' | 'mastered';
  confidenceHistory: ('low' | 'medium' | 'high')[];
  // Campos avançados para repetição espaçada
  easeFactor?: number; // Fator de facilidade (SuperMemo)
  interval?: number; // Intervalo atual em dias
  stability?: number; // Estabilidade da memória
  retrievability?: number; // Facilidade de recuperação
}

// 🧠 ADVANCED MEMORIZATION TYPES

export interface MemoryStrength {
  recall: number; // 0-1, força da memória
  stability: number; // dias até esquecimento
  difficulty: number; // 1-10, dificuldade percebida
  retrievability: number; // 0-1, facilidade de recuperação
}

export interface LearningMetrics {
  forgettingCurve: number[]; // Pontos da curva de esquecimento
  optimalIntervals: number[]; // Intervalos ideais para revisão
  errorPatterns: { [key: string]: { errors: number; attempts: number; rate: number } }; // Padrões de erro por categoria
  studyEfficiency: number; // Eficiência de aprendizado (0-1)
  retentionRate: number; // Taxa de retenção (0-1)
  cognitiveLoad: number; // Carga cognitiva (0-1)
}

export interface StudyRecommendation {
  type: 'review' | 'focus' | 'break' | 'challenge';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  questionIds: string[];
  reason: string;
  estimatedTime: number; // minutos
  expectedOutcome: string;
}

export interface StudySession {
  id: string;
  date: Date; // Data da sessão
  startTime: Date;
  endTime?: Date;
  duration: number; // Duração em minutos
  questionsReviewed: string[];
  questionsAnswered: string[];
  correctAnswers: number;
  totalQuestions: number;
  experienceGained: number;
  achievementsUnlocked: Achievement[];
  badgesEarned: Badge[];
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  lastLoginAt: Date;
  gameStats: GameStats;
  memorization: MemorizationData[];
  challenges: Challenge[];
  studySessions: StudySession[];
  preferences: {
    dailyGoal: number;
    enableNotifications: boolean;
    preferredDifficulty: 'mixed' | 'beginner' | 'intermediate' | 'advanced';
    studyReminders: boolean;
  };
}

export interface LeaderboardEntry {
  username: string;
  level: number;
  experience: number;
  streak: number;
  accuracy: number;
  badgeCount: number;
  rank: number;
}

// 🌐 TRANSLATION CACHE TYPES

export interface TranslationCacheEntry {
  id: string;
  sourceHash: string; // Hash do conteúdo original
  sourceLanguage: string;
  targetLanguage: string;
  originalContent: {
    questionText: string;
    options?: string[];
    explanation: string;
    category: string;
    relatedTopics: string[];
  };
  translatedContent: {
    questionText: string;
    options?: string[];
    explanation: string;
    category: string;
    relatedTopics: string[];
  };
  metadata: {
    createdAt: Date;
    lastUsed: Date;
    useCount: number;
    version: string;
    translationProvider: string;
    qualityScore?: number;
    expiresAt?: Date;
  };
  performance: {
    translationTime: number;
    cacheHit: boolean;
    cacheLayer: 'memory' | 'localStorage' | 'indexedDB' | 'server';
  };
}

export interface CacheMetrics {
  totalEntries: number;
  totalSize: number; // em bytes
  hitRate: number; // 0-1
  missRate: number; // 0-1
  averageRetrievalTime: number; // ms
  cacheHealth: 'excellent' | 'good' | 'poor' | 'critical';
  layerDistribution: {
    memory: number;
    localStorage: number;
    indexedDB: number;
    server: number;
  };
}

export interface CacheConfiguration {
  maxMemoryEntries: number;
  maxLocalStorageSize: number; // MB
  maxIndexedDBSize: number; // MB
  defaultExpiration: number; // dias
  compressionEnabled: boolean;
  backgroundCleanup: boolean;
  preloadStrategies: ('popular' | 'recent' | 'category')[];
  invalidationStrategies: ('time' | 'version' | 'manual')[];
}

export interface TranslationRequest {
  questionId: string;
  sourceLanguage: string;
  targetLanguage: string;
  priority: 'low' | 'normal' | 'high';
  forceRefresh?: boolean;
  cacheOptions?: {
    maxAge?: number;
    preferredLayer?: 'memory' | 'localStorage' | 'indexedDB';
    compression?: boolean;
  };
}

export interface TranslationResponse {
  translatedContent: {
    questionText: string;
    options?: string[];
    explanation: string;
    category: string;
    relatedTopics: string[];
  };
  metadata: {
    cacheHit: boolean;
    cacheLayer?: 'memory' | 'localStorage' | 'indexedDB' | 'server';
    translationTime: number;
    qualityScore?: number;
    cost?: number;
  };
  performance: {
    retrievalTime: number;
    compressionRatio?: number;
    cacheSize?: number;
  };
}

export interface CacheStatistics {
  daily: {
    date: Date;
    requests: number;
    hits: number;
    misses: number;
    savings: number;
  }[];
  weekly: {
    requests: number;
    hits: number;
    misses: number;
    savings: number;
  };
  monthly: {
    requests: number;
    hits: number;
    misses: number;
    savings: number;
  };
  overall: {
    totalRequests: number;
    totalHits: number;
    totalMisses: number;
    totalSavings: number;
    averageResponseTime: number;
    cacheEfficiency: number;
  };
}

export interface CachePreloadStrategy {
  type: 'popular' | 'recent' | 'category' | 'user-pattern';
  priority: number;
  batchSize: number;
  scheduleHours: number[];
  enabled: boolean;
}

export interface CacheCleanupStrategy {
  type: 'lru' | 'lfu' | 'ttl' | 'size-based';
  threshold: number;
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  preserveRecent: boolean;
  preservePopular: boolean;
}

export interface AdvancedMemorizationData {
  questionId: string;
  difficulty: number;
  lastReviewed: Date;
  correctStreak: number;
  wrongStreak: number;
  totalReviews: number;
  averageResponseTime: number;
  easinessFactor: number;
  interval: number;
  nextReviewDate: Date;
  tags: string[];
  conceptMastery: Record<string, number>;
  studyPattern: 'visual' | 'textual' | 'practical' | 'mixed';
  confidenceLevel: number;
  memoryStrength: number;
}
