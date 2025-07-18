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
      
      // Extrair imagens (placeholder - implementação básica)
      const images = await this.extractImagesFromPDF(data);
      
      return {
        text: data.text,
        images: images,
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
   * Extrai imagens do PDF
   */
  private async extractImagesFromPDF(pdfData: any): Promise<string[]> {
    const images: string[] = [];
    
    try {
      // Esta é uma implementação básica
      // Em uma implementação real, você usaria bibliotecas como pdf2pic ou pdf-poppler
      // para extrair imagens do PDF e convertê-las para base64 ou salvá-las como arquivos
      
      // Por enquanto, vamos detectar referências a imagens no texto
      const imageReferences = this.detectImageReferences(pdfData.text);
      
      // Aqui você poderia implementar a extração real de imagens
      // Por exemplo, convertendo páginas do PDF para imagens
      
      return imageReferences;
    } catch (error) {
      console.error('Erro ao extrair imagens:', error);
      return [];
    }
  }

  /**
   * Detecta se uma questão tem imagem associada
   */
  private detectQuestionImage(section: string): boolean {
    const imageIndicators = [
      'following matrix configuration',
      'configuration shown below',
      'workflow shown below',
      'example shown',
      'diagram shows',
      'screenshot',
      'image shows',
      'refer to the figure',
      'see the configuration',
      'yaml configuration',
      'workflow file',
      'action configuration'
    ];

    const lowerSection = section.toLowerCase();
    return imageIndicators.some(indicator => lowerSection.includes(indicator));
  }

  /**
   * Gera URL da imagem baseada no contador e conteúdo da questão
   */
  private generateImageUrl(questionNumber: number, section: string): string {
    // Em uma implementação real, você geraria URLs para imagens extraídas
    // Por enquanto, vamos usar placeholders para demonstrar a funcionalidade
    
    if (section.toLowerCase().includes('matrix')) {
      return `https://via.placeholder.com/600x400/2563EB/FFFFFF?text=Matrix+Configuration+Example+${questionNumber}`;
    } else if (section.toLowerCase().includes('workflow')) {
      return `https://via.placeholder.com/600x400/059669/FFFFFF?text=Workflow+Example+${questionNumber}`;
    } else if (section.toLowerCase().includes('yaml')) {
      return `https://via.placeholder.com/600x400/DC2626/FFFFFF?text=YAML+Configuration+${questionNumber}`;
    } else if (section.toLowerCase().includes('runner')) {
      return `https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Runner+Configuration+${questionNumber}`;
    } else if (section.toLowerCase().includes('action')) {
      return `https://via.placeholder.com/600x400/EA580C/FFFFFF?text=Action+Configuration+${questionNumber}`;
    }
    
    return `https://via.placeholder.com/600x400/6B7280/FFFFFF?text=Question+${questionNumber}+Image`;
  }

  /**
   * Extrai legenda da imagem
   */
  private extractImageCaption(section: string): string {
    const captionPatterns = [
      /figure\s+\d+[:\-\s]*([^\n]+)/gi,
      /image\s+\d+[:\-\s]*([^\n]+)/gi,
      /diagram[:\-\s]*([^\n]+)/gi,
      /configuration[:\-\s]*([^\n]+)/gi
    ];

    for (const pattern of captionPatterns) {
      const match = section.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'Configuration example for this question';
  }

  /**
   * Detecta referências a imagens no texto do PDF
   */
  private detectImageReferences(text: string): string[] {
    const imageReferences: string[] = [];
    
    // Padrões para detectar referências a imagens
    const imagePatterns = [
      /see\s+figure\s+(\d+)/gi,
      /refer\s+to\s+image\s+(\d+)/gi,
      /screenshot\s+(\d+)/gi,
      /diagram\s+(\d+)/gi,
      /configuration\s+shown\s+below/gi,
      /following\s+matrix\s+configuration/gi,
      /workflow\s+example/gi,
      /yaml\s+configuration/gi
    ];

    imagePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          imageReferences.push(match);
        });
      }
    });

    return imageReferences;
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

      // Detectar se a questão tem imagem associada
      const hasImage = this.detectQuestionImage(section);
      const imageUrl = hasImage ? this.generateImageUrl(questionCounter, section) : undefined;

      // Criar conteúdo visual se houver imagem
      const visualContent = hasImage ? {
        type: 'image' as const,
        url: imageUrl,
        alt: `Question ${questionCounter} image`,
        caption: this.extractImageCaption(section),
        interactive: false
      } : undefined;

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
        page: Math.floor(index / 3) + 1, // Estimativa da página
        imageUrl,
        visualContent
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
