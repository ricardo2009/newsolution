import { MemorizationData, Question, StudySession, UserProfile, MemoryStrength, LearningMetrics, StudyRecommendation } from '@/types';

export class AdvancedMemorization {
  private static instance: AdvancedMemorization;

  private constructor() {}

  public static getInstance(): AdvancedMemorization {
    if (!AdvancedMemorization.instance) {
      AdvancedMemorization.instance = new AdvancedMemorization();
    }
    return AdvancedMemorization.instance;
  }

  /**
   * 🧠 ALGORITMO DE REPETIÇÃO ESPAÇADA AVANÇADO
   * Baseado no SuperMemo SM-2 com melhorias
   */
  public calculateSuperMemoInterval(
    memoryData: MemorizationData,
    responseQuality: number // 0-5 (0=total blackout, 5=perfect recall)
  ): { interval: number; easeFactor: number; stability: number } {
    const minEaseFactor = 1.3;
    const maxEaseFactor = 2.5;
    let easeFactor = memoryData.easeFactor || 2.5;
    let interval = memoryData.interval || 1;

    // Atualiza fator de facilidade baseado na qualidade da resposta
    easeFactor = Math.max(
      minEaseFactor,
      Math.min(
        maxEaseFactor,
        easeFactor + (0.1 - (5 - responseQuality) * (0.08 + (5 - responseQuality) * 0.02))
      )
    );

    // Calcula próximo intervalo
    if (responseQuality < 3) {
      // Resposta ruim - reinicia
      interval = 1;
    } else if (interval === 1) {
      interval = 6; // Primeiro intervalo após aprender
    } else if (interval === 6) {
      interval = 16; // Segundo intervalo
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Calcula estabilidade da memória
    const stability = this.calculateMemoryStability(memoryData, responseQuality);

    return { interval, easeFactor, stability };
  }

  /**
   * 📊 ANÁLISE DE CURVA DE ESQUECIMENTO
   * Modela como o usuário esquece ao longo do tempo
   */
  public calculateForgettingCurve(
    memoryData: MemorizationData,
    timepoints: number[] = [1, 2, 7, 14, 30] // dias
  ): number[] {
    const { stability } = this.calculateMemoryStrength(memoryData);
    
    return timepoints.map(days => {
      // Fórmula de Ebbinghaus modificada
      const decay = Math.exp(-days / stability);
      return Math.max(0, Math.min(1, decay));
    });
  }

  /**
   * 🎯 ANÁLISE DE PADRÕES DE ERRO
   * Identifica onde o usuário está tendo mais dificuldades
   */
  public analyzeErrorPatterns(
    memorization: MemorizationData[],
    questions: Question[]
  ): { [category: string]: { errors: number; attempts: number; rate: number } } {
    const patterns: { [key: string]: { errors: number; attempts: number; rate: number } } = {};

    memorization.forEach(data => {
      const question = questions.find(q => q.id === data.questionId);
      if (!question) return;

      const category = question.category || 'unknown';
      if (!patterns[category]) {
        patterns[category] = { errors: 0, attempts: 0, rate: 0 };
      }

      patterns[category].errors += data.attempts - data.correctCount;
      patterns[category].attempts += data.attempts;
      patterns[category].rate = patterns[category].errors / patterns[category].attempts;
    });

    return patterns;
  }

  /**
   * 🔍 SISTEMA DE RECOMENDAÇÕES PERSONALIZADAS
   * Sugere o que estudar baseado no perfil do usuário
   */
  public generateStudyRecommendations(
    memorization: MemorizationData[],
    questions: Question[],
    userProfile: UserProfile
  ): StudyRecommendation[] {
    const recommendations: StudyRecommendation[] = [];
    const now = new Date();

    // 1. Questões que precisam de revisão urgente
    const overdueQuestions = memorization
      .filter(data => data.nextReviewDate <= now)
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
      .slice(0, 10);

    if (overdueQuestions.length > 0) {
      recommendations.push({
        type: 'review',
        priority: 'urgent',
        questionIds: overdueQuestions.map(q => q.questionId),
        reason: `${overdueQuestions.length} questões precisam de revisão urgente`,
        estimatedTime: overdueQuestions.length * 2,
        expectedOutcome: 'Manter retenção de conhecimento'
      });
    }

    // 2. Categorias com alta taxa de erro
    const errorPatterns = this.analyzeErrorPatterns(memorization, questions);
    const weakCategories = Object.entries(errorPatterns)
      .filter(([, stats]) => stats.rate > 0.4 && stats.attempts > 3)
      .sort((a, b) => b[1].rate - a[1].rate)
      .slice(0, 2);

    weakCategories.forEach(([category, stats]) => {
      const categoryQuestions = questions
        .filter(q => q.category === category)
        .map(q => q.id)
        .slice(0, 5);

      recommendations.push({
        type: 'focus',
        priority: 'high',
        questionIds: categoryQuestions,
        reason: `Alta taxa de erro em ${category} (${Math.round(stats.rate * 100)}%)`,
        estimatedTime: 15,
        expectedOutcome: 'Melhorar performance nesta categoria'
      });
    });

    // 3. Questões desafiadoras para consolidação
    const challengingQuestions = memorization
      .filter(data => data.retentionLevel === 'weak' && data.attempts > 2)
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 5);

    if (challengingQuestions.length > 0) {
      recommendations.push({
        type: 'challenge',
        priority: 'medium',
        questionIds: challengingQuestions.map(q => q.questionId),
        reason: 'Questões desafiadoras que precisam de mais prática',
        estimatedTime: 20,
        expectedOutcome: 'Consolidar conhecimento em pontos fracos'
      });
    }

    // 4. Pausa se estudando por muito tempo
    const totalStudyTime = userProfile.studySessions
      .filter(s => s.date.toDateString() === now.toDateString())
      .reduce((sum, s) => sum + s.duration, 0);

    if (totalStudyTime > 120) { // 2 horas
      recommendations.push({
        type: 'break',
        priority: 'medium',
        questionIds: [],
        reason: 'Você estudou por mais de 2 horas hoje',
        estimatedTime: 15,
        expectedOutcome: 'Descansar para melhor retenção'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * 🧮 CÁLCULO DE FORÇA DA MEMÓRIA
   * Determina quão bem o usuário domina cada questão
   */
  public calculateMemoryStrength(data: MemorizationData): MemoryStrength {
    const accuracy = data.correctCount / data.attempts;
    const recentPerformance = this.getRecentPerformance(data);
    const daysSinceLastAttempt = (Date.now() - data.lastAttempt.getTime()) / (1000 * 60 * 60 * 24);

    // Força de recordação baseada na precisão e performance recente
    const recall = Math.min(1, (accuracy * 0.7) + (recentPerformance * 0.3));
    
    // Estabilidade baseada no intervalo atual e histórico
    const stability = this.calculateMemoryStability(data, recall * 5);
    
    // Dificuldade percebida baseada no número de tentativas
    const difficulty = Math.min(10, Math.max(1, 11 - (accuracy * 10)));
    
    // Retrievabilidade baseada na curva de esquecimento
    const retrievability = Math.exp(-daysSinceLastAttempt / stability);

    return {
      recall,
      stability,
      difficulty,
      retrievability: Math.max(0, Math.min(1, retrievability))
    };
  }

  /**
   * 📈 MÉTRICAS DE APRENDIZADO
   * Analisa a eficiência do aprendizado do usuário
   */
  public calculateLearningMetrics(
    memorization: MemorizationData[],
    questions: Question[]
  ): LearningMetrics {
    const timepoints = [1, 2, 7, 14, 30];
    const avgForgettingCurve = this.calculateAverageForgettingCurve(memorization, timepoints);
    const optimalIntervals = this.calculateOptimalIntervals(memorization);
    const errorPatterns = this.analyzeErrorPatterns(memorization, questions);
    
    // Eficiência de estudo: quantas questões são dominadas vs tentativas
    const masteredQuestions = memorization.filter(d => d.retentionLevel === 'mastered').length;
    const totalAttempts = memorization.reduce((sum, d) => sum + d.attempts, 0);
    const studyEfficiency = totalAttempts > 0 ? masteredQuestions / totalAttempts : 0;

    // Taxa de retenção geral
    const totalCorrect = memorization.reduce((sum, d) => sum + d.correctCount, 0);
    const retentionRate = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    // Carga cognitiva baseada na dificuldade média
    const avgDifficulty = memorization.reduce((sum, d) => {
      const strength = this.calculateMemoryStrength(d);
      return sum + strength.difficulty;
    }, 0) / memorization.length;
    const cognitiveLoad = avgDifficulty / 10;

    return {
      forgettingCurve: avgForgettingCurve,
      optimalIntervals,
      errorPatterns,
      studyEfficiency,
      retentionRate,
      cognitiveLoad
    };
  }

  /**
   * 🎯 SISTEMA DE METACOGNIÇÃO
   * Ajuda o usuário a entender como está aprendendo
   */
  public generateMetacognitionInsights(
    memorization: MemorizationData[],
    questions: Question[]
  ): string[] {
    const insights: string[] = [];
    const metrics = this.calculateLearningMetrics(memorization, questions);

    // Insights sobre eficiência
    if (metrics.studyEfficiency > 0.7) {
      insights.push("🎯 Você está aprendendo com alta eficiência! Continue assim.");
    } else if (metrics.studyEfficiency < 0.3) {
      insights.push("💡 Considere revisar suas estratégias de estudo. Você pode estar tentando aprender muito rápido.");
    }

    // Insights sobre retenção
    if (metrics.retentionRate > 0.8) {
      insights.push("🧠 Excelente retenção! Você está consolidando bem o conhecimento.");
    } else if (metrics.retentionRate < 0.5) {
      insights.push("📚 Sua retenção pode melhorar. Tente espaçar mais suas sessões de estudo.");
    }

    // Insights sobre carga cognitiva
    if (metrics.cognitiveLoad > 0.7) {
      insights.push("⚡ Você está enfrentando conteúdo desafiador. Considere fazer pausas mais frequentes.");
    } else if (metrics.cognitiveLoad < 0.3) {
      insights.push("🚀 Você pode estar pronto para conteúdo mais avançado!");
    }

    // Insights sobre padrões de erro
    const errorCategories = Object.entries(metrics.errorPatterns)
      .filter(([, stats]) => stats.rate > 0.4)
      .map(([category]) => category);

    if (errorCategories.length > 0) {
      insights.push(`🔍 Foque mais em: ${errorCategories.join(', ')}`);
    }

    return insights;
  }

  /**
   * 🔍 QUESTÕES PARA REVISÃO
   * Retorna questões que precisam ser revisadas hoje
   */
  public getQuestionsForReview(memorization: MemorizationData[]): string[] {
    const today = new Date();
    return memorization
      .filter(data => data.nextReviewDate <= today)
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
      .map(data => data.questionId);
  }

  // Métodos auxiliares privados
  private calculateMemoryStability(data: MemorizationData, responseQuality: number): number {
    const baseStability = 2; // dias
    const accuracyBonus = (data.correctCount / data.attempts) * 5;
    const qualityBonus = responseQuality * 0.5;
    return Math.max(1, baseStability + accuracyBonus + qualityBonus);
  }

  private getRecentPerformance(data: MemorizationData): number {
    const recent = data.confidenceHistory.slice(-3);
    const confidenceMap = { low: 0.3, medium: 0.6, high: 0.9 };
    return recent.reduce((sum, conf) => sum + confidenceMap[conf], 0) / recent.length;
  }

  private calculateAverageForgettingCurve(
    memorization: MemorizationData[],
    timepoints: number[]
  ): number[] {
    const curves = memorization.map(data => this.calculateForgettingCurve(data, timepoints));
    return timepoints.map((_, i) => {
      const sum = curves.reduce((acc, curve) => acc + curve[i], 0);
      return sum / curves.length;
    });
  }

  private calculateOptimalIntervals(memorization: MemorizationData[]): number[] {
    // Calcula intervalos ideais baseados no desempenho histórico
    const intervals = [1, 3, 7, 14, 30, 90]; // dias
    return intervals.map(interval => {
      const performance = memorization
        .filter(d => d.interval && Math.abs(d.interval - interval) < 2)
        .reduce((sum, d) => sum + (d.correctCount / d.attempts), 0);
      return performance;
    });
  }
}

export default AdvancedMemorization;
