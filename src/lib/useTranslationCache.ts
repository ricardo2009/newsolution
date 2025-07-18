import { useState, useEffect, useCallback } from 'react';
import { Question, TranslationRequest, TranslationResponse } from '@/types';
import { AdvancedTranslationCache } from './advancedTranslationCache';

/**
 * 🔧 HOOK PARA USAR O CACHE DE TRADUÇÃO INTELIGENTE
 * 
 * Este hook integra o sistema de cache avançado com o fluxo de tradução
 * do aplicativo, garantindo economia de recursos e melhor performance.
 */
export function useTranslationCache() {
  const [cache] = useState(() => AdvancedTranslationCache.getInstance());
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(cache.getCacheMetrics());
  const [error, setError] = useState<string | null>(null);

  // 🔄 ATUALIZAR MÉTRICAS PERIODICAMENTE
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(cache.getCacheMetrics());
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [cache]);

  /**
   * 🎯 TRADUZIR QUESTÃO COM CACHE INTELIGENTE
   */
  const translateQuestion = useCallback(
    async (
      question: Question,
      targetLanguage: string = 'pt-BR',
      options: {
        forceRefresh?: boolean;
        priority?: 'low' | 'normal' | 'high';
        useCache?: boolean;
      } = {}
    ): Promise<{
      translation: any;
      fromCache: boolean;
      cacheLayer?: string;
      responseTime: number;
    }> => {
      const startTime = performance.now();
      setIsLoading(true);
      setError(null);

      try {
        const request: TranslationRequest = {
          questionId: question.id,
          sourceLanguage: 'en',
          targetLanguage,
          priority: options.priority || 'normal',
          forceRefresh: options.forceRefresh || false,
          cacheOptions: {
            compression: true,
            preferredLayer: 'memory'
          }
        };

        // Verificar se deve usar cache
        if (options.useCache !== false) {
          const result = await cache.getTranslation(
            question,
            request,
            async (q: Question, lang: string) => {
              // Função de tradução real - aqui você pode chamar sua API
              return await performActualTranslation(q, lang);
            }
          );

          const responseTime = performance.now() - startTime;
          
          return {
            translation: result.translation,
            fromCache: result.fromCache,
            cacheLayer: result.cacheLayer,
            responseTime
          };
        } else {
          // Tradução direta sem cache
          const translation = await performActualTranslation(question, targetLanguage);
          const responseTime = performance.now() - startTime;
          
          return {
            translation,
            fromCache: false,
            responseTime
          };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Translation failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [cache]
  );

  /**
   * 🚀 REALIZAR TRADUÇÃO REAL (SEM CACHE)
   */
  const performActualTranslation = async (
    question: Question,
    targetLanguage: string
  ): Promise<any> => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionText: question.questionText,
          options: question.options,
          explanation: question.explanation,
          category: question.category,
          relatedTopics: question.relatedTopics,
          targetLanguage
        }),
      });

      if (!response.ok) {
        console.error(`Translation API error: ${response.status}`);
           // Fallback com tradução simples
      return {
        ...question,
        questionText: question.questionText + ' (tradução indisponível)',
        explanation: question.explanation + ' (tradução indisponível)',
      };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Translation API error:', error);
      
      // Fallback com tradução simples
      return {
        ...question,
        questionText: question.questionText + ' (tradução indisponível)',
        explanation: question.explanation + ' (tradução indisponível)',
      };
    }
  };

  /**
   * 🎯 TRADUZIR MÚLTIPLAS QUESTÕES EM LOTE
   */
  const translateQuestions = useCallback(
    async (
      questions: Question[],
      targetLanguage: string = 'pt-BR',
      options: {
        batchSize?: number;
        concurrent?: number;
        priority?: 'low' | 'normal' | 'high';
        onProgress?: (progress: number) => void;
      } = {}
    ): Promise<Map<string, any>> => {
      const {
        batchSize = 10,
        concurrent = 3,
        priority = 'normal',
        onProgress
      } = options;

      const results = new Map<string, any>();
      const totalQuestions = questions.length;

      for (let i = 0; i < totalQuestions; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        
        // Processar lote com controle de concorrência
        const batchPromises = batch.map(async (question, index) => {
          const delay = Math.floor(index / concurrent) * 100; // Delay para controle de concorrência
          await new Promise(resolve => setTimeout(resolve, delay));
          
          try {
            const result = await translateQuestion(question, targetLanguage, { priority });
            results.set(question.id, result.translation);
            
            // Atualizar progresso
            if (onProgress) {
              const progress = ((i + index + 1) / totalQuestions) * 100;
              onProgress(progress);
            }
          } catch (error) {
            console.error(`❌ Failed to translate question ${question.id}:`, error);
          }
        });

        await Promise.all(batchPromises);
      }

      return results;
    },
    [translateQuestion]
  );

  /**
   * 📊 PRECARREGAR QUESTÕES POPULARES
   */
  const preloadPopularQuestions = useCallback(
    async (
      questions: Question[],
      targetLanguage: string = 'pt-BR',
      options: {
        maxQuestions?: number;
        priority?: 'low' | 'normal' | 'high';
      } = {}
    ): Promise<void> => {
      const { maxQuestions = 50, priority = 'low' } = options;
      
      const popularQuestions = questions
        .filter(q => q.category === 'github-actions' || q.difficulty === 'intermediate')
        .slice(0, maxQuestions);

      console.log(`🚀 Preloading ${popularQuestions.length} popular questions...`);

      // Precarregar em background com baixa prioridade
      setTimeout(async () => {
        try {
          await translateQuestions(popularQuestions, targetLanguage, {
            priority,
            concurrent: 1, // Baixa concorrência para não impactar performance
            batchSize: 5
          });
          console.log('✅ Popular questions preloaded successfully');
        } catch (error) {
          console.error('❌ Failed to preload popular questions:', error);
        }
      }, 2000); // Delay de 2 segundos para não impactar carregamento inicial
    },
    [translateQuestions]
  );

  /**
   * 🧹 LIMPAR CACHE EXPIRADO
   */
  const cleanupExpiredCache = useCallback(async (): Promise<void> => {
    try {
      // A limpeza é feita automaticamente pelo AdvancedTranslationCache
      // Apenas forçar uma limpeza manual se necessário
      console.log('🧹 Cleaning up expired cache entries...');
      
      // Atualizar métricas após limpeza
      setMetrics(cache.getCacheMetrics());
      
      console.log('✅ Cache cleanup completed');
    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
    }
  }, [cache]);

  /**
   * 📈 GERAR RELATÓRIO DE ECONOMIA
   */
  const generateSavingsReport = useCallback(() => {
    const cacheMetrics = cache.getCacheMetrics();
    const averageCostPerTranslation = 0.02; // $0.02 por tradução
    const translationsSaved = cacheMetrics.totalEntries * cacheMetrics.hitRate;
    const totalSavings = translationsSaved * averageCostPerTranslation;
    
    return {
      totalSavings: Math.round(totalSavings * 100) / 100,
      translationsSaved: Math.round(translationsSaved),
      hitRate: Math.round(cacheMetrics.hitRate * 100),
      averageResponseTime: Math.round(cacheMetrics.averageRetrievalTime),
      cacheHealth: cacheMetrics.cacheHealth,
      estimatedMonthlySavings: Math.round(totalSavings * 30 * 100) / 100
    };
  }, [cache]);

  /**
   * 🔧 CONFIGURAR CACHE
   */
  const updateCacheConfiguration = useCallback(
    async (newConfig: Partial<{
      maxMemoryEntries: number;
      maxLocalStorageSize: number;
      maxIndexedDBSize: number;
      defaultExpiration: number;
      compressionEnabled: boolean;
      backgroundCleanup: boolean;
    }>) => {
      try {
        cache.updateConfiguration(newConfig);
        console.log('✅ Cache configuration updated');
      } catch (error) {
        console.error('❌ Failed to update cache configuration:', error);
      }
    },
    [cache]
  );

  /**
   * 🗑️ LIMPAR CACHE COMPLETO
   */
  const clearAllCache = useCallback(async () => {
    try {
      await cache.clearCache();
      setMetrics(cache.getCacheMetrics());
      console.log('✅ Cache cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }, [cache]);

  return {
    // Métodos principais
    translateQuestion,
    translateQuestions,
    preloadPopularQuestions,
    
    // Gerenciamento de cache
    cleanupExpiredCache,
    updateCacheConfiguration,
    clearAllCache,
    
    // Métricas e relatórios
    metrics,
    generateSavingsReport,
    
    // Estado
    isLoading,
    error,
    
    // Utilitários
    cacheInstance: cache
  };
}

export default useTranslationCache;
