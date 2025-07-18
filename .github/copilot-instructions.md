<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# GitHub Actions GH-200 Certification Simulator

Este é um simulador interativo para a certificação GitHub Actions GH-200. O projeto utiliza Next.js 15 com TypeScript e Tailwind CSS.

## Instruções para o Copilot

### Contexto do Projeto
- **Objetivo**: Criar um simulador educacional para a certificação GH-200
- **Funcionalidades**: Questões interativas, explicações detalhadas, rastreamento de progresso
- **Público-alvo**: Desenvolvedores preparando-se para a certificação GitHub Actions

### Padrões de Código
- Use TypeScript para todos os componentes
- Implemente componentes funcionais com hooks
- Utilize Tailwind CSS para estilização
- Mantenha componentes reutilizáveis e bem documentados

### Estrutura do Projeto
```
src/
├── app/                 # Next.js App Router
├── components/          # Componentes React reutilizáveis
├── lib/                 # Utilitários e lógica de negócio
└── types/              # Definições TypeScript
```

### Componentes Principais
- **QuestionCard**: Exibe questões com opções e explicações
- **ProgressBar**: Mostra progresso do exame
- **StatsPanel**: Exibe estatísticas detalhadas
- **Timer**: Cronômetro para sessões cronometradas
- **NavigationControls**: Controles de navegação entre questões

### Funcionalidades Educacionais
- Questões de múltipla escolha com explicações detalhadas
- Exemplos de código GitHub Actions
- Categorização por tópicos (Workflows, Actions, Runners, etc.)
- Níveis de dificuldade (Iniciante, Intermediário, Avançado)
- Rastreamento de progresso e estatísticas

### Requisitos de Acessibilidade
- Utilize cores contrastantes
- Implemente navegação por teclado
- Adicione descrições alt para imagens
- Mantenha texto legível e bem estruturado

### Estilo e UX
- Design moderno e responsivo
- Animações suaves para transições
- Feedback visual claro para interações
- Interface intuitiva e amigável

### Integração com PDF
- Processamento de PDFs para extração de questões
- Parsing inteligente de conteúdo
- Suporte a imagens e código em questões

### Gerenciamento de Estado
- Use hooks do React para estado local
- Implemente persistência com localStorage
- Mantenha estado das sessões de exame

### Performance
- Otimize carregamento de componentes
- Implemente lazy loading quando necessário
- Minimize re-renders desnecessários
- Use memoização para cálculos complexos

### Exemplos de Uso
Quando criar novos componentes ou funcionalidades, considere:
- Reutilização e modularidade
- Testabilidade
- Documentação clara
- Integração com o sistema existente

### Tópicos de GitHub Actions para Focar
- Workflow syntax e triggers
- Jobs, steps e actions
- Runners e environments
- Secrets e variables
- Conditional execution
- Matrix strategies
- Custom actions
- Security best practices
- Deployment strategies
- Monitoring e troubleshooting
