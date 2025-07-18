import { TranslationCacheEntry, CacheMetrics, CacheConfiguration, TranslationRequest, Question } from '@/types';
import { compress, decompress } from 'lz-string';

/**
 * 🚀 SISTEMA AVANÇADO DE CACHE PARA TRADUÇÕES
 * 
 * Features:
 * - Multi-layer cache (Memory → localStorage → IndexedDB)
 * - Intelligent cache validation (hash-based)
 * - Automatic expiration and cleanup
 * - Performance monitoring
 * - Compression for storage optimization
 * - Background preloading
 * - Cache warming strategies
 */
export class AdvancedTranslationCache {
  private static instance: AdvancedTranslationCache;
  private memoryCache: Map<string, TranslationCacheEntry> = new Map();
  private dbName = 'translation_cache_db';
  private dbVersion = 1;
  private config: CacheConfiguration;
  private metrics: CacheMetrics;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      maxMemoryEntries: 100,
      maxLocalStorageSize: 10, // MB
      maxIndexedDBSize: 50, // MB
      defaultExpiration: 30, // dias
      compressionEnabled: true,
      backgroundCleanup: true,
      preloadStrategies: ['popular', 'recent'],
      invalidationStrategies: ['time', 'version']
    };

    this.metrics = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      averageRetrievalTime: 0,
      cacheHealth: 'good',
      layerDistribution: {
        memory: 0,
        localStorage: 0,
        indexedDB: 0,
        server: 0
      }
    };

    this.initializeCache();
  }

  public static getInstance(): AdvancedTranslationCache {
    if (!AdvancedTranslationCache.instance) {
      AdvancedTranslationCache.instance = new AdvancedTranslationCache();
    }
    return AdvancedTranslationCache.instance;
  }

  /**
   * 🔧 INICIALIZAÇÃO DO SISTEMA DE CACHE
   */
  private async initializeCache(): Promise<void> {
    try {
      // Inicializar IndexedDB
      await this.initializeIndexedDB();
      
      // Carregar configurações salvas
      await this.loadConfiguration();
      
      // Carregar métricas
      await this.loadMetrics();
      
      // Iniciar limpeza automática
      if (this.config.backgroundCleanup) {
        this.startBackgroundCleanup();
      }
      
      // Preload estratégico
      await this.performStrategicPreload();
      
      console.log('✅ Advanced Translation Cache initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize translation cache:', error);
    }
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: OBTER TRADUÇÃO COM CACHE INTELIGENTE
   */
  public async getTranslation(
    question: Question,
    request: TranslationRequest,
    translateFunction: (question: Question, targetLang: string) => Promise<any>
  ): Promise<{ translation: any; fromCache: boolean; cacheLayer?: string }> {
    const startTime = performance.now();
    
    try {
      // Gerar hash do conteúdo para validação
      const sourceHash = this.generateContentHash(question);
      const cacheKey = this.generateCacheKey(question.id, request.sourceLanguage, request.targetLanguage, sourceHash);
      
      // Buscar no cache (multi-layer)
      const cachedTranslation = await this.getCachedTranslation(cacheKey, request);
      
      if (cachedTranslation && !request.forceRefresh) {
        // Cache hit - atualizar métricas
        await this.updateCacheMetrics(true, performance.now() - startTime, cachedTranslation.performance.cacheLayer);
        
        // Marcar como usado
        await this.markAsUsed(cacheKey);
        
        return {
          translation: cachedTranslation.translatedContent,
          fromCache: true,
          cacheLayer: cachedTranslation.performance.cacheLayer
        };
      }
      
      // Cache miss - realizar tradução
      console.log(`🔄 Cache miss for ${cacheKey}, fetching translation...`);
      
      const translation = await translateFunction(question, request.targetLanguage);
      const translationTime = performance.now() - startTime;
      
      // Criar entrada de cache
      const cacheEntry: TranslationCacheEntry = {
        id: cacheKey,
        sourceHash,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        originalContent: {
          questionText: question.questionText,
          options: question.options,
          explanation: question.explanation,
          category: question.category,
          relatedTopics: question.relatedTopics
        },
        translatedContent: translation,
        metadata: {
          createdAt: new Date(),
          lastUsed: new Date(),
          useCount: 1,
          version: '1.0',
          translationProvider: 'openai',
          qualityScore: this.calculateQualityScore(question, translation),
          expiresAt: new Date(Date.now() + this.config.defaultExpiration * 24 * 60 * 60 * 1000)
        },
        performance: {
          translationTime,
          cacheHit: false,
          cacheLayer: 'memory'
        }
      };
      
      // Salvar no cache
      await this.setCachedTranslation(cacheKey, cacheEntry, request);
      
      // Atualizar métricas
      await this.updateCacheMetrics(false, translationTime);
      
      return {
        translation,
        fromCache: false
      };
      
    } catch (error) {
      console.error('❌ Error in translation cache:', error);
      
      // Fallback: tentar buscar tradução sem cache
      const translation = await translateFunction(question, request.targetLanguage);
      return {
        translation,
        fromCache: false
      };
    }
  }

  /**
   * 🔍 BUSCAR TRADUÇÃO NO CACHE (MULTI-LAYER)
   */
  private async getCachedTranslation(cacheKey: string, request: TranslationRequest): Promise<TranslationCacheEntry | null> {
    try {
      // Layer 1: Memory Cache (mais rápido)
      if (this.memoryCache.has(cacheKey)) {
        const entry = this.memoryCache.get(cacheKey)!;
        if (this.isValidCacheEntry(entry)) {
          entry.performance.cacheLayer = 'memory';
          return entry;
        } else {
          this.memoryCache.delete(cacheKey);
        }
      }
      
      // Layer 2: localStorage (persistente)
      const localStorageEntry = await this.getFromLocalStorage(cacheKey);
      if (localStorageEntry && this.isValidCacheEntry(localStorageEntry)) {
        // Promover para memory cache
        this.memoryCache.set(cacheKey, localStorageEntry);
        localStorageEntry.performance.cacheLayer = 'localStorage';
        return localStorageEntry;
      }
      
      // Layer 3: IndexedDB (para grandes volumes)
      const indexedDBEntry = await this.getFromIndexedDB(cacheKey);
      if (indexedDBEntry && this.isValidCacheEntry(indexedDBEntry)) {
        // Promover para camadas superiores
        this.memoryCache.set(cacheKey, indexedDBEntry);
        await this.setToLocalStorage(cacheKey, indexedDBEntry);
        indexedDBEntry.performance.cacheLayer = 'indexedDB';
        return indexedDBEntry;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting cached translation:', error);
      return null;
    }
  }

  /**
   * 💾 SALVAR TRADUÇÃO NO CACHE
   */
  private async setCachedTranslation(cacheKey: string, entry: TranslationCacheEntry, request: TranslationRequest): Promise<void> {
    try {
      // Sempre salvar no memory cache
      this.memoryCache.set(cacheKey, entry);
      
      // Limpar memory cache se necessário
      if (this.memoryCache.size > this.config.maxMemoryEntries) {
        await this.cleanupMemoryCache();
      }
      
      // Salvar no localStorage
      await this.setToLocalStorage(cacheKey, entry);
      
      // Salvar no IndexedDB para traduções importantes
      if (request.priority === 'high' || entry.metadata.qualityScore && entry.metadata.qualityScore > 0.8) {
        await this.setToIndexedDB(cacheKey, entry);
      }
      
    } catch (error) {
      console.error('❌ Error setting cached translation:', error);
    }
  }

  /**
   * 🧮 GERAR HASH DO CONTEÚDO
   */
  private generateContentHash(question: Question): string {
    const content = {
      questionText: question.questionText,
      options: question.options,
      explanation: question.explanation,
      category: question.category,
      relatedTopics: question.relatedTopics
    };
    
    const contentString = JSON.stringify(content);
    return this.simpleHash(contentString);
  }

  /**
   * 🔑 GERAR CHAVE DE CACHE
   */
  private generateCacheKey(questionId: string, sourceLang: string, targetLang: string, sourceHash: string): string {
    return `${questionId}_${sourceLang}_${targetLang}_${sourceHash}`;
  }

  /**
   * ✅ VALIDAR ENTRADA DE CACHE
   */
  private isValidCacheEntry(entry: TranslationCacheEntry): boolean {
    // Verificar expiração
    if (entry.metadata.expiresAt && new Date() > entry.metadata.expiresAt) {
      return false;
    }
    
    // Verificar integridade
    if (!entry.translatedContent || !entry.sourceHash) {
      return false;
    }
    
    return true;
  }

  /**
   * 📊 CALCULAR PONTUAÇÃO DE QUALIDADE
   */
  private calculateQualityScore(original: Question, translation: any): number {
    let score = 0.5; // Base score
    
    // Verificar se todos os campos foram traduzidos
    if (translation.questionText) score += 0.2;
    if (translation.explanation) score += 0.2;
    if (translation.options && translation.options.length > 0) score += 0.1;
    
    return Math.min(score, 1);
  }

  /**
   * 🗂️ OPERAÇÕES DO LOCALSTORAGE
   */
  private async getFromLocalStorage(cacheKey: string): Promise<TranslationCacheEntry | null> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      
      const compressed = localStorage.getItem(`translation_cache_${cacheKey}`);
      if (!compressed) return null;
      
      const decompressed = this.config.compressionEnabled ? decompress(compressed) : compressed;
      return JSON.parse(decompressed, (key, value) => {
        if (key.includes('At')) return new Date(value);
        return value;
      });
    } catch (error) {
      console.error('❌ Error reading from localStorage:', error);
      return null;
    }
  }

  private async setToLocalStorage(cacheKey: string, entry: TranslationCacheEntry): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      
      const serialized = JSON.stringify(entry);
      const data = this.config.compressionEnabled ? compress(serialized) : serialized;
      
      localStorage.setItem(`translation_cache_${cacheKey}`, data);
    } catch (error: any) {
      console.error('❌ Error writing to localStorage:', error);
      
      // Se localStorage estiver cheio, limpar entradas antigas
      if (error.name === 'QuotaExceededError') {
        await this.cleanupLocalStorage();
        
        // Tentar novamente
        try {
          const serialized = JSON.stringify(entry);
          const data = this.config.compressionEnabled ? compress(serialized) : serialized;
          localStorage.setItem(`translation_cache_${cacheKey}`, data);
        } catch (retryError) {
          console.error('❌ Failed to save after cleanup:', retryError);
        }
      }
    }
  }

  /**
   * 🗃️ OPERAÇÕES DO INDEXEDDB
   */
  private async initializeIndexedDB(): Promise<void> {
    // Verificar se estamos no lado do cliente
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('🚨 IndexedDB não disponível, usando apenas cache de memória');
      return;
    }
    
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => resolve();
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('translations')) {
          const store = db.createObjectStore('translations', { keyPath: 'id' });
          store.createIndex('lastUsed', 'metadata.lastUsed', { unique: false });
          store.createIndex('targetLanguage', 'targetLanguage', { unique: false });
          store.createIndex('qualityScore', 'metadata.qualityScore', { unique: false });
        }
      };
    });
  }

  private async getFromIndexedDB(cacheKey: string): Promise<TranslationCacheEntry | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['translations'], 'readonly');
        const store = transaction.objectStore('translations');
        const getRequest = store.get(cacheKey);
        
        getRequest.onsuccess = () => {
          const entry = getRequest.result;
          if (entry) {
            // Converter strings de data de volta para Date objects
            entry.metadata.createdAt = new Date(entry.metadata.createdAt);
            entry.metadata.lastUsed = new Date(entry.metadata.lastUsed);
            if (entry.metadata.expiresAt) {
              entry.metadata.expiresAt = new Date(entry.metadata.expiresAt);
            }
          }
          resolve(entry || null);
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async setToIndexedDB(cacheKey: string, entry: TranslationCacheEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['translations'], 'readwrite');
        const store = transaction.objectStore('translations');
        const addRequest = store.put(entry);
        
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 🧹 LIMPEZA E MANUTENÇÃO
   */
  private async cleanupMemoryCache(): Promise<void> {
    const entries = Array.from(this.memoryCache.entries());
    
    // Ordenar por último uso
    entries.sort((a, b) => a[1].metadata.lastUsed.getTime() - b[1].metadata.lastUsed.getTime());
    
    // Remover 20% das entradas mais antigas
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  private async cleanupLocalStorage(): Promise<void> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('translation_cache_'));
    
    // Remover 30% das entradas mais antigas
    const toRemove = Math.floor(keys.length * 0.3);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(keys[i]);
    }
  }

  private startBackgroundCleanup(): void {
    // Executar limpeza a cada 30 minutos
    this.cleanupInterval = setInterval(async () => {
      await this.performBackgroundCleanup();
    }, 30 * 60 * 1000);
  }

  private async performBackgroundCleanup(): Promise<void> {
    try {
      console.log('🧹 Performing background cache cleanup...');
      
      // Limpar entradas expiradas
      await this.cleanupExpiredEntries();
      
      // Atualizar métricas
      await this.updateCacheMetrics();
      
      console.log('✅ Background cleanup completed');
    } catch (error) {
      console.error('❌ Background cleanup failed:', error);
    }
  }

  private async cleanupExpiredEntries(): Promise<void> {
    const now = new Date();
    
    // Limpar memory cache
    const entries = Array.from(this.memoryCache.entries());
    for (const [key, entry] of entries) {
      if (entry.metadata.expiresAt && now > entry.metadata.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
    
    // Limpar localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('translation_cache_'));
      for (const key of keys) {
        try {
          const entry = await this.getFromLocalStorage(key.replace('translation_cache_', ''));
          if (entry && entry.metadata.expiresAt && now > entry.metadata.expiresAt) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remover entradas corrompidas
          localStorage.removeItem(key);
        }
      }
    }
  }

  /**
   * 🔄 PRELOAD ESTRATÉGICO
   */
  private async performStrategicPreload(): Promise<void> {
    try {
      if (this.config.preloadStrategies.includes('recent')) {
        await this.preloadRecentTranslations();
      }
      
      if (this.config.preloadStrategies.includes('popular')) {
        await this.preloadPopularTranslations();
      }
    } catch (error) {
      console.error('❌ Strategic preload failed:', error);
    }
  }

  private async preloadRecentTranslations(): Promise<void> {
    // Implementar lógica de preload baseada em uso recente
    console.log('🔄 Preloading recent translations...');
  }

  private async preloadPopularTranslations(): Promise<void> {
    // Implementar lógica de preload baseada em popularidade
    console.log('🔄 Preloading popular translations...');
  }

  /**
   * 📊 MÉTRICAS E MONITORAMENTO
   */
  private async updateCacheMetrics(hit: boolean = false, retrievalTime: number = 0, layer?: string): Promise<void> {
    // Atualizar hit/miss rate
    const totalRequests = this.metrics.hitRate + this.metrics.missRate;
    if (hit) {
      this.metrics.hitRate = (this.metrics.hitRate * totalRequests + 1) / (totalRequests + 1);
    } else {
      this.metrics.missRate = (this.metrics.missRate * totalRequests + 1) / (totalRequests + 1);
    }
    
    // Atualizar tempo médio de recuperação
    this.metrics.averageRetrievalTime = (this.metrics.averageRetrievalTime + retrievalTime) / 2;
    
    // Atualizar distribuição por camada
    if (layer) {
      this.metrics.layerDistribution[layer as keyof typeof this.metrics.layerDistribution]++;
    }
    
    // Calcular saúde do cache
    this.metrics.cacheHealth = this.calculateCacheHealth();
    
    // Salvar métricas
    await this.saveMetrics();
  }

  private calculateCacheHealth(): 'excellent' | 'good' | 'poor' | 'critical' {
    const hitRate = this.metrics.hitRate;
    
    if (hitRate > 0.9) return 'excellent';
    if (hitRate > 0.7) return 'good';
    if (hitRate > 0.5) return 'poor';
    return 'critical';
  }

  /**
   * 🛠️ UTILITÁRIOS
   */
  private async markAsUsed(cacheKey: string): Promise<void> {
    const entry = this.memoryCache.get(cacheKey);
    if (entry) {
      entry.metadata.lastUsed = new Date();
      entry.metadata.useCount++;
    }
  }

  private async loadConfiguration(): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('🚨 localStorage não disponível, usando configuração padrão');
      return;
    }
    
    const saved = localStorage.getItem('translation_cache_config');
    if (saved) {
      try {
        this.config = { ...this.config, ...JSON.parse(saved) };
      } catch (error) {
        console.error('❌ Failed to load cache configuration:', error);
      }
    }
  }

  private async loadMetrics(): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('🚨 localStorage não disponível, usando métricas padrão');
      return;
    }
    
    const saved = localStorage.getItem('translation_cache_metrics');
    if (saved) {
      try {
        this.metrics = { ...this.metrics, ...JSON.parse(saved) };
      } catch (error) {
        console.error('❌ Failed to load cache metrics:', error);
      }
    }
  }

  private async saveMetrics(): Promise<void> {
    localStorage.setItem('translation_cache_metrics', JSON.stringify(this.metrics));
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * 📈 MÉTODOS PÚBLICOS PARA MONITORAMENTO
   */
  public getCacheMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  public getConfiguration(): CacheConfiguration {
    return { ...this.config };
  }

  public updateConfiguration(newConfig: Partial<CacheConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('translation_cache_config', JSON.stringify(this.config));
  }

  public async clearCache(): Promise<void> {
    this.memoryCache.clear();
    
    // Limpar localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('translation_cache_'));
    keys.forEach(key => localStorage.removeItem(key));
    
    // Limpar IndexedDB
    const request = indexedDB.deleteDatabase(this.dbName);
    await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(void 0);
      request.onerror = () => reject(request.error);
    });
    
    console.log('✅ Cache cleared successfully');
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.memoryCache.clear();
  }
}

export default AdvancedTranslationCache;
