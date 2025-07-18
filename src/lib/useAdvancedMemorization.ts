'use client';

import { useState, useEffect, useCallback } from 'react';
import { MemorizationData, Question, StudyRecommendation, LearningMetrics, UserProfile } from '@/types';
import AdvancedMemorization from '@/lib/advancedMemorization';

interface UseAdvancedMemorizationReturn {
  memorization: MemorizationData[];
  metrics: LearningMetrics | null;
  recommendations: StudyRecommendation[];
  insights: string[];
  isLoading: boolean;
  updateMemorization: (data: MemorizationData) => void;
  getQuestionsForReview: () => string[];
  getWeakCategories: () => string[];
  getNextRecommendedQuestion: (questions: Question[]) => Question | null;
  refreshMetrics: () => void;
  exportMemorizationData: () => string;
  importMemorizationData: (data: string) => boolean;
}

export const useAdvancedMemorization = (
  questions: Question[],
  userProfile: UserProfile | null
): UseAdvancedMemorizationReturn => {
  const [memorization, setMemorization] = useState<MemorizationData[]>([]);
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const advancedMemorization = AdvancedMemorization.getInstance();

  // Carregar dados do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('advanced-memorization');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setMemorization(parsed.map((item: any) => ({
          ...item,
          lastAttempt: new Date(item.lastAttempt),
          nextReviewDate: new Date(item.nextReviewDate)
        })));
      } catch (error) {
        console.error('Erro ao carregar dados de memorização:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    if (memorization.length > 0) {
      localStorage.setItem('advanced-memorization', JSON.stringify(memorization));
    }
  }, [memorization]);

  // Calcular métricas quando dados mudarem
  useEffect(() => {
    if (memorization.length > 0 && questions.length > 0) {
      setIsLoading(true);
      
      // Usar setTimeout para não bloquear a UI
      setTimeout(() => {
        const calculatedMetrics = advancedMemorization.calculateLearningMetrics(memorization, questions);
        setMetrics(calculatedMetrics);
        
        if (userProfile) {
          const generatedRecommendations = advancedMemorization.generateStudyRecommendations(
            memorization, 
            questions, 
            userProfile
          );
          setRecommendations(generatedRecommendations);
          
          const generatedInsights = advancedMemorization.generateMetacognitionInsights(
            memorization, 
            questions
          );
          setInsights(generatedInsights);
        }
        
        setIsLoading(false);
      }, 100);
    }
  }, [memorization, questions, userProfile, advancedMemorization]);

  const updateMemorization = useCallback((data: MemorizationData) => {
    setMemorization(prev => {
      const index = prev.findIndex(item => item.questionId === data.questionId);
      if (index >= 0) {
        const newMemorization = [...prev];
        newMemorization[index] = data;
        return newMemorization;
      } else {
        return [...prev, data];
      }
    });
  }, []);

  const getQuestionsForReview = useCallback(() => {
    return advancedMemorization.getQuestionsForReview(memorization);
  }, [memorization, advancedMemorization]);

  const getWeakCategories = useCallback(() => {
    if (!metrics) return [];
    
    return Object.entries(metrics.errorPatterns)
      .filter(([, stats]) => stats.rate > 0.4 && stats.attempts > 3)
      .sort(([, a], [, b]) => b.rate - a.rate)
      .map(([category]) => category);
  }, [metrics]);

  const getNextRecommendedQuestion = useCallback((availableQuestions: Question[]) => {
    // 1. Questões que precisam de revisão urgente
    const questionsForReview = getQuestionsForReview();
    if (questionsForReview.length > 0) {
      const reviewQuestion = availableQuestions.find(q => questionsForReview.includes(q.id));
      if (reviewQuestion) return reviewQuestion;
    }

    // 2. Questões de categorias fracas
    const weakCategories = getWeakCategories();
    if (weakCategories.length > 0) {
      const weakCategoryQuestion = availableQuestions.find(q => 
        weakCategories.includes(q.category || '')
      );
      if (weakCategoryQuestion) return weakCategoryQuestion;
    }

    // 3. Questões com baixa retenção
    const weakQuestions = memorization
      .filter(m => m.retentionLevel === 'weak' || m.retentionLevel === 'medium')
      .sort((a, b) => {
        const aRate = a.correctCount / a.attempts;
        const bRate = b.correctCount / b.attempts;
        return aRate - bRate;
      });

    if (weakQuestions.length > 0) {
      const weakQuestion = availableQuestions.find(q => 
        q.id === weakQuestions[0].questionId
      );
      if (weakQuestion) return weakQuestion;
    }

    // 4. Questões novas (nunca tentadas)
    const newQuestions = availableQuestions.filter(q => 
      !memorization.some(m => m.questionId === q.id)
    );
    if (newQuestions.length > 0) {
      return newQuestions[Math.floor(Math.random() * newQuestions.length)];
    }

    // 5. Questão aleatória
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }, [memorization, getQuestionsForReview, getWeakCategories]);

  const refreshMetrics = useCallback(() => {
    if (memorization.length > 0 && questions.length > 0) {
      setIsLoading(true);
      
      setTimeout(() => {
        const calculatedMetrics = advancedMemorization.calculateLearningMetrics(memorization, questions);
        setMetrics(calculatedMetrics);
        
        if (userProfile) {
          const generatedRecommendations = advancedMemorization.generateStudyRecommendations(
            memorization, 
            questions, 
            userProfile
          );
          setRecommendations(generatedRecommendations);
          
          const generatedInsights = advancedMemorization.generateMetacognitionInsights(
            memorization, 
            questions
          );
          setInsights(generatedInsights);
        }
        
        setIsLoading(false);
      }, 100);
    }
  }, [memorization, questions, userProfile, advancedMemorization]);

  const exportMemorizationData = useCallback(() => {
    const exportData = {
      memorization,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  }, [memorization]);

  const importMemorizationData = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.memorization && Array.isArray(parsed.memorization)) {
        const importedData = parsed.memorization.map((item: any) => ({
          ...item,
          lastAttempt: new Date(item.lastAttempt),
          nextReviewDate: new Date(item.nextReviewDate)
        }));
        setMemorization(importedData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }, []);

  return {
    memorization,
    metrics,
    recommendations,
    insights,
    isLoading,
    updateMemorization,
    getQuestionsForReview,
    getWeakCategories,
    getNextRecommendedQuestion,
    refreshMetrics,
    exportMemorizationData,
    importMemorizationData
  };
};

export default useAdvancedMemorization;
