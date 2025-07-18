import pdf from 'pdf-parse';
import { Question, PDFContent, ParsedExamData } from '@/types';

export class PDFProcessor {
  private static instance: PDFProcessor;
  
  public static getInstance(): PDFProcessor {
    if (!PDFProcessor.instance) {
      PDFProcessor.instance = new PDFProcessor();
    }
    return PDFProcessor.instance;
  }

  /**
   * Extrai conteúdo do PDF
   */
  async extractPDFContent(pdfBuffer: Buffer): Promise<PDFContent> {
    try {
      const data = await pdf(pdfBuffer);
      
      return {
        text: data.text,
        images: [], // Placeholder for image extraction
        tables: [], // Placeholder for table extraction
        metadata: {
          title: data.info?.Title || 'GitHub Actions GH-200 Exam',
          author: data.info?.Author || 'GitHub',
          pageCount: data.numpages
        }
      };
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      throw new Error('Falha ao processar o arquivo PDF');
    }
  }

  /**
   * Extrai questões do texto do PDF
   */
  parseQuestionsFromText(text: string): Question[] {
    const questions: Question[] = [];
    
    // Regex patterns para identificar questões
    const questionPatterns = [
      /Question\s*(\d+)[\s\S]*?(?=Question\s*\d+|$)/gi,
      /\d+\.\s*([^?]+\?)/gi,
      /(\d+)\.\s*([^?]+\?)/gi
    ];

    // Padrões para respostas múltipla escolha
    const optionPatterns = [
      /[A-E]\)\s*([^\n]+)/gi,
      /[A-E]\.\s*([^\n]+)/gi,
      /\([A-E]\)\s*([^\n]+)/gi
    ];

    // Padrões para identificar respostas corretas
    const correctAnswerPatterns = [
      /Answer:\s*([A-E])/gi,
      /Correct:\s*([A-E])/gi,
      /Solution:\s*([A-E])/gi
    ];

    // Padrões para explicações
    const explanationPatterns = [
      /Explanation:\s*([^?]+?)(?=Question|Answer|$)/gi,
      /Rationale:\s*([^?]+?)(?=Question|Answer|$)/gi
    ];

    let questionCounter = 1;
    
    // Dividir o texto em seções por questão
    const sections = text.split(/(?=Question\s*\d+|^\d+\.)/gm);
    
    sections.forEach((section, index) => {
      if (section.trim().length < 20) return; // Ignorar seções muito pequenas
      
      const questionMatch = section.match(/(?:Question\s*\d+[\s\S]*?)?([^?]+\?)/);
      if (!questionMatch) return;

      const questionText = questionMatch[1]?.trim();
      if (!questionText) return;

      // Extrair opções
      const options: string[] = [];
      let optionMatch;
      const optionRegex = /[A-E][\)\.]\s*([^\n]+)/g;
      
      while ((optionMatch = optionRegex.exec(section)) !== null) {
        options.push(optionMatch[1].trim());
      }

      // Extrair resposta correta
      const correctAnswerMatch = section.match(/(?:Answer|Correct|Solution):\s*([A-E])/i);
      const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1].toUpperCase() : 'A';

      // Extrair explicação
      const explanationMatch = section.match(/(?:Explanation|Rationale):\s*([^?]+?)(?=Question|Answer|$)/i);
      const explanation = explanationMatch ? explanationMatch[1].trim() : 'Explicação não disponível no PDF.';

      // Detectar tipo de questão
      let questionType: Question['questionType'] = 'multiple-choice';
      if (section.toLowerCase().includes('true') && section.toLowerCase().includes('false')) {
        questionType = 'true-false';
      } else if (section.toLowerCase().includes('code') || section.toLowerCase().includes('yaml')) {
        questionType = 'code-completion';
      }

      // Detectar categoria baseada no conteúdo
      const category = this.detectCategory(questionText + ' ' + section);

      // Detectar dificuldade
      const difficulty = this.detectDifficulty(questionText + ' ' + section);

      // Extrair exemplo de código se presente
      const codeExample = this.extractCodeExample(section);

      // Detectar tópicos relacionados
      const relatedTopics = this.extractRelatedTopics(questionText + ' ' + section);

      const question: Question = {
        id: `q${questionCounter}`,
        questionText,
        questionType,
        options: options.length > 0 ? options : undefined,
        correctAnswer,
        explanation,
        category,
        difficulty,
        codeExample,
        relatedTopics,
        page: Math.floor(index / 3) + 1 // Estimativa da página
      };

      questions.push(question);
      questionCounter++;
    });

    return questions;
  }

  /**
   * Detecta categoria da questão baseada no conteúdo
   */
  private detectCategory(text: string): string {
    const categories = {
      'Workflows': ['workflow', 'job', 'step', 'trigger', 'event'],
      'Actions': ['action', 'marketplace', 'custom action', 'composite'],
      'Runners': ['runner', 'self-hosted', 'ubuntu', 'windows', 'macos'],
      'Secrets': ['secret', 'environment', 'repository secret', 'organization secret'],
      'Security': ['security', 'permission', 'token', 'GITHUB_TOKEN', 'vulnerability'],
      'Deployment': ['deploy', 'environment', 'production', 'staging'],
      'Monitoring': ['monitoring', 'log', 'artifact', 'status check'],
      'Integration': ['integration', 'webhook', 'api', 'third-party']
    };

    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }

    return 'General';
  }

  /**
   * Detecta dificuldade baseada no conteúdo
   */
  private detectDifficulty(text: string): Question['difficulty'] {
    const lowerText = text.toLowerCase();
    
    // Palavras-chave para dificuldade avançada
    const advancedKeywords = [
      'matrix', 'strategy', 'composite action', 'custom action',
      'webhook', 'api', 'advanced', 'complex', 'enterprise'
    ];
    
    // Palavras-chave para dificuldade iniciante
    const beginnerKeywords = [
      'basic', 'simple', 'introduction', 'getting started', 'first', 'initial'
    ];

    if (advancedKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'advanced';
    }
    
    if (beginnerKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'beginner';
    }

    return 'intermediate';
  }

  /**
   * Extrai exemplo de código da questão
   */
  private extractCodeExample(text: string): string | undefined {
    const codePatterns = [
      /```yaml\n([\s\S]*?)```/gi,
      /```\n([\s\S]*?)```/gi,
      /```([\s\S]*?)```/gi
    ];

    for (const pattern of codePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extrai tópicos relacionados
   */
  private extractRelatedTopics(text: string): string[] {
    const topics = [
      'GitHub Actions', 'Workflows', 'Jobs', 'Steps', 'Triggers',
      'Events', 'Runners', 'Secrets', 'Environment Variables',
      'Artifacts', 'Caching', 'Matrix Strategy', 'Conditional Execution',
      'Custom Actions', 'Marketplace', 'Security', 'Permissions',
      'Deployment', 'Monitoring', 'Integration', 'API', 'Webhooks'
    ];

    const lowerText = text.toLowerCase();
    
    return topics.filter(topic => 
      lowerText.includes(topic.toLowerCase())
    );
  }

  /**
   * Processa o PDF completo e retorna dados estruturados
   */
  async processPDFExam(pdfBuffer: Buffer): Promise<ParsedExamData> {
    try {
      const content = await this.extractPDFContent(pdfBuffer);
      const questions = this.parseQuestionsFromText(content.text);
      
      const categories = Array.from(new Set(questions.map(q => q.category)));
      
      return {
        questions,
        metadata: {
          totalQuestions: questions.length,
          categories,
          extractedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Erro ao processar PDF do exame:', error);
      throw new Error('Falha ao processar o arquivo PDF do exame');
    }
  }
}

export default PDFProcessor;
