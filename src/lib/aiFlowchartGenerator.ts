import { Question } from '@/types';

interface FlowchartGenerationRequest {
  question: Question;
  userAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
}

interface FlowchartGenerationResponse {
  mermaidCode: string;
  scenario: string;
  explanation: string;
}

class AIFlowchartGenerator {
  private static instance: AIFlowchartGenerator;
  private baseUrl = '/api/generate-flowchart'; // Endpoint para API local ou Azure

  private constructor() {}

  public static getInstance(): AIFlowchartGenerator {
    if (!AIFlowchartGenerator.instance) {
      AIFlowchartGenerator.instance = new AIFlowchartGenerator();
    }
    return AIFlowchartGenerator.instance;
  }

  /**
   * Gera um fluxograma Mermaid contextual baseado na questão
   */
  public async generateFlowchart(request: FlowchartGenerationRequest): Promise<FlowchartGenerationResponse> {
    const scenario = this.detectScenario(request.question);
    const prompt = this.buildPrompt(request, scenario);

    try {
      // Tentar gerar com API externa (Azure/OpenAI) primeiro
      const response = await this.callAIService(prompt);
      if (response) {
        return {
          mermaidCode: response.mermaidCode,
          scenario,
          explanation: response.explanation
        };
      }
    } catch (error) {
      console.warn('Falha na API externa, usando geração local:', error);
    }

    // Fallback para geração local baseada em templates
    return this.generateLocalFlowchart(request, scenario);
  }

  /**
   * Detecta o tipo de cenário baseado no conteúdo da questão
   */
  private detectScenario(question: Question): string {
    const text = `${question.questionText} ${question.codeExample || ''} ${question.explanation}`.toLowerCase();

    if (text.includes('matrix') && text.includes('job')) {
      return 'matrix-strategy';
    } else if (text.includes('trigger') || text.includes('on:') || text.includes('event')) {
      return 'workflow-triggers';
    } else if (text.includes('runner') || text.includes('runs-on')) {
      return 'runner-selection';
    } else if (text.includes('secret') || text.includes('environment variable')) {
      return 'secrets-management';
    } else if (text.includes('permission') || text.includes('token')) {
      return 'permissions';
    } else if (text.includes('action') && text.includes('uses:')) {
      return 'action-usage';
    } else if (text.includes('deploy') || text.includes('environment')) {
      return 'deployment';
    } else if (text.includes('conditional') || text.includes('if:')) {
      return 'conditional-execution';
    } else if (text.includes('artifact') || text.includes('upload') || text.includes('download')) {
      return 'artifacts';
    } else if (text.includes('cache') || text.includes('dependency')) {
      return 'caching';
    } else {
      return 'general-workflow';
    }
  }

  /**
   * Constrói o prompt para a IA baseado na questão e cenário
   */
  private buildPrompt(request: FlowchartGenerationRequest, scenario: string): string {
    const { question, userAnswers, correctAnswers, isCorrect } = request;
    
    return `
Você é um especialista em GitHub Actions criando diagramas educacionais. 

CONTEXTO DA QUESTÃO:
Questão: "${question.questionText}"
Categoria: ${question.category}
Cenário detectado: ${scenario}

${question.codeExample ? `CÓDIGO DE EXEMPLO:
\`\`\`yaml
${question.codeExample}
\`\`\`\n` : ''}

OPÇÕES DISPONÍVEIS:
${question.options?.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n') || ''}

RESPOSTA CORRETA: ${Array.isArray(correctAnswers) ? correctAnswers.join(', ') : correctAnswers}
RESPOSTA DO USUÁRIO: ${userAnswers.join(', ')}
STATUS: ${isCorrect ? 'CORRETO' : 'INCORRETO'}

EXPLICAÇÃO: ${question.explanation}

TAREFA:
Crie um fluxograma Mermaid que demonstre ESPECIFICAMENTE o cenário da questão e explique POR QUE a resposta correta está certa. 

O fluxograma deve:
1. Mostrar o fluxo técnico real do GitHub Actions para este cenário
2. Destacar visualmente onde a resposta correta se aplica
3. Usar cores para indicar a escolha correta vs incorretas
4. Ser educativo e mostrar o "como" e "por que"
5. Incluir elementos específicos mencionados na questão (não genéricos)

${this.getScenarioSpecificInstructions(scenario)}

REGRAS DO MERMAID:
- Use flowchart TD ou LR
- Inclua emojis descritivos
- Use cores: verde para correto, vermelho para incorreto, azul para processo
- Máximo 20 nós para clareza
- Inclua decisões (diamond shapes) quando apropriado

Retorne APENAS o código Mermaid válido, sem explicações adicionais.
`;
  }

  /**
   * Instruções específicas por cenário
   */
  private getScenarioSpecificInstructions(scenario: string): string {
    const instructions: Record<string, string> = {
      'matrix-strategy': `
Para Matrix Strategy:
- Mostre como os parâmetros da matriz se combinam
- Ilustre quantos jobs são criados
- Destaque a multiplicação dos valores`,
      
      'workflow-triggers': `
Para Workflow Triggers:
- Mostre diferentes eventos que podem acionar
- Ilustre quando cada trigger é ativado
- Destaque as condições de ativação`,
      
      'runner-selection': `
Para Runner Selection:
- Mostre diferentes tipos de runners
- Ilustre o processo de seleção
- Destaque custos, performance e disponibilidade`,
      
      'secrets-management': `
Para Secrets Management:
- Mostre o fluxo de acesso a secrets
- Ilustre diferentes escopos (repo, org, environment)
- Destaque segurança e hierarquia`,
      
      'permissions': `
Para Permissions:
- Mostre diferentes níveis de permissão
- Ilustre o controle de acesso
- Destaque princípios de menor privilégio`,
      
      'deployment': `
Para Deployment:
- Mostre o pipeline de deploy
- Ilustre ambientes e aprovações
- Destaque estratégias de release`,
      
      'default': `
Para cenário geral:
- Foque nos elementos específicos da questão
- Mostre o fluxo lógico do GitHub Actions
- Destaque pontos de decisão importantes`
    };
    
    return instructions[scenario] || instructions['default'];
  }

  /**
   * Chama o serviço de IA (Azure/OpenAI)
   */
  private async callAIService(prompt: string): Promise<{ mermaidCode: string; explanation: string } | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`API response: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro na chamada da API de IA:', error);
      return null;
    }
  }

  /**
   * Geração local de fallback usando templates
   */
  private generateLocalFlowchart(request: FlowchartGenerationRequest, scenario: string): FlowchartGenerationResponse {
    const { question, correctAnswers } = request;
    
    switch (scenario) {
      case 'matrix-strategy':
        return {
          mermaidCode: this.generateMatrixFlowchart(question, correctAnswers),
          scenario,
          explanation: 'Fluxograma gerado localmente para estratégia de matriz'
        };
      
      case 'workflow-triggers':
        return {
          mermaidCode: this.generateTriggersFlowchart(question, correctAnswers),
          scenario,
          explanation: 'Fluxograma gerado localmente para triggers de workflow'
        };
      
      case 'runner-selection':
        return {
          mermaidCode: this.generateRunnerFlowchart(question, correctAnswers),
          scenario,
          explanation: 'Fluxograma gerado localmente para seleção de runners'
        };
      
      default:
        return {
          mermaidCode: this.generateGenericFlowchart(question, correctAnswers),
          scenario,
          explanation: 'Fluxograma genérico gerado localmente'
        };
    }
  }

  /**
   * Template para questões de matriz
   */
  private generateMatrixFlowchart(question: Question, correctAnswers: string[]): string {
    // Extrair informações da matriz do código de exemplo
    const codeExample = question.codeExample || '';
    const hasMatrix = codeExample.includes('matrix:');
    
    return `
flowchart TD
    A[🚀 Workflow Trigger<br/>Gatilho do Workflow] --> B{📋 Matrix Strategy<br/>Estratégia de Matriz}
    
    B --> C[📊 Matrix Parameters<br/>Parâmetros da Matriz]
    C --> D[🔢 OS Options<br/>ubuntu-latest, windows-latest]
    C --> E[🔢 Version Options<br/>Node 16, 18]
    
    D --> F{🎯 Job Calculation<br/>Cálculo de Jobs}
    E --> F
    
    F --> G[✨ Job 1: Ubuntu + Node 16<br/>Job 1: Ubuntu + Node 16]
    F --> H[✨ Job 2: Ubuntu + Node 18<br/>Job 2: Ubuntu + Node 18]  
    F --> I[✨ Job 3: Windows + Node 16<br/>Job 3: Windows + Node 16]
    F --> J[✨ Job 4: Windows + Node 18<br/>Job 4: Windows + Node 18]
    
    G --> K[📈 Result: 4 Jobs Total<br/>Resultado: 4 Jobs no Total]
    H --> K
    I --> K
    J --> K
    
    K --> L{✅ Why Option ${correctAnswers[0]} is Correct<br/>Por que a Opção ${correctAnswers[0]} está Correta}
    L --> M[🎉 2 OS × 2 Versions = 4 Jobs<br/>2 SO × 2 Versões = 4 Jobs]
    
    style A fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#FFFFFF
    style B fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#FFFFFF
    style C fill:#06B6D4,stroke:#0891B2,stroke-width:2px,color:#FFFFFF
    style F fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#FFFFFF
    style K fill:#10B981,stroke:#059669,stroke-width:3px,color:#FFFFFF
    style L fill:#F59E0B,stroke:#D97706,stroke-width:3px,color:#FFFFFF
    style M fill:#22C55E,stroke:#16A34A,stroke-width:3px,color:#FFFFFF
    `;
  }

  /**
   * Template para questões de triggers
   */
  private generateTriggersFlowchart(question: Question, correctAnswers: string[]): string {
    return `
flowchart TD
    A[👨‍💻 Developer Action<br/>Ação do Desenvolvedor] --> B{🎯 GitHub Event<br/>Evento do GitHub}
    
    B -->|"git push"| C[📤 Push Event<br/>Evento Push]
    B -->|"open PR"| D[🔄 Pull Request Event<br/>Evento Pull Request]
    B -->|"create release"| E[🚀 Release Event<br/>Evento Release]
    B -->|"schedule"| F[⏰ Scheduled Event<br/>Evento Agendado]
    
    C --> G{📋 Workflow Configuration<br/>Configuração do Workflow}
    D --> G
    E --> G
    F --> G
    
    G --> H[✅ Trigger Match<br/>Correspondência de Trigger]
    H --> I[🏃‍♂️ Workflow Execution<br/>Execução do Workflow]
    
    I --> J[🎉 Correct Answer: ${correctAnswers[0]}<br/>Resposta Correta: ${correctAnswers[0]}]
    
    style A fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#FFFFFF
    style B fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#FFFFFF
    style G fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#FFFFFF
    style H fill:#10B981,stroke:#059669,stroke-width:2px,color:#FFFFFF
    style J fill:#22C55E,stroke:#16A34A,stroke-width:3px,color:#FFFFFF
    `;
  }

  /**
   * Template para questões de runners
   */
  private generateRunnerFlowchart(question: Question, correctAnswers: string[]): string {
    return `
flowchart TD
    A[🚀 Job Definition<br/>Definição do Job] --> B{🖥️ Runner Selection<br/>Seleção do Runner}
    
    B -->|"ubuntu-latest"| C[🐧 Ubuntu Runner<br/>2-core, 7GB RAM]
    B -->|"windows-latest"| D[🪟 Windows Runner<br/>2-core, 7GB RAM]
    B -->|"macos-latest"| E[🍎 macOS Runner<br/>3-core, 14GB RAM]
    B -->|"self-hosted"| F[🏠 Self-hosted Runner<br/>Custom Resources]
    
    C --> G{💰 Cost & Performance<br/>Custo & Performance}
    D --> G
    E --> G
    F --> G
    
    G --> H[✅ Best Choice for Scenario<br/>Melhor Escolha para o Cenário]
    H --> I[🎉 Answer ${correctAnswers[0]} is Correct<br/>Resposta ${correctAnswers[0]} está Correta]
    
    style A fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#FFFFFF
    style B fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#FFFFFF
    style G fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#FFFFFF
    style H fill:#10B981,stroke:#059669,stroke-width:2px,color:#FFFFFF
    style I fill:#22C55E,stroke:#16A34A,stroke-width:3px,color:#FFFFFF
    `;
  }

  /**
   * Template genérico
   */
  private generateGenericFlowchart(question: Question, correctAnswers: string[]): string {
    return `
flowchart TD
    A[📋 GitHub Actions Context<br/>Contexto do GitHub Actions] --> B{🎯 Question Scenario<br/>Cenário da Questão}
    
    B --> C[🔍 Option Analysis<br/>Análise das Opções]
    C --> D[⚡ GitHub Actions Logic<br/>Lógica do GitHub Actions]
    
    D --> E{✅ Correct Solution<br/>Solução Correta}
    E --> F[🎉 Answer ${correctAnswers[0]}<br/>Resposta ${correctAnswers[0]}]
    
    F --> G[💡 Why This is Correct<br/>Por que está Correto]
    G --> H[📚 Key Learning Point<br/>Ponto-chave de Aprendizado]
    
    style A fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#FFFFFF
    style B fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#FFFFFF
    style D fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#FFFFFF
    style E fill:#10B981,stroke:#059669,stroke-width:2px,color:#FFFFFF
    style F fill:#22C55E,stroke:#16A34A,stroke-width:3px,color:#FFFFFF
    style H fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#FFFFFF
    `;
  }
}

export default AIFlowchartGenerator;
