import { NextRequest, NextResponse } from 'next/server';
import { Question, ParsedExamData } from '@/types';

export async function POST(request: NextRequest) {
  console.log('=== Iniciando processamento de PDF ===');
  
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      console.error('Nenhum arquivo PDF enviado');
      return NextResponse.json(
        { error: 'Nenhum arquivo PDF enviado' },
        { status: 400 }
      );
    }

    console.log(`Arquivo recebido: ${file.name}, Tamanho: ${file.size} bytes, Tipo: ${file.type}`);

    // Verificar se é um arquivo PDF
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      console.error('Arquivo não é um PDF');
      return NextResponse.json(
        { error: 'Arquivo deve ser um PDF' },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo (limite de 50MB)
    if (file.size > 50 * 1024 * 1024) {
      console.error('Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande. Limite de 50MB.' },
        { status: 400 }
      );
    }

    // Converter File para Buffer
    console.log('Convertendo arquivo para buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`Buffer criado com ${buffer.length} bytes`);

    // Processar PDF usando pdf-parse
    console.log('Iniciando parse do PDF...');
    let pdfData;
    try {
      const pdfParse = (await import('pdf-parse')).default;
      pdfData = await pdfParse(buffer, {
        // Configurações para PDFs grandes
        max: 0, // Sem limite de páginas
        version: 'v1.10.100' // Versão mais recente
      });
      console.log(`PDF processado: ${pdfData.numpages} páginas, ${pdfData.text.length} caracteres`);
    } catch (pdfError) {
      console.error('Erro detalhado ao processar PDF:', pdfError);
      return NextResponse.json(
        { error: `Erro ao ler o arquivo PDF: ${pdfError instanceof Error ? pdfError.message : 'Erro desconhecido'}` },
        { status: 500 }
      );
    }
    
    if (!pdfData.text || pdfData.text.length < 100) {
      console.error('PDF não contém texto suficiente');
      return NextResponse.json(
        { error: 'PDF não contém texto legível ou é muito pequeno' },
        { status: 400 }
      );
    }

    console.log('Iniciando parsing das questões...');
    const questions = parseQuestionsFromPDF(pdfData.text);
    console.log(`Questões extraídas: ${questions.length}`);

    const result: ParsedExamData = {
      questions,
      metadata: {
        totalQuestions: questions.length,
        categories: Array.from(new Set(questions.map(q => q.category))),
        extractedAt: new Date(),
        pdfPages: pdfData.numpages,
        pdfSize: file.size
      }
    };

    console.log('=== Processamento concluído com sucesso ===');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro geral ao processar PDF:', error);
    return NextResponse.json(
      { error: `Falha ao processar o arquivo PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}

function parseQuestionsFromPDF(text: string): Question[] {
  console.log('=== Iniciando parsing das questões ===');
  const questions: Question[] = [];
  
  // Limpar e normalizar o texto
  const cleanedText = text
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();

  console.log(`Texto limpo: ${cleanedText.length} caracteres`);

  // Detectar se é formato GH-200 específico
  const totalQuestionsMatch = cleanedText.match(/TOTAL QUESTIONS:\s*(\d+)/);
  if (totalQuestionsMatch) {
    const totalQuestions = parseInt(totalQuestionsMatch[1]);
    console.log(`Detectado formato GH-200 com ${totalQuestions} questões`);
    
    // Dividir por "Question: X" padrão específico
    const sections = cleanedText.split(/Question:\s*\d+/);
    console.log(`Seções encontradas: ${sections.length}`);
    
    // Processar cada seção (pular a primeira que é o cabeçalho)
    for (let i = 1; i < sections.length; i++) {
      try {
        const question = parseGH200QuestionSection(sections[i], i);
        if (question) {
          questions.push(question);
          console.log(`Questão ${i} processada: "${question.questionText.substring(0, 50)}..."`);
        } else {
          console.log(`Seção ${i} não pôde ser parseada como questão`);
        }
      } catch (e) {
        console.error(`Erro ao processar seção ${i}:`, e);
      }
    }
  } else {
    // Fallback para formato genérico
    console.log('Usando parser genérico');
    const patterns = [
      /(?=Question\s+\d+[:\.]?\s)/gi,
      /(?=^\d+[\.\)]\s+)/gm,
      /(?=^Q\d+[:\.]?\s)/gm,
      /(?=^\d+\s+[A-Z][a-z])/gm,
      /(?=^\d+\s+)/gm
    ];

    let bestSplit: string[] = [];
    let bestPatternName = '';

    patterns.forEach((pattern, index) => {
      const patternNames = ['Question X', 'X.', 'QX', 'X WORD', 'X '];
      try {
        const splits = cleanedText.split(pattern).filter(s => s.trim().length > 50);
        console.log(`Padrão ${patternNames[index]}: ${splits.length} seções`);
        
        if (splits.length > bestSplit.length) {
          bestSplit = splits;
          bestPatternName = patternNames[index];
        }
      } catch (e) {
        console.error(`Erro no padrão ${patternNames[index]}:`, e);
      }
    });

    if (bestSplit.length < 5) {
      console.log('Tentando divisão por parágrafos duplos...');
      bestSplit = cleanedText.split(/\n\s*\n\s*\n/).filter(s => s.trim().length > 100);
      bestPatternName = 'Parágrafos';
    }

    if (bestSplit.length < 5) {
      console.log('Tentando divisão por parágrafos simples...');
      bestSplit = cleanedText.split(/\n\s*\n/).filter(s => s.trim().length > 100);
      bestPatternName = 'Parágrafos simples';
    }

    console.log(`Melhor padrão: ${bestPatternName} com ${bestSplit.length} seções`);

    bestSplit.forEach((section, index) => {
      try {
        const question = parseQuestionSection(section, index + 1);
        if (question) {
          questions.push(question);
          console.log(`Questão ${index + 1} processada: "${question.questionText.substring(0, 50)}..."`);
        } else {
          console.log(`Seção ${index + 1} não pôde ser parseada como questão`);
        }
      } catch (e) {
        console.error(`Erro ao processar seção ${index + 1}:`, e);
      }
    });
  }

  console.log(`=== Parsing concluído: ${questions.length} questões extraídas ===`);
  return questions;
}

function parseGH200QuestionSection(section: string, questionNumber: number): Question | null {
  try {
    console.log(`Processando questão GH-200 ${questionNumber}`);
    
    const cleanSection = section.trim();
    if (cleanSection.length < 50) {
      console.log(`Seção ${questionNumber} muito curta`);
      return null;
    }

    // Extrair texto da questão (antes das opções A, B, C, D)
    const questionMatch = cleanSection.match(/^([\s\S]*?)(?=\n\s*A[\.\)]\s)/);
    if (!questionMatch) {
      console.log(`Questão ${questionNumber}: Não foi possível encontrar o texto da questão`);
      return null;
    }

    let questionText = questionMatch[1]
      .replace(/www\.dumpsplanet\.com/g, '')
      .replace(/Exam Dumps \d+\/\d+/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    // Extrair opções
    const options: string[] = [];
    const optionMatches = cleanSection.match(/([A-E])[\.\)]\s([^\n]*)/g);
    
    if (optionMatches) {
      const seenOptions = new Set();
      optionMatches.forEach(match => {
        const optionMatch = match.match(/[A-E][\.\)]\s(.+)/);
        if (optionMatch) {
          const optionText = optionMatch[1].trim();
          if (!seenOptions.has(optionText) && optionText.length > 0) {
            options.push(optionText);
            seenOptions.add(optionText);
          }
        }
      });
    }

    // Extrair resposta correta
    let correctAnswer = 'A';
    const answerMatch = cleanSection.match(/Answer:\s*([A-E](?:,\s*[A-E])*)/);
    if (answerMatch) {
      correctAnswer = answerMatch[1].trim();
    }

    // Extrair explicação
    let explanation = '';
    const explanationMatch = cleanSection.match(/Explanation:\s*([\s\S]*?)(?=\n\s*Question:|$)/);
    if (explanationMatch) {
      explanation = explanationMatch[1]
        .replace(/www\.dumpsplanet\.com/g, '')
        .replace(/Exam Dumps \d+\/\d+/g, '')
        .replace(/\n+/g, ' ')
        .trim();
    }

    // Validar dados mínimos
    if (!questionText || questionText.length < 10) {
      console.log(`Questão ${questionNumber}: Texto muito curto`);
      return null;
    }

    if (options.length < 2) {
      console.log(`Questão ${questionNumber}: Poucas opções: ${options.length}`);
      while (options.length < 4) {
        options.push(`Opção ${String.fromCharCode(65 + options.length)}`);
      }
    }

    const category = detectCategory(questionText + ' ' + explanation);
    const difficulty = detectDifficulty(questionText + ' ' + explanation);
    const codeExample = extractCodeExample(section);
    const relatedTopics = extractRelatedTopics(questionText + ' ' + explanation);

    const question: Question = {
      id: `gh200-q${questionNumber}`,
      questionText: cleanText(questionText),
      questionType: 'multiple-choice',
      options: options.map(opt => cleanText(opt)),
      correctAnswer,
      explanation: cleanText(explanation) || `Questão ${questionNumber} sobre ${category}`,
      category,
      difficulty,
      codeExample,
      relatedTopics,
      page: Math.ceil(questionNumber / 10)
    };

    console.log(`Questão ${questionNumber} criada: ${options.length} opções`);
    return question;

  } catch (error) {
    console.error(`Erro ao processar questão GH-200 ${questionNumber}:`, error);
    return null;
  }
}

function parseQuestionSection(section: string, questionNumber: number): Question | null {
  try {
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length < 2) {
      console.log(`Seção ${questionNumber} muito curta: ${lines.length} linhas`);
      return null;
    }

    let questionText = '';
    const options: string[] = [];
    let correctAnswer = 'A';
    let explanation = '';
    let optionStartIndex = -1;
    let explanationStartIndex = -1;

    // Encontrar onde começam as opções
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Verificar se é uma opção (A., B., C., D., E. ou A), B), etc.)
      if (line.match(/^[A-E][\.\)]\s+/i) && optionStartIndex === -1) {
        optionStartIndex = i;
        console.log(`Questão ${questionNumber}: Opções começam na linha ${i}`);
        break;
      }
    }

    // Encontrar onde começa a explicação
    for (let i = optionStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      if (line.includes('explanation') || 
          line.includes('answer') || 
          line.includes('correct') ||
          line.includes('rationale') ||
          line.includes('solution') ||
          line.includes('because') ||
          line.startsWith('the correct answer')) {
        explanationStartIndex = i;
        console.log(`Questão ${questionNumber}: Explicação começa na linha ${i}`);
        break;
      }
    }

    // Extrair texto da questão
    const questionEndIndex = optionStartIndex !== -1 ? optionStartIndex : lines.length;
    let questionLines = lines.slice(0, questionEndIndex);
    
    // Remover numeração e cabeçalhos
    questionLines = questionLines.filter(line => {
      const trimmed = line.trim();
      return !trimmed.match(/^(?:Question\s*\d+|Q\d+|\d+[\.\)])\s*$/i) &&
             !trimmed.match(/^Page\s+\d+/i) &&
             !trimmed.match(/^GH-200/i) &&
             trimmed.length > 3;
    });

    questionText = questionLines.join(' ').trim();

    // Extrair opções
    if (optionStartIndex !== -1) {
      const optionsEndIndex = explanationStartIndex !== -1 ? explanationStartIndex : lines.length;
      
      let currentOption = '';
      let currentLetter = '';
      
      for (let i = optionStartIndex; i < optionsEndIndex; i++) {
        const line = lines[i].trim();
        
        const optionMatch = line.match(/^([A-E])[\.\)]\s+(.+)/i);
        if (optionMatch) {
          // Se já tínhamos uma opção, adicionar ela
          if (currentOption && currentLetter) {
            options.push(currentOption);
          }
          
          currentLetter = optionMatch[1].toUpperCase();
          currentOption = optionMatch[2].trim();
          
          // Verificar se há indicadores de resposta correta
          if (line.includes('✓') || line.includes('*') || line.includes('(correct)')) {
            correctAnswer = currentLetter;
          }
        } else if (currentOption && line.length > 0) {
          // Continuar a opção atual
          currentOption += ' ' + line;
        }
      }
      
      // Adicionar a última opção
      if (currentOption && currentLetter) {
        options.push(currentOption);
      }
    }

    // Extrair explicação
    if (explanationStartIndex !== -1) {
      const explanationLines = lines.slice(explanationStartIndex);
      explanation = explanationLines.join(' ').trim();
      
      // Tentar encontrar a resposta correta na explicação
      const answerMatches = [
        /(?:answer|correct).*?(?:is|:)\s*([A-E])/i,
        /([A-E])\s+is\s+(?:correct|right)/i,
        /option\s+([A-E])/i
      ];
      
      for (const answerMatch of answerMatches) {
        const match = explanation.match(answerMatch);
        if (match) {
          correctAnswer = match[1].toUpperCase();
          break;
        }
      }
    }

    // Validar se temos o mínimo necessário
    if (!questionText || questionText.length < 10) {
      console.log(`Questão ${questionNumber}: Texto muito curto: "${questionText}"`);
      return null;
    }
    
    // Se não temos opções, criar uma questão de resposta aberta
    if (options.length === 0) {
      options.push('Resposta A', 'Resposta B', 'Resposta C', 'Resposta D');
    }

    // Garantir que temos pelo menos 2 opções
    if (options.length < 2) {
      console.log(`Questão ${questionNumber}: Poucas opções: ${options.length}`);
      return null;
    }

    // Detectar categoria e dificuldade
    const category = detectCategory(questionText + ' ' + explanation);
    const difficulty = detectDifficulty(questionText + ' ' + explanation);
    
    // Extrair código se houver
    const codeExample = extractCodeExample(section);
    
    // Extrair tópicos relacionados
    const relatedTopics = extractRelatedTopics(questionText + ' ' + explanation);

    const question: Question = {
      id: `gh200-q${questionNumber}`,
      questionText: cleanText(questionText),
      questionType: 'multiple-choice',
      options: options.map(opt => cleanText(opt)),
      correctAnswer,
      explanation: cleanText(explanation) || `Questão ${questionNumber} sobre ${category}`,
      category,
      difficulty,
      codeExample,
      relatedTopics,
      page: Math.ceil(questionNumber / 10)
    };

    console.log(`Questão ${questionNumber} criada: ${options.length} opções, categoria: ${category}`);
    return question;

  } catch (error) {
    console.error(`Erro ao processar seção ${questionNumber}:`, error);
    return null;
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-\.\,\?\!\(\)\[\]\/\:]/g, ' ')
    .trim();
}

function detectCategory(text: string): string {
  const textLower = text.toLowerCase();
  
  const categories = {
    'Workflows': ['workflow', 'job', 'step', 'trigger', 'event', 'yaml', 'yml', 'on:', 'runs-on', 'steps:', 'jobs:'],
    'Actions': ['action', 'marketplace', 'custom action', 'composite', 'uses:', 'action.yml', 'inputs:', 'outputs:'],
    'Runners': ['runner', 'self-hosted', 'ubuntu', 'windows', 'macos', 'ubuntu-latest', 'windows-latest', 'macos-latest'],
    'Secrets': ['secret', 'secrets.', 'environment', 'repository secret', 'organization secret', 'encrypted'],
    'Security': ['security', 'permission', 'token', 'GITHUB_TOKEN', 'vulnerability', 'permissions:', 'contents:'],
    'Deployment': ['deploy', 'deployment', 'environment', 'production', 'staging', 'release', 'publish'],
    'Artifacts': ['artifact', 'artifacts', 'upload-artifact', 'download-artifact', 'cache', 'caching'],
    'Matrix': ['matrix', 'strategy', 'include', 'exclude', 'matrix.'],
    'Conditional': ['if:', 'condition', 'success()', 'failure()', 'always()', 'cancelled()'],
    'Expressions': ['expression', '${{', '}}', 'github.', 'env.', 'vars.', 'runner.', 'steps.']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      return category;
    }
  }

  return 'General';
}

function detectDifficulty(text: string): 'beginner' | 'intermediate' | 'advanced' {
  const textLower = text.toLowerCase();
  
  const advancedKeywords = ['matrix', 'strategy', 'composite action', 'custom action', 'webhook', 'api', 'advanced', 'complex', 'enterprise', 'self-hosted', 'docker', 'kubernetes'];
  const beginnerKeywords = ['basic', 'simple', 'introduction', 'getting started', 'first', 'initial', 'hello world', 'checkout'];

  const advancedScore = advancedKeywords.filter(keyword => textLower.includes(keyword)).length;
  const beginnerScore = beginnerKeywords.filter(keyword => textLower.includes(keyword)).length;

  if (advancedScore >= 2) return 'advanced';
  if (beginnerScore >= 2) return 'beginner';
  return 'intermediate';
}

function extractCodeExample(text: string): string | undefined {
  // Procurar por blocos de código YAML/JSON
  const codePatterns = [
    /```(?:yaml|yml)?\n([\s\S]*?)```/gi,
    /(?:^|\n)((?:name:|on:|jobs:|steps:|uses:|run:)[\s\S]*?)(?=\n\n|\n[A-Z]|$)/gm
  ];

  for (const pattern of codePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const code = match[1].trim();
      if (code.length > 20) {
        return code;
      }
    }
  }

  return undefined;
}

function extractRelatedTopics(text: string): string[] {
  const topics = [
    'GitHub Actions', 'Workflows', 'Jobs', 'Steps', 'Triggers', 'Events', 'Runners', 'Secrets', 
    'Environment Variables', 'Artifacts', 'Caching', 'Matrix Strategy', 'Conditional Execution',
    'Custom Actions', 'Marketplace', 'Security', 'Permissions', 'Deployment', 'CI/CD'
  ];

  const textLower = text.toLowerCase();
  
  return topics.filter(topic => 
    textLower.includes(topic.toLowerCase())
  ).slice(0, 6);
}
