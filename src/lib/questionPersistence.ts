import { Question, ParsedExamData } from '@/types';

export interface SavedQuestionSet {
  id: string;
  name: string;
  questions: Question[];
  metadata: {
    totalQuestions: number;
    categories: string[];
    extractedAt: Date;
    pdfPages?: number;
    pdfSize?: number;
  };
  createdAt: Date;
  lastUsed: Date;
}

export class QuestionPersistence {
  private static readonly STORAGE_KEY = 'gh200-question-sets';
  private static readonly CURRENT_SET_KEY = 'gh200-current-set';

  static saveQuestionSet(examData: ParsedExamData, name: string): string {
    const questionSet: SavedQuestionSet = {
      id: crypto.randomUUID(),
      name,
      questions: examData.questions,
      metadata: examData.metadata,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    const existingSets = this.getAllQuestionSets();
    existingSets.push(questionSet);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingSets));
    this.setCurrentQuestionSet(questionSet.id);
    
    return questionSet.id;
  }

  static getAllQuestionSets(): SavedQuestionSet[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored).map((set: any) => ({
        ...set,
        createdAt: new Date(set.createdAt),
        lastUsed: new Date(set.lastUsed),
        metadata: {
          ...set.metadata,
          extractedAt: new Date(set.metadata.extractedAt)
        }
      }));
    } catch (error) {
      console.error('Erro ao carregar conjuntos de questões:', error);
      return [];
    }
  }

  static getQuestionSet(id: string): SavedQuestionSet | null {
    const sets = this.getAllQuestionSets();
    return sets.find(set => set.id === id) || null;
  }

  static deleteQuestionSet(id: string): void {
    const sets = this.getAllQuestionSets();
    const filteredSets = sets.filter(set => set.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSets));
    
    // Se foi o conjunto atual, limpar referência
    if (this.getCurrentQuestionSetId() === id) {
      localStorage.removeItem(this.CURRENT_SET_KEY);
    }
  }

  static setCurrentQuestionSet(id: string): void {
    const set = this.getQuestionSet(id);
    if (set) {
      // Atualizar lastUsed
      set.lastUsed = new Date();
      this.updateQuestionSet(set);
      
      localStorage.setItem(this.CURRENT_SET_KEY, id);
    }
  }

  static getCurrentQuestionSetId(): string | null {
    return localStorage.getItem(this.CURRENT_SET_KEY);
  }

  static getCurrentQuestionSet(): SavedQuestionSet | null {
    const id = this.getCurrentQuestionSetId();
    return id ? this.getQuestionSet(id) : null;
  }

  static updateQuestionSet(updatedSet: SavedQuestionSet): void {
    const sets = this.getAllQuestionSets();
    const index = sets.findIndex(set => set.id === updatedSet.id);
    
    if (index !== -1) {
      sets[index] = updatedSet;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sets));
    }
  }

  static renameQuestionSet(id: string, newName: string): void {
    const set = this.getQuestionSet(id);
    if (set) {
      set.name = newName;
      this.updateQuestionSet(set);
    }
  }

  static getQuestionSetStats(id: string): {
    totalQuestions: number;
    categories: string[];
    difficulties: string[];
    lastUsed: Date;
  } | null {
    const set = this.getQuestionSet(id);
    if (!set) return null;

    const difficulties = Array.from(new Set(set.questions.map(q => q.difficulty)));
    
    return {
      totalQuestions: set.questions.length,
      categories: set.metadata.categories,
      difficulties,
      lastUsed: set.lastUsed
    };
  }

  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CURRENT_SET_KEY);
  }

  static exportQuestionSet(id: string): string {
    const set = this.getQuestionSet(id);
    if (!set) throw new Error('Conjunto de questões não encontrado');
    
    return JSON.stringify(set, null, 2);
  }

  static importQuestionSet(jsonData: string): string {
    try {
      const set: SavedQuestionSet = JSON.parse(jsonData);
      
      // Validar estrutura básica
      if (!set.questions || !Array.isArray(set.questions)) {
        throw new Error('Formato inválido: questões não encontradas');
      }
      
      // Gerar novo ID para evitar conflitos
      set.id = crypto.randomUUID();
      set.createdAt = new Date();
      set.lastUsed = new Date();
      
      const existingSets = this.getAllQuestionSets();
      existingSets.push(set);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingSets));
      
      return set.id;
    } catch (error) {
      throw new Error('Erro ao importar conjunto de questões: ' + (error as Error).message);
    }
  }
}
