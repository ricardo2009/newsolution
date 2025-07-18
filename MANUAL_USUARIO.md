# Manual do Usuário - Simulador GitHub Actions GH-200

## 🚀 Introdução

O Simulador GitHub Actions GH-200 é uma ferramenta educacional interativa projetada para ajudar desenvolvedores a se prepararem para a certificação GitHub Actions GH-200. O simulador oferece duas modalidades de uso:

1. **Modo PDF**: Carregue um PDF oficial com as questões reais do exame
2. **Modo Exemplo**: Pratique com questões de exemplo para familiarizar-se com a interface

## 📋 Funcionalidades Principais

### 🔍 Sistema de Busca
- Busque questões por texto, categoria, explicação ou tópicos relacionados
- Busca em tempo real com destaque de resultados
- Filtros inteligentes para refinar os resultados

### 📊 Filtros Avançados
- **Por Categoria**: Workflows, Actions, Runners, Security, etc.
- **Por Dificuldade**: Iniciante, Intermediário, Avançado
- **Por Estado**: Mostrar apenas questões respondidas incorretamente
- **Por Favoritos**: Questões marcadas como favoritas

### ⭐ Sistema de Favoritos
- Marque questões importantes com estrela
- Filtre para mostrar apenas questões favoritas
- Ideal para revisão de tópicos específicos

### 📈 Estatísticas Detalhadas
- Progresso em tempo real
- Estatísticas por categoria
- Tempo gasto por questão
- Porcentagem de acertos

### 📤 Exportação de Resultados
- **JSON**: Dados completos da sessão
- **CSV**: Planilha com questões e respostas
- **HTML/PDF**: Relatório detalhado para impressão

### ⏱️ Modos de Exame
- **Prática**: Sem limite de tempo, com explicações
- **Cronometrado**: Simula condições reais de exame
- **Revisão**: Foco em questões respondidas incorretamente

## 🎯 Como Usar

### 1. Iniciando o Simulador

1. **Acesse**: http://localhost:3002
2. **Escolha o modo**:
   - **"Carregar PDF"**: Para usar questões reais do exame
   - **"Começar Agora"**: Para praticar com exemplos

### 2. Carregando um PDF

1. Clique em "Carregar PDF"
2. Selecione o arquivo PDF oficial do exame GH-200
3. Aguarde o processamento automático
4. As questões serão extraídas e carregadas automaticamente

### 3. Navegando pelas Questões

1. **Leia a questão** cuidadosamente
2. **Selecione uma resposta** clicando na opção desejada
3. **Veja a explicação** após responder
4. **Navegue** usando os botões "Anterior" e "Próximo"

### 4. Usando Filtros

1. **Clique em "Mostrar Filtros"** para expandir o painel
2. **Selecione critérios**:
   - Categoria específica
   - Nível de dificuldade
   - Apenas questões incorretas
   - Apenas favoritas
3. **Os resultados são atualizados** automaticamente

### 5. Sistema de Busca

1. **Digite no campo de busca** no topo da página
2. **A busca é em tempo real** - resultados aparecem conforme você digita
3. **Busca em**: texto da questão, categoria, explicação, tópicos relacionados

### 6. Marcando Favoritos

1. **Clique na estrela** (☆) ao lado do ID da questão
2. **Estrela preenchida** (★) indica questão favorita
3. **Use o filtro "Apenas favoritas"** para revisão

### 7. Exportando Resultados

1. **Responda algumas questões** para gerar dados
2. **Clique no botão de exportação** desejado:
   - **JSON**: Para desenvolvedores, dados completos
   - **CSV**: Para planilhas, análise de dados
   - **HTML**: Para relatórios, visualização

## 🔧 Funcionalidades Avançadas

### Processamento de PDF
- **Extração automática** de questões do PDF
- **Identificação inteligente** de opções de resposta
- **Categorização automática** por tópicos
- **Preservação de formatação** de código

### Análise de Progresso
- **Rastreamento por categoria**: Veja seu desempenho em cada área
- **Tempo por questão**: Identifique onde gasta mais tempo
- **Histórico de respostas**: Revise suas escolhas
- **Sugestões de melhoria**: Baseadas no seu desempenho

### Interface Responsiva
- **Funciona em desktop e mobile**
- **Ajusta-se a diferentes tamanhos de tela**
- **Navegação otimizada** para touch e teclado

## 📝 Dicas de Uso

### Para Melhor Preparação
1. **Comece com questões de exemplo** para entender a interface
2. **Use o PDF oficial** para prática realista
3. **Revise questões incorretas** usando os filtros
4. **Marque questões difíceis** como favoritas
5. **Pratique regularmente** para melhorar o desempenho

### Para Desenvolvedores
- **Arquivo de configuração**: `src/types/index.ts`
- **Personalização**: Modifique os componentes em `src/components/`
- **Novos parsers**: Adicione em `src/lib/pdfProcessor.ts`

## 🐛 Solução de Problemas

### PDF não carrega
1. **Verifique o formato**: Apenas PDFs são aceitos
2. **Tamanho do arquivo**: Máximo 10MB
3. **Conteúdo**: PDF deve conter texto selecionável

### Questões não aparecem
1. **Aguarde o processamento**: Pode levar alguns segundos
2. **Verifique os filtros**: Podem estar limitando os resultados
3. **Limpe a busca**: Campo de busca pode estar filtrando

### Interface lenta
1. **Muitas questões**: Use filtros para reduzir o número
2. **Feche outros programas**: Libere memória RAM
3. **Atualize a página**: Recarregue o simulador

## 📊 Estrutura de Dados

### Formato das Questões
```typescript
interface Question {
  id: string;
  questionText: string;
  questionType: 'multiple-choice' | 'true-false' | 'code-completion';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  codeExample?: string;
  relatedTopics: string[];
}
```

### Sessão de Exame
```typescript
interface ExamSession {
  id: string;
  startTime: Date;
  questions: Question[];
  userProgress: UserProgress;
  mode: 'practice' | 'timed' | 'review';
}
```

## 🎓 Categorias do Exame

### Principais Áreas
1. **Workflow Syntax**: Sintaxe e estrutura dos workflows
2. **Actions**: Criação e uso de actions personalizadas
3. **Runners**: Configuração e gerenciamento de runners
4. **Security**: Melhores práticas de segurança
5. **Deployment**: Estratégias de deployment
6. **Monitoring**: Monitoramento e troubleshooting

### Níveis de Dificuldade
- **Iniciante**: Conceitos básicos, sintaxe fundamental
- **Intermediário**: Configurações avançadas, best practices
- **Avançado**: Cenários complexos, troubleshooting

## 📞 Suporte

### Informações Técnicas
- **Versão**: 1.0.0
- **Tecnologia**: Next.js 15 + TypeScript
- **Compatibilidade**: Chrome, Firefox, Safari, Edge
- **Requisitos**: JavaScript habilitado

### Melhorias Futuras
- [ ] Modo colaborativo
- [ ] Integração com GitHub
- [ ] Mais formatos de questões
- [ ] Análise de desempenho avançada
- [ ] Suporte a múltiplos idiomas

---

*Este simulador é uma ferramenta educacional independente e não é oficialmente endossado pelo GitHub.*
