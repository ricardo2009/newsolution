import { NextRequest, NextResponse } from 'next/server';
import { ParsedExamData, Question } from '@/types';

// Função para gerar questões de exemplo
function generateSampleQuestions(): Question[] {
  return [
    {
      id: 'gh200-sample-1',
      questionText: 'Qual é o arquivo de configuração usado para definir workflows no GitHub Actions?',
      questionType: 'multiple-choice',
      options: [
        'action.yml',
        'workflow.yml',
        'config.yml',
        'github-actions.yml'
      ],
      correctAnswer: 'A',
      explanation: 'O arquivo action.yml é usado para definir ações personalizadas, enquanto os workflows são definidos em arquivos .yml na pasta .github/workflows/',
      category: 'Workflows',
      difficulty: 'beginner',
      relatedTopics: ['YAML', 'Configuration', 'Workflows'],
      page: 1
    },
    {
      id: 'gh200-sample-2',
      questionText: 'Qual evento é usado para executar um workflow quando um pull request é aberto?',
      questionType: 'multiple-choice',
      options: [
        'on: push',
        'on: pull_request',
        'on: merge',
        'on: commit'
      ],
      correctAnswer: 'B',
      explanation: 'O evento "pull_request" é usado para executar workflows quando pull requests são criados, atualizados ou fechados.',
      category: 'Workflows',
      difficulty: 'beginner',
      relatedTopics: ['Events', 'Pull Requests', 'Triggers'],
      page: 1,
      codeExample: `name: PR Workflow
on:
  pull_request:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest`
    },
    {
      id: 'gh200-sample-3',
      questionText: 'Qual é a sintaxe correta para usar uma action do marketplace?',
      questionType: 'multiple-choice',
      options: [
        'action: actions/checkout@v3',
        'uses: actions/checkout@v3',
        'run: actions/checkout@v3',
        'with: actions/checkout@v3'
      ],
      correctAnswer: 'B',
      explanation: 'A palavra-chave "uses" é usada para referenciar actions do marketplace ou repositórios.',
      category: 'Actions',
      difficulty: 'beginner',
      relatedTopics: ['Marketplace', 'Actions', 'Syntax'],
      page: 1,
      codeExample: `steps:
  - uses: actions/checkout@v3
  - uses: actions/setup-node@v3
    with:
      node-version: '18'`
    },
    {
      id: 'gh200-sample-4',
      questionText: 'Como você pode passar variáveis de ambiente para um step específico?',
      questionType: 'multiple-choice',
      options: [
        'Usando env: no nível do job',
        'Usando env: no nível do step',
        'Usando vars: no step',
        'Usando environment: no step'
      ],
      correctAnswer: 'B',
      explanation: 'Variáveis de ambiente podem ser definidas no nível do job (para todos os steps) ou no nível do step (para aquele step específico).',
      category: 'Environment Variables',
      difficulty: 'intermediate',
      relatedTopics: ['Environment Variables', 'Job Configuration'],
      page: 1,
      codeExample: `steps:
  - name: Build
    run: npm run build
    env:
      NODE_ENV: production
      API_URL: \${{ vars.API_URL }}`
    },
    {
      id: 'gh200-sample-5',
      questionText: 'Qual é o runner padrão para executar jobs no GitHub Actions?',
      questionType: 'multiple-choice',
      options: [
        'windows-latest',
        'macos-latest',
        'ubuntu-latest',
        'linux-latest'
      ],
      correctAnswer: 'C',
      explanation: 'ubuntu-latest é o runner mais comumente usado e é gratuito para repositórios públicos.',
      category: 'Runners',
      difficulty: 'beginner',
      relatedTopics: ['Runners', 'Operating Systems', 'Infrastructure'],
      page: 1
    },
    {
      id: 'gh200-sample-6',
      questionText: 'Como você pode condicionar a execução de um step?',
      questionType: 'multiple-choice',
      options: [
        'Usando when:',
        'Usando if:',
        'Usando condition:',
        'Usando only:'
      ],
      correctAnswer: 'B',
      explanation: 'A palavra-chave "if:" é usada para criar condições que determinam se um step deve ser executado.',
      category: 'Conditional Execution',
      difficulty: 'intermediate',
      relatedTopics: ['Conditions', 'Control Flow', 'Job Control'],
      page: 1,
      codeExample: `steps:
  - name: Deploy to production
    if: github.ref == 'refs/heads/main'
    run: npm run deploy`
    },
    {
      id: 'gh200-sample-7',
      questionText: 'Qual é a sintaxe para acessar secrets em um workflow?',
      questionType: 'multiple-choice',
      options: [
        '${{ env.SECRET_NAME }}',
        '${{ secrets.SECRET_NAME }}',
        '${{ vars.SECRET_NAME }}',
        '${{ github.secrets.SECRET_NAME }}'
      ],
      correctAnswer: 'B',
      explanation: 'Secrets são acessados usando a sintaxe ${{ secrets.SECRET_NAME }}.',
      category: 'Secrets',
      difficulty: 'intermediate',
      relatedTopics: ['Secrets', 'Security', 'Environment Variables'],
      page: 1,
      codeExample: `steps:
  - name: Deploy
    run: |
      echo "Deploying to production"
      deploy.sh
    env:
      API_KEY: \${{ secrets.API_KEY }}
      DB_PASSWORD: \${{ secrets.DB_PASSWORD }}`
    },
    {
      id: 'gh200-sample-8',
      questionText: 'Qual é a forma correta de fazer upload de artifacts?',
      questionType: 'multiple-choice',
      options: [
        'uses: actions/upload-artifact@v3',
        'uses: github/upload-artifact@v3',
        'run: upload-artifact',
        'with: upload-artifact'
      ],
      correctAnswer: 'A',
      explanation: 'A action actions/upload-artifact@v3 é usada para fazer upload de artifacts.',
      category: 'Artifacts',
      difficulty: 'intermediate',
      relatedTopics: ['Artifacts', 'File Management', 'Actions'],
      page: 1,
      codeExample: `- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/`
    }
  ];
}

export async function GET() {
  const questions = generateSampleQuestions();
  
  const result: ParsedExamData = {
    questions,
    metadata: {
      totalQuestions: questions.length,
      categories: Array.from(new Set(questions.map(q => q.category))),
      extractedAt: new Date(),
      pdfPages: 1,
      pdfSize: 0
    }
  };

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  // Mesma funcionalidade do GET para compatibilidade
  return GET();
}
