import { GameStats, Badge, Achievement, Challenge, MemorizationData, StudySession, UserProfile } from '@/types';

export class GamificationSystem {
  private static instance: GamificationSystem;
  private userProfile: UserProfile | null = null;

  private constructor() {}

  public static getInstance(): GamificationSystem {
    if (!GamificationSystem.instance) {
      GamificationSystem.instance = new GamificationSystem();
    }
    return GamificationSystem.instance;
  }

  // 🎯 LEVEL & EXPERIENCE SYSTEM
  public calculateLevel(experience: number): number {
    // Fórmula: Level = √(experience / 100)
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  public calculateExperienceToNextLevel(level: number): number {
    // Experiência necessária para o próximo nível
    const nextLevelExp = Math.pow(level, 2) * 100;
    return nextLevelExp;
  }

  public calculateExperiencePoints(
    isCorrect: boolean,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    timeSpent: number,
    wasRevealed: boolean = false,
    streak: number = 0
  ): number {
    let basePoints = 0;
    
    if (isCorrect) {
      // Pontos base por dificuldade
      switch (difficulty) {
        case 'beginner':
          basePoints = 10;
          break;
        case 'intermediate':
          basePoints = 20;
          break;
        case 'advanced':
          basePoints = 30;
          break;
      }

      // Bonus por velocidade (máximo 50% bonus)
      const speedBonus = Math.min(0.5, Math.max(0, (60 - timeSpent) / 120));
      basePoints += Math.floor(basePoints * speedBonus);

      // Multiplicador de streak
      if (streak > 0) {
        const streakMultiplier = 1 + Math.min(0.5, streak * 0.1);
        basePoints = Math.floor(basePoints * streakMultiplier);
      }
    }

    // Penalidade por revelar resposta (mas ainda ganha alguns pontos para incentivar aprendizado)
    if (wasRevealed) {
      basePoints = Math.floor(basePoints * 0.3);
    }

    return Math.max(1, basePoints); // Mínimo 1 ponto por tentar
  }

  // 🏆 BADGES SYSTEM
  public getAvailableBadges(): Badge[] {
    return [
      // Performance Badges
      {
        id: 'first-correct',
        name: 'Primeira Vitória',
        description: 'Acerte sua primeira questão',
        icon: '🎯',
        category: 'performance',
        earnedAt: new Date(),
        color: '#10B981'
      },
      {
        id: 'workflow-master',
        name: 'Mestre dos Workflows',
        description: 'Acerte 10 questões de Workflows consecutivamente',
        icon: '⚡',
        category: 'knowledge',
        earnedAt: new Date(),
        color: '#3B82F6'
      },
      {
        id: 'security-expert',
        name: 'Especialista em Segurança',
        description: 'Acerte 15 questões de Security',
        icon: '🔒',
        category: 'knowledge',
        earnedAt: new Date(),
        color: '#EF4444'
      },
      {
        id: 'speed-demon',
        name: 'Demônio da Velocidade',
        description: 'Responda 5 questões em menos de 10 segundos cada',
        icon: '⚡',
        category: 'performance',
        earnedAt: new Date(),
        color: '#F59E0B'
      },
      {
        id: 'perfectionist',
        name: 'Perfeccionista',
        description: 'Acerte 20 questões seguidas sem errar',
        icon: '💎',
        category: 'performance',
        earnedAt: new Date(),
        color: '#8B5CF6',
        isRare: true
      },
      // Dedication Badges
      {
        id: 'daily-warrior',
        name: 'Guerreiro Diário',
        description: 'Estude por 7 dias consecutivos',
        icon: '🔥',
        category: 'dedication',
        earnedAt: new Date(),
        color: '#F97316'
      },
      {
        id: 'week-champion',
        name: 'Campeão da Semana',
        description: 'Complete 50 questões em uma semana',
        icon: '👑',
        category: 'dedication',
        earnedAt: new Date(),
        color: '#FFD700'
      },
      {
        id: 'comeback-kid',
        name: 'Retorno Triunfante',
        description: 'Volte a estudar após uma pausa de 7 dias',
        icon: '🎭',
        category: 'dedication',
        earnedAt: new Date(),
        color: '#06B6D4'
      },
      // Special Badges
      {
        id: 'early-bird',
        name: 'Madrugador',
        description: 'Estude antes das 7h da manhã',
        icon: '🌅',
        category: 'special',
        earnedAt: new Date(),
        color: '#F472B6'
      },
      {
        id: 'night-owl',
        name: 'Coruja Noturna',
        description: 'Estude após 23h',
        icon: '🦉',
        category: 'special',
        earnedAt: new Date(),
        color: '#6366F1'
      }
    ];
  }

  // 🎖️ ACHIEVEMENTS SYSTEM
  public getAvailableAchievements(): Achievement[] {
    return [
      {
        id: 'milestone-10',
        name: 'Primeiros 10',
        description: 'Responda 10 questões',
        icon: '🎯',
        type: 'milestone',
        target: 10,
        current: 0,
        isCompleted: false,
        reward: { experience: 50 }
      },
      {
        id: 'milestone-100',
        name: 'Centenário',
        description: 'Responda 100 questões',
        icon: '💯',
        type: 'milestone',
        target: 100,
        current: 0,
        isCompleted: false,
        reward: { experience: 500 }
      },
      {
        id: 'streak-5',
        name: 'Sequência de 5',
        description: 'Acerte 5 questões seguidas',
        icon: '🔥',
        type: 'streak',
        target: 5,
        current: 0,
        isCompleted: false,
        reward: { experience: 100 }
      },
      {
        id: 'streak-20',
        name: 'Sequência Lendária',
        description: 'Acerte 20 questões seguidas',
        icon: '🌟',
        type: 'streak',
        target: 20,
        current: 0,
        isCompleted: false,
        reward: { experience: 1000 }
      },
      {
        id: 'accuracy-90',
        name: 'Quase Perfeito',
        description: 'Mantenha 90% de acertos em 50 questões',
        icon: '🎪',
        type: 'performance',
        target: 90,
        current: 0,
        isCompleted: false,
        reward: { experience: 750 }
      },
      {
        id: 'category-master',
        name: 'Mestre de Categoria',
        description: 'Domine uma categoria (95% de acertos)',
        icon: '🏆',
        type: 'performance',
        target: 95,
        current: 0,
        isCompleted: false,
        reward: { experience: 500 }
      }
    ];
  }

  // 🎯 CHALLENGES SYSTEM
  public getDailyChallenges(): Challenge[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return [
      {
        id: 'daily-10',
        name: 'Desafio Diário',
        description: 'Responda 10 questões hoje',
        type: 'daily',
        target: 10,
        current: 0,
        deadline: tomorrow,
        reward: { experience: 50 },
        isCompleted: false
      },
      {
        id: 'daily-accuracy',
        name: 'Precisão Diária',
        description: 'Mantenha 80% de acertos hoje',
        type: 'daily',
        target: 80,
        current: 0,
        deadline: tomorrow,
        reward: { experience: 75 },
        isCompleted: false
      },
      {
        id: 'daily-category',
        name: 'Foco Categórico',
        description: 'Responda 5 questões da mesma categoria',
        type: 'daily',
        target: 5,
        current: 0,
        deadline: tomorrow,
        reward: { experience: 40 },
        isCompleted: false
      }
    ];
  }

  // 🧠 SPACED REPETITION SYSTEM
  public calculateNextReviewDate(
    lastAttempt: Date,
    isCorrect: boolean,
    previousInterval: number = 1
  ): Date {
    const nextReview = new Date(lastAttempt);
    let interval = previousInterval;

    if (isCorrect) {
      // Aumenta o intervalo se acertou
      interval = Math.min(interval * 2.5, 30); // Máximo 30 dias
    } else {
      // Diminui o intervalo se errou
      interval = Math.max(interval * 0.5, 1); // Mínimo 1 dia
    }

    nextReview.setDate(nextReview.getDate() + Math.floor(interval));
    return nextReview;
  }

  public getQuestionsForReview(memorization: MemorizationData[]): string[] {
    const today = new Date();
    return memorization
      .filter(data => data.nextReviewDate <= today)
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
      .map(data => data.questionId);
  }

  // 📊 PROGRESS TRACKING
  public updateMemorizationData(
    questionId: string,
    isCorrect: boolean,
    confidence: 'low' | 'medium' | 'high',
    memorization: MemorizationData[]
  ): MemorizationData {
    const existing = memorization.find(m => m.questionId === questionId);
    const now = new Date();

    if (existing) {
      return {
        ...existing,
        attempts: existing.attempts + 1,
        correctCount: existing.correctCount + (isCorrect ? 1 : 0),
        lastAttempt: now,
        nextReviewDate: this.calculateNextReviewDate(now, isCorrect, 1),
        difficultyMultiplier: this.calculateDifficultyMultiplier(existing.correctCount, existing.attempts),
        retentionLevel: this.calculateRetentionLevel(existing.correctCount, existing.attempts),
        confidenceHistory: [...existing.confidenceHistory, confidence].slice(-10) // Últimas 10
      };
    }

    return {
      questionId,
      attempts: 1,
      correctCount: isCorrect ? 1 : 0,
      lastAttempt: now,
      nextReviewDate: this.calculateNextReviewDate(now, isCorrect, 1),
      difficultyMultiplier: 1,
      retentionLevel: isCorrect ? 'medium' : 'weak',
      confidenceHistory: [confidence]
    };
  }

  private calculateDifficultyMultiplier(correct: number, total: number): number {
    const accuracy = correct / total;
    if (accuracy >= 0.9) return 0.5; // Mais fácil
    if (accuracy >= 0.7) return 0.75;
    if (accuracy >= 0.5) return 1;
    return 1.5; // Mais difícil
  }

  private calculateRetentionLevel(correct: number, total: number): 'weak' | 'medium' | 'strong' | 'mastered' {
    const accuracy = correct / total;
    if (accuracy >= 0.95 && total >= 5) return 'mastered';
    if (accuracy >= 0.8) return 'strong';
    if (accuracy >= 0.6) return 'medium';
    return 'weak';
  }

  // 💾 PERSISTENCE
  public saveUserProfile(profile: UserProfile): void {
    localStorage.setItem('gh200-user-profile', JSON.stringify(profile));
  }

  public loadUserProfile(): UserProfile | null {
    const stored = localStorage.getItem('gh200-user-profile');
    if (!stored) return null;

    try {
      const profile = JSON.parse(stored);
      // Converter strings de data de volta para Date objects
      profile.createdAt = new Date(profile.createdAt);
      profile.lastLoginAt = new Date(profile.lastLoginAt);
      profile.gameStats.lastActivityDate = new Date(profile.gameStats.lastActivityDate);
      return profile;
    } catch {
      return null;
    }
  }

  public createDefaultProfile(username: string): UserProfile {
    const now = new Date();
    return {
      id: Date.now().toString(),
      username,
      createdAt: now,
      lastLoginAt: now,
      gameStats: {
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        dailyStreak: 0,
        questionsAnswered: 0,
        questionsCorrect: 0,
        averageAccuracy: 0,
        totalTimeSpent: 0,
        badges: [],
        achievements: this.getAvailableAchievements(),
        lastActivityDate: now
      },
      memorization: [],
      challenges: this.getDailyChallenges(),
      studySessions: [],
      preferences: {
        dailyGoal: 10,
        enableNotifications: true,
        preferredDifficulty: 'mixed',
        studyReminders: true
      }
    };
  }
}

export default GamificationSystem;
