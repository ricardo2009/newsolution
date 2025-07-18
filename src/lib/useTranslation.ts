import { useState, useCallback, useEffect } from 'react';
import { Question } from '@/types';
import { useTranslationCache } from './useTranslationCache';

interface TranslationCache {
  [questionId: string]: {
    questionText: string;
    options: string[];
    explanation: string;
    category: string;
    relatedTopics: string[];
  };
}

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<TranslationCache>({});
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  
  // 🚀 Usar cache avançado de tradução
  const {
    translateQuestion: translateWithCache,
    metrics: cacheMetrics,
    preloadPopularQuestions
  } = useTranslationCache();

  // 🎯 Função principal de tradução com cache inteligente
  const translateQuestion = useCallback(async (question: Question) => {
    // Verificar cache simples primeiro (compatibilidade)
    if (translationCache[question.id]) {
      return translationCache[question.id];
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      // Usar cache avançado
      const result = await translateWithCache(question, 'pt-BR', {
        useCache: true,
        priority: 'normal'
      });

      if (result.fromCache) {
        console.log(`✅ Tradução obtida do cache (${result.cacheLayer}) em ${result.responseTime.toFixed(0)}ms`);
      } else {
        console.log(`🔄 Nova tradução realizada em ${result.responseTime.toFixed(0)}ms`);
      }

      // Salvar no cache simples para compatibilidade
      const translations = result.translation;
      setTranslationCache(prev => ({
        ...prev,
        [question.id]: translations
      }));

      return translations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setTranslationError(errorMessage);
      console.error('Erro na tradução:', error);
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, [translationCache, translateWithCache]);

  const getTranslatedQuestion = useCallback((question: Question) => {
    if (!isTranslationEnabled) {
      return question;
    }

    const translation = translationCache[question.id];
    if (!translation) {
      return question;
    }

    return {
      ...question,
      questionText: translation.questionText,
      options: translation.options,
      explanation: translation.explanation,
      category: translation.category,
      relatedTopics: translation.relatedTopics,
    };
  }, [isTranslationEnabled, translationCache]);

  const toggleTranslation = useCallback(() => {
    setIsTranslationEnabled(prev => !prev);
  }, []);

  const clearTranslationCache = useCallback(() => {
    setTranslationCache({});
    setTranslationError(null);
  }, []);

  // 🚀 Precarregar questões populares quando habilitado
  const preloadTranslations = useCallback(async (questions: Question[]) => {
    if (isTranslationEnabled && questions.length > 0) {
      console.log('🚀 Precarregando traduções populares...');
      await preloadPopularQuestions(questions, 'pt-BR', {
        maxQuestions: 30,
        priority: 'low'
      });
    }
  }, [isTranslationEnabled, preloadPopularQuestions]);

  // 🎯 Traduzir múltiplas questões em lote
  const translateBatch = useCallback(async (questions: Question[]) => {
    const results: { [key: string]: any } = {};
    
    for (const question of questions) {
      try {
        const translation = await translateQuestion(question);
        if (translation) {
          results[question.id] = translation;
        }
      } catch (error) {
        console.error(`Erro ao traduzir questão ${question.id}:`, error);
      }
    }
    
    return results;
  }, [translateQuestion]);

  return {
    isTranslating,
    translationError,
    isTranslationEnabled,
    translateQuestion,
    getTranslatedQuestion,
    toggleTranslation,
    clearTranslationCache,
    hasTranslation: (questionId: string) => !!translationCache[questionId],
    
    // 🚀 Novos recursos com cache avançado
    preloadTranslations,
    translateBatch,
    cacheMetrics,
    cacheHitRate: cacheMetrics?.hitRate || 0,
    estimatedSavings: cacheMetrics?.hitRate ? Math.round(cacheMetrics.hitRate * 100) : 0
  };
};
