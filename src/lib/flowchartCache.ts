interface FlowchartCacheEntry {
  questionId: string;
  questionText: string;
  correctAnswer: string | string[];
  mermaidCode: string;
  timestamp: number;
  category: string;
  scenario: string;
}

interface FlowchartCache {
  [key: string]: FlowchartCacheEntry;
}

class FlowchartCacheManager {
  private static instance: FlowchartCacheManager;
  private cache: FlowchartCache = {};
  private readonly CACHE_KEY = 'gh200_flowchart_cache';
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms

  private constructor() {
    this.loadCache();
  }

  public static getInstance(): FlowchartCacheManager {
    if (!FlowchartCacheManager.instance) {
      FlowchartCacheManager.instance = new FlowchartCacheManager();
    }
    return FlowchartCacheManager.instance;
  }

  private loadCache(): void {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (cachedData) {
        this.cache = JSON.parse(cachedData);
        this.cleanExpiredEntries();
      }
    } catch (error) {
      console.error('Erro ao carregar cache de fluxogramas:', error);
      this.cache = {};
    }
  }

  private saveCache(): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Erro ao salvar cache de fluxogramas:', error);
    }
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Object.entries(this.cache)) {
      if (now - entry.timestamp > this.CACHE_EXPIRY) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      delete this.cache[key];
    });

    if (keysToDelete.length > 0) {
      this.saveCache();
    }
  }

  private generateCacheKey(questionId: string, correctAnswer: string | string[], scenario: string): string {
    const answerKey = Array.isArray(correctAnswer) ? correctAnswer.join(',') : correctAnswer;
    return `${questionId}_${answerKey}_${scenario}`;
  }

  public get(questionId: string, correctAnswer: string | string[], scenario: string): string | null {
    const key = this.generateCacheKey(questionId, correctAnswer, scenario);
    const entry = this.cache[key];
    
    if (!entry) {
      return null;
    }

    // Verificar se não expirou
    if (Date.now() - entry.timestamp > this.CACHE_EXPIRY) {
      delete this.cache[key];
      this.saveCache();
      return null;
    }

    return entry.mermaidCode;
  }

  public set(
    questionId: string,
    questionText: string,
    correctAnswer: string | string[],
    mermaidCode: string,
    category: string,
    scenario: string
  ): void {
    const key = this.generateCacheKey(questionId, correctAnswer, scenario);
    
    this.cache[key] = {
      questionId,
      questionText,
      correctAnswer,
      mermaidCode,
      timestamp: Date.now(),
      category,
      scenario
    };

    this.saveCache();
  }

  public clear(): void {
    this.cache = {};
    localStorage.removeItem(this.CACHE_KEY);
  }

  public getCacheStats(): {
    totalEntries: number;
    cacheSize: string;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const entries = Object.values(this.cache);
    const timestamps = entries.map(entry => entry.timestamp);
    
    return {
      totalEntries: entries.length,
      cacheSize: this.formatBytes(JSON.stringify(this.cache).length),
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public getEntriesByCategory(category: string): FlowchartCacheEntry[] {
    return Object.values(this.cache).filter(entry => entry.category === category);
  }

  public exportCache(): string {
    return JSON.stringify(this.cache, null, 2);
  }

  public importCache(cacheData: string): boolean {
    try {
      const importedCache = JSON.parse(cacheData);
      this.cache = { ...this.cache, ...importedCache };
      this.saveCache();
      return true;
    } catch (error) {
      console.error('Erro ao importar cache:', error);
      return false;
    }
  }
}

export default FlowchartCacheManager;
