import { NextRequest, NextResponse } from 'next/server';
import { Question } from '@/types';

// Traduções mockadas para demonstração
const mockTranslations: Record<string, any> = {
  'workflows': {
    questionText: 'Qual evento do GitHub Actions aciona um workflow quando um pull request é aberto?',
    options: ['push', 'pull_request', 'workflow_dispatch', 'schedule'],
    explanation: 'O evento pull_request aciona workflows quando pull requests são abertos, sincronizados ou fechados.',
    category: 'github-actions',
    relatedTopics: ['workflows', 'eventos', 'pull-requests'],
    correctAnswer: 'B' // pull_request é a resposta correta
  },
  'needs': {
    questionText: 'Qual é o propósito da palavra-chave `needs` nos workflows do GitHub Actions?',
    options: ['Definir dependências', 'Configurar variáveis de ambiente', 'Configurar runners', 'Especificar timeouts'],
    explanation: 'A palavra-chave needs define dependências entre jobs, garantindo que sejam executados na ordem correta.',
    category: 'github-actions',
    relatedTopics: ['workflows', 'jobs', 'dependências'],
    correctAnswer: 'A'
  },
  'secrets': {
    questionText: 'Como você acessa secrets em um workflow do GitHub Actions?',
    options: ['${{ secrets.SECRET_NAME }}', '${{ env.SECRET_NAME }}', '${{ vars.SECRET_NAME }}', '${{ github.SECRET_NAME }}'],
    explanation: 'Secrets são acessados usando o contexto secrets com a sintaxe ${{ secrets.SECRET_NAME }}.',
    category: 'github-actions',
    relatedTopics: ['secrets', 'segurança', 'workflows'],
    correctAnswer: 'A'
  },
  'azure': {
    questionText: 'Qual é a melhor prática para deploy no Azure usando GitHub Actions?',
    options: ['Azure Web Apps', 'Azure Container Registry', 'Azure Resource Manager', 'Azure DevOps'],
    explanation: 'Azure Web Apps oferece integração nativa com GitHub Actions para deploy contínuo.',
    category: 'azure-deployment',
    relatedTopics: ['azure', 'deployment', 'web-apps'],
    correctAnswer: 'A'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar se é a nova estrutura do cache
    if (body.questionText && body.options && body.explanation) {
      // Nova estrutura do cache
      const { questionText, options, explanation, category, relatedTopics, targetLanguage } = body;
      
      // Simular tradução baseada em palavras-chave
      let translation = mockTranslations['workflows']; // padrão
      
      if (questionText.toLowerCase().includes('needs')) {
        translation = mockTranslations['needs'];
      } else if (questionText.toLowerCase().includes('secret')) {
        translation = mockTranslations['secrets'];
      } else if (questionText.toLowerCase().includes('pull request')) {
        translation = mockTranslations['workflows'];
      } else if (questionText.toLowerCase().includes('azure')) {
        translation = mockTranslations['azure'];
      }
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return NextResponse.json({
        questionText: translation.questionText,
        options: translation.options,
        explanation: translation.explanation,
        category: translation.category,
        relatedTopics: translation.relatedTopics
      });
    }
    
    // Estrutura antiga (compatibilidade)
    const { question }: { question: Question } = body;
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    console.log(`Traduzindo questão: ${question.id}`);

    // Simular tradução baseada no ID ou conteúdo
    let translation = mockTranslations['workflows']; // padrão
    
    if (question.questionText.toLowerCase().includes('needs')) {
      translation = mockTranslations['needs'];
    } else if (question.questionText.toLowerCase().includes('secret')) {
      translation = mockTranslations['secrets'];
    } else if (question.questionText.toLowerCase().includes('pull request')) {
      translation = mockTranslations['workflows'];
    } else if (question.questionText.toLowerCase().includes('azure')) {
      translation = mockTranslations['azure'];
    }
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`Tradução concluída para questão ${question.id}`);
    
    return NextResponse.json({ 
      translations: {
        questionText: translation.questionText,
        options: translation.options,
        explanation: translation.explanation,
        category: translation.category,
        relatedTopics: translation.relatedTopics
      }
    });

  } catch (error) {
    console.error('Erro na tradução:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
