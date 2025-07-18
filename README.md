# GitHub Actions GH-200 - Simulador de Certificação

## 🎯 Sobre o Projeto

Este é um simulador interativo e educacional para a certificação **GitHub Actions GH-200**. O projeto foi desenvolvido para processar PDFs com 70+ questões reais e oferece uma experiência de aprendizado completa e envolvente.

## ✨ Funcionalidades Principais

### 📄 Processamento Inteligente de PDF
- **Extração Automática**: Processa PDFs com 70+ questões do exame oficial
- **Parsing Avançado**: Identifica questões, opções (A-E) e respostas corretas
- **Detecção de Código**: Extrai exemplos de código YAML automaticamente
- **Categorização**: Classifica questões por tópico (Workflows, Actions, Runners, etc.)
- **Análise de Dificuldade**: Determina nível (Iniciante, Intermediário, Avançado)

### 🎓 Experiência Educacional Completa
- **Questões Reais**: Simulação real do exame GH-200 com questões extraídas do PDF
- **Explicações Detalhadas**: Cada resposta inclui explicações educativas
- **Exemplos Práticos**: Código GitHub Actions real e funcional
- **Múltiplas Categorias**: Workflows, Actions, Runners, Secrets, Security, etc.
- **Níveis de Dificuldade**: Iniciante, Intermediário e Avançado

### 📊 Rastreamento Avançado de Progresso
- **Estatísticas Detalhadas**: Desempenho por categoria e dificuldade
- **Cronômetro**: Simulação de tempo real de exame
- **Progresso Visual**: Barras de progresso e indicadores visuais
- **Relatórios Completos**: Análise completa dos resultados
- **Recomendações**: Sugestões de estudo personalizadas

### 🎨 Interface Moderna
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animações Suaves**: Transições elegantes e feedback visual
- **Acessibilidade**: Seguindo padrões de acessibilidade web
- **Dual Mode**: Carregar PDF ou usar questões de exemplo

### 🔧 Funcionalidades Técnicas
- **API de Processamento**: Processamento de PDF no servidor
- **Persistência Local**: Salva progresso localmente no navegador
- **Modos de Exame**: Prática, Cronometrado e Revisão
- **Exportação**: Impressão de resultados e relatórios

## 🚀 Tecnologias Utilizadas

- **Next.js 15**: Framework React moderno com App Router
- **TypeScript**: Tipagem estática para melhor desenvolvimento
- **Tailwind CSS**: Framework CSS utilitário para estilização
- **React Hooks**: Gerenciamento de estado moderno
- **PDF Processing**: Extração inteligente de conteúdo de PDFs

## 📋 Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Arquivo PDF com questões do exame GH-200

## 🛠️ Instalação e Configuração

1. **Clone o repositório**:
   ```bash
   git clone <repositório>
   cd newsolution
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o ambiente**:
   ```bash
   cp .env.example .env.local
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**:
   ```
   http://localhost:3000
   ```

## 🎮 Como Usar

### 1. Carregar Questões
- Coloque o arquivo PDF do exame GH-200 na pasta `public/`
- A aplicação processará automaticamente o PDF e extrairá as questões

### 2. Escolher Modo de Exame
- **Prática**: Sem limite de tempo, com explicações imediatas
- **Cronometrado**: Simula condições reais de exame
- **Revisão**: Foco em questões já respondidas

### 3. Responder Questões
- Leia a questão e exemplos de código
- Selecione a resposta correta
- Veja explicações detalhadas
- Avance para a próxima questão

### 4. Analisar Resultados
- Veja estatísticas por categoria
- Identifique áreas para melhorar
- Exporte relatórios de desempenho

## 📚 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/             # Componentes React
│   ├── QuestionCard.tsx   # Componente de questão
│   ├── ProgressBar.tsx    # Barra de progresso
│   ├── StatsPanel.tsx     # Painel de estatísticas
│   ├── Timer.tsx          # Cronômetro
│   ├── NavigationControls.tsx  # Controles de navegação
│   └── LoadingSpinner.tsx # Indicador de carregamento
├── lib/                    # Utilitários e lógica
│   ├── pdfProcessor.ts    # Processamento de PDF
│   └── examManager.ts     # Gerenciamento de exames
└── types/                  # Definições TypeScript
    └── index.ts           # Tipos principais
```

## 🎯 Tópicos Cobertos

### Workflows
- Sintaxe YAML
- Triggers e eventos
- Jobs e steps
- Expressões e contextos

### Actions
- Actions do marketplace
- Custom actions
- Composite actions
- Action metadata

### Runners
- GitHub-hosted runners
- Self-hosted runners
- Runner environments
- Matrix strategies

### Secrets e Variáveis
- Repository secrets
- Environment secrets
- Organization secrets
- Variables de ambiente

### Segurança
- Permissions
- GITHUB_TOKEN
- Security hardening
- Vulnerability scanning

### Deployment
- Environment protection
- Deployment strategies
- Review processes
- Monitoring

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Verifique a documentação
2. Consulte as issues existentes
3. Crie uma nova issue se necessário

## 🎓 Recursos Adicionais

- [Documentação Oficial GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Guia de Certificação GH-200](https://docs.github.com/en/certifications)

## 🚨 Problemas Conhecidos e Soluções

### PDF Protegido - Problema Identificado

**Problema**: Os arquivos PDF fornecidos (`GH-200-Full-File.pdf` e `gh-200limpo.pdf`) estão protegidos por Microsoft Office e não podem ser lidos pela biblioteca `pdf-parse`.

**Erro Comum**:
```
Erro: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Causa**: O PDF está protegido e retorna uma mensagem HTML em vez de conteúdo legível:
```
"Este arquivo PDF é protegido. Você precisará de outro leitor para exibir esse conteúdo"
```

### 🔧 Soluções Disponíveis

#### 1. **Usar Questões de Exemplo (Recomendado)**
- Clique em "Carregar Questões de Exemplo" na página principal
- 8 questões detalhadas sobre GitHub Actions
- Funcionalidade completa do simulador
- Perfeito para testar e demonstrar o sistema

#### 2. **Converter PDF Protegido**
```bash
# Usando qpdf para remover proteção
qpdf --password="" --decrypt protected.pdf unprotected.pdf

# Usando pdftk
pdftk protected.pdf output unprotected.pdf
```

#### 3. **Verificar Status do Sistema**
- Acesse `/status` para diagnóstico completo
- Verifica status da API e bibliotecas
- Mostra problemas específicos identificados

### 📊 Status de Funcionalidades

| Funcionalidade | Status | Observações |
|---|---|---|
| ✅ Interface do Usuário | Funcionando | Completa e responsiva |
| ✅ Questões de Exemplo | Funcionando | 8 questões sobre GitHub Actions |
| ✅ Navegação | Funcionando | Anterior/Próximo, filtros, busca |
| ✅ Cronômetro | Funcionando | Tempo real de exame |
| ✅ Estatísticas | Funcionando | Progresso detalhado por categoria |
| ✅ Exportação | Funcionando | Relatórios e impressão |
| ✅ API de Processamento | Funcionando | Pronto para PDFs não protegidos |
| ⚠️ Upload de PDF | Limitado | Apenas PDFs não protegidos |
| ❌ PDFs Fornecidos | Não funcionam | Protegidos pelo Microsoft Office |

## 🎯 Funcionalidades Implementadas

### 📄 Processamento Inteligente de PDF
- **Parser Robusto**: Múltiplos padrões de detecção de questões
- **Logs Detalhados**: Debugging completo do processo de extração
- **Tratamento de Erros**: Mensagens claras sobre problemas
- **Validação**: Verificação de formato e conteúdo

### 🎓 Experiência Educacional
- **Questões de Exemplo**: 8 questões sobre GitHub Actions
- **Explicações Imediatas**: Detalhes sobre cada resposta
- **Sem Limite de Tempo**: Pratique no seu ritmo
- **Interface Completa**: Acesse todas as funcionalidades

---

**Boa sorte com sua certificação GitHub Actions GH-200!** 🚀
