import { useState, useEffect, useCallback } from 'react';
import { UserProfile, GameStats, Badge, Achievement, Challenge, MemorizationData } from '@/types';
import GamificationSystem from './gamificationSystem';

interface UseGamificationReturn {
  userProfile: UserProfile | null;
  gameStats: GameStats | null;
  isLoading: boolean;
  
  // Actions
  initializeUser: (username: string) => void;
  recordAnswer: (
    questionId: string,
    isCorrect: boolean,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    timeSpent: number,
    wasRevealed?: boolean,
    confidence?: 'low' | 'medium' | 'high'
  ) => Promise<{
    experienceGained: number;
    levelUp?: number;
    badgeEarned?: Badge;
    achievementUnlocked?: Achievement;
    streakBroken?: boolean;
  }>;
  
  // Memorization
  getQuestionsForReview: () => string[];
  updateDailyStreak: () => void;
  
  // Challenges
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'levelUp' | 'badge' | 'achievement' | 'streak';
    data: any;
  }>;
  dismissNotification: (id: string) => void;
}

export const useGamification = (): UseGamificationReturn => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'levelUp' | 'badge' | 'achievement' | 'streak';
    data: any;
  }>>([]);

  const gamificationSystem = GamificationSystem.getInstance();

  // Initialize user profile
  const initializeUser = useCallback((username: string) => {
    let profile = gamificationSystem.loadUserProfile();
    
    if (!profile) {
      profile = gamificationSystem.createDefaultProfile(username);
      gamificationSystem.saveUserProfile(profile);
    }
    
    // Update daily streak
    const today = new Date();
    const lastActivity = new Date(profile.gameStats.lastActivityDate);
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      profile.gameStats.dailyStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      profile.gameStats.dailyStreak = 1;
    }
    
    profile.gameStats.lastActivityDate = today;
    profile.lastLoginAt = today;
    
    setUserProfile(profile);
    setIsLoading(false);
  }, [gamificationSystem]);

  // Record answer and update gamification
  const recordAnswer = useCallback(async (
    questionId: string,
    isCorrect: boolean,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    timeSpent: number,
    wasRevealed: boolean = false,
    confidence: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    if (!userProfile) return { experienceGained: 0 };

    const updatedProfile = { ...userProfile };
    const gameStats = updatedProfile.gameStats;
    
    // Calculate experience points
    const experienceGained = gamificationSystem.calculateExperiencePoints(
      isCorrect,
      difficulty,
      timeSpent,
      wasRevealed,
      gameStats.currentStreak
    );

    // Update basic stats
    gameStats.questionsAnswered += 1;
    if (isCorrect) {
      gameStats.questionsCorrect += 1;
      gameStats.currentStreak += 1;
      gameStats.longestStreak = Math.max(gameStats.longestStreak, gameStats.currentStreak);
    } else {
      gameStats.currentStreak = 0;
    }

    // Update experience and level
    const oldLevel = gameStats.level;
    gameStats.experience += experienceGained;
    gameStats.totalPoints += experienceGained;
    gameStats.level = gamificationSystem.calculateLevel(gameStats.experience);
    gameStats.experienceToNextLevel = gamificationSystem.calculateExperienceToNextLevel(gameStats.level);
    
    // Update accuracy
    gameStats.averageAccuracy = (gameStats.questionsCorrect / gameStats.questionsAnswered) * 100;
    
    // Update memorization data
    const memorizationData = gamificationSystem.updateMemorizationData(
      questionId,
      isCorrect,
      confidence,
      updatedProfile.memorization
    );
    
    const existingIndex = updatedProfile.memorization.findIndex(m => m.questionId === questionId);
    if (existingIndex >= 0) {
      updatedProfile.memorization[existingIndex] = memorizationData;
    } else {
      updatedProfile.memorization.push(memorizationData);
    }

    // Check for level up
    let levelUp: number | undefined;
    if (gameStats.level > oldLevel) {
      levelUp = gameStats.level;
      addNotification('levelUp', { level: gameStats.level });
    }

    // Check for new badges
    let badgeEarned: Badge | undefined;
    const newBadges = checkForNewBadges(updatedProfile);
    if (newBadges.length > 0) {
      badgeEarned = newBadges[0];
      gameStats.badges.push(...newBadges);
      addNotification('badge', { badge: badgeEarned });
    }

    // Check for achievements
    let achievementUnlocked: Achievement | undefined;
    const unlockedAchievements = updateAchievements(updatedProfile);
    if (unlockedAchievements.length > 0) {
      achievementUnlocked = unlockedAchievements[0];
      addNotification('achievement', { achievement: achievementUnlocked });
    }

    // Check for streak milestones
    if (isCorrect && gameStats.currentStreak > 0 && gameStats.currentStreak % 5 === 0) {
      addNotification('streak', { streak: gameStats.currentStreak });
    }

    setUserProfile(updatedProfile);
    gamificationSystem.saveUserProfile(updatedProfile);

    return {
      experienceGained,
      levelUp,
      badgeEarned,
      achievementUnlocked,
      streakBroken: !isCorrect && gameStats.currentStreak === 0
    };
  }, [userProfile, gamificationSystem]);

  // Check for new badges
  const checkForNewBadges = (profile: UserProfile): Badge[] => {
    const newBadges: Badge[] = [];
    const stats = profile.gameStats;
    const earnedBadgeIds = stats.badges.map(b => b.id);
    
    // First correct answer
    if (stats.questionsCorrect >= 1 && !earnedBadgeIds.includes('first-correct')) {
      newBadges.push({
        id: 'first-correct',
        name: 'Primeira Vitória',
        description: 'Acerte sua primeira questão',
        icon: '🎯',
        category: 'performance',
        earnedAt: new Date(),
        color: '#10B981'
      });
    }

    // Daily warrior (7 day streak)
    if (stats.dailyStreak >= 7 && !earnedBadgeIds.includes('daily-warrior')) {
      newBadges.push({
        id: 'daily-warrior',
        name: 'Guerreiro Diário',
        description: 'Estude por 7 dias consecutivos',
        icon: '🔥',
        category: 'dedication',
        earnedAt: new Date(),
        color: '#F97316'
      });
    }

    // Perfectionist (20 streak)
    if (stats.longestStreak >= 20 && !earnedBadgeIds.includes('perfectionist')) {
      newBadges.push({
        id: 'perfectionist',
        name: 'Perfeccionista',
        description: 'Acerte 20 questões seguidas sem errar',
        icon: '💎',
        category: 'performance',
        earnedAt: new Date(),
        color: '#8B5CF6',
        isRare: true
      });
    }

    return newBadges;
  };

  // Update achievements
  const updateAchievements = (profile: UserProfile): Achievement[] => {
    const unlocked: Achievement[] = [];
    
    profile.gameStats.achievements.forEach(achievement => {
      if (achievement.isCompleted) return;
      
      let newCurrent = achievement.current;
      
      switch (achievement.id) {
        case 'milestone-10':
          newCurrent = profile.gameStats.questionsAnswered;
          break;
        case 'milestone-100':
          newCurrent = profile.gameStats.questionsAnswered;
          break;
        case 'streak-5':
          newCurrent = profile.gameStats.currentStreak;
          break;
        case 'streak-20':
          newCurrent = profile.gameStats.longestStreak;
          break;
        case 'accuracy-90':
          newCurrent = Math.round(profile.gameStats.averageAccuracy);
          break;
      }
      
      achievement.current = newCurrent;
      
      if (achievement.current >= achievement.target && !achievement.isCompleted) {
        achievement.isCompleted = true;
        achievement.completedAt = new Date();
        profile.gameStats.experience += achievement.reward.experience;
        unlocked.push(achievement);
      }
    });
    
    return unlocked;
  };

  // Add notification
  const addNotification = (type: 'levelUp' | 'badge' | 'achievement' | 'streak', data: any) => {
    const notification = {
      id: Date.now().toString(),
      type,
      data
    };
    
    setNotifications(prev => [...prev, notification]);
  };

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Get questions for review
  const getQuestionsForReview = useCallback(() => {
    if (!userProfile) return [];
    return gamificationSystem.getQuestionsForReview(userProfile.memorization);
  }, [userProfile, gamificationSystem]);

  // Update daily streak
  const updateDailyStreak = useCallback(() => {
    if (!userProfile) return;
    
    const updatedProfile = { ...userProfile };
    const today = new Date();
    const lastActivity = new Date(updatedProfile.gameStats.lastActivityDate);
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 1) {
      updatedProfile.gameStats.dailyStreak += 1;
      updatedProfile.gameStats.lastActivityDate = today;
      setUserProfile(updatedProfile);
      gamificationSystem.saveUserProfile(updatedProfile);
    }
  }, [userProfile, gamificationSystem]);

  // Update challenge progress
  const updateChallengeProgress = useCallback((challengeId: string, progress: number) => {
    if (!userProfile) return;
    
    const updatedProfile = { ...userProfile };
    const challenge = updatedProfile.challenges.find(c => c.id === challengeId);
    
    if (challenge && !challenge.isCompleted) {
      challenge.current = Math.min(challenge.current + progress, challenge.target);
      
      if (challenge.current >= challenge.target) {
        challenge.isCompleted = true;
        challenge.completedAt = new Date();
        updatedProfile.gameStats.experience += challenge.reward.experience;
        
        addNotification('achievement', { achievement: challenge });
      }
      
      setUserProfile(updatedProfile);
      gamificationSystem.saveUserProfile(updatedProfile);
    }
  }, [userProfile, gamificationSystem]);

  // Load user profile on mount
  useEffect(() => {
    const storedProfile = gamificationSystem.loadUserProfile();
    if (storedProfile) {
      setUserProfile(storedProfile);
    }
    setIsLoading(false);
  }, [gamificationSystem]);

  return {
    userProfile,
    gameStats: userProfile?.gameStats || null,
    isLoading,
    initializeUser,
    recordAnswer,
    getQuestionsForReview,
    updateDailyStreak,
    updateChallengeProgress,
    notifications,
    dismissNotification
  };
};

export default useGamification;
