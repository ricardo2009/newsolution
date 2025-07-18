'use client';

import React, { useState, useEffect } from 'react';
import WorkflowVisualizer, { GitHubActionsWorkflowExamples } from './WorkflowVisualizer';

interface AnimatedConceptProps {
  concept: 'workflow' | 'matrix' | 'conditional' | 'secrets' | 'artifacts' | 'custom';
  title?: string;
  description?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

const AnimatedConcept: React.FC<AnimatedConceptProps> = ({
  concept,
  title,
  description,
  autoPlay = true,
  showControls = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const conceptData = {
    workflow: {
      title: 'Fluxo de Trabalho Básico',
      description: 'Demonstra um pipeline CI/CD completo com checkout, build, test e deploy',
      steps: GitHubActionsWorkflowExamples.cicdPipeline,
      color: 'blue'
    },
    matrix: {
      title: 'Estratégia de Matrix',
      description: 'Executa jobs em paralelo para diferentes versões do Node.js',
      steps: GitHubActionsWorkflowExamples.matrixStrategy,
      color: 'green'
    },
    conditional: {
      title: 'Execução Condicional',
      description: 'Demonstra como usar condições para controlar a execução de steps',
      steps: GitHubActionsWorkflowExamples.conditionalWorkflow,
      color: 'purple'
    },
    secrets: {
      title: 'Gerenciamento de Secrets',
      description: 'Como usar secrets de forma segura em workflows',
      steps: [
        {
          id: 'setup',
          name: 'Setup Environment',
          type: 'step' as const,
          status: 'success' as const,
          duration: 10,
          details: 'Configure environment variables'
        },
        {
          id: 'access-secret',
          name: 'Access Secret',
          type: 'step' as const,
          status: 'success' as const,
          duration: 5,
          details: '\${{ secrets.DATABASE_URL }}'
        },
        {
          id: 'deploy',
          name: 'Deploy with Secrets',
          type: 'action' as const,
          status: 'success' as const,
          duration: 30,
          details: 'Deploy using sensitive data'
        }
      ],
      color: 'red'
    },
    artifacts: {
      title: 'Artifacts e Cache',
      description: 'Como usar artifacts para compartilhar dados entre jobs',
      steps: [
        {
          id: 'build',
          name: 'Build Application',
          type: 'step' as const,
          status: 'success' as const,
          duration: 60,
          details: 'npm run build'
        },
        {
          id: 'upload-artifact',
          name: 'Upload Artifact',
          type: 'action' as const,
          status: 'success' as const,
          duration: 15,
          details: 'actions/upload-artifact@v3'
        },
        {
          id: 'download-artifact',
          name: 'Download Artifact',
          type: 'action' as const,
          status: 'success' as const,
          duration: 10,
          details: 'actions/download-artifact@v3'
        },
        {
          id: 'test-with-artifact',
          name: 'Test with Artifact',
          type: 'step' as const,
          status: 'success' as const,
          duration: 45,
          details: 'Run tests with build artifacts'
        }
      ],
      color: 'yellow'
    },
    custom: {
      title: 'Custom Workflow',
      description: 'Workflow personalizado',
      steps: [],
      color: 'gray'
    }
  };

  const currentConcept = conceptData[concept];

  const renderConceptAnimation = () => {
    switch (concept) {
      case 'workflow':
      case 'matrix':
      case 'conditional':
      case 'secrets':
      case 'artifacts':
        return (
          <WorkflowVisualizer
            steps={currentConcept.steps}
            isAnimated={autoPlay}
            showTimeline={showControls}
            onStepClick={(step) => console.log('Step clicked:', step)}
          />
        );
      
      default:
        return (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <div className="text-4xl mb-4">🚧</div>
            <p className="text-gray-600">Conceito customizado não implementado</p>
          </div>
        );
    }
  };

  const renderStaticDiagram = () => {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            📊 Diagrama de Conceito
          </h3>
          <p className="text-gray-600 text-sm">{currentConcept.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exemplo de diagrama estático */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold text-blue-800">Trigger</h4>
              <p className="text-sm text-blue-600">Push, PR, Schedule</p>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-center">
              <div className="text-2xl mb-2">🏗️</div>
              <h4 className="font-semibold text-green-800">Jobs</h4>
              <p className="text-sm text-green-600">Paralelos ou sequenciais</p>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-semibold text-purple-800">Steps</h4>
              <p className="text-sm text-purple-600">Comandos individuais</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCodeExample = () => {
    const yamlExamples = {
      workflow: `name: CI/CD Pipeline
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build`,
      
      matrix: `name: Matrix Strategy
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
        os: [ubuntu-latest, windows-latest]
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - run: npm ci
      - run: npm test`,
      
      conditional: `name: Conditional Workflow
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check changes
        id: changes
        run: |
          if git diff --name-only \${{ github.event.before }} \${{ github.sha }} | grep -q "src/"; then
            echo "src=true" >> $GITHUB_OUTPUT
          fi
      - name: Run tests
        if: steps.changes.outputs.src == 'true'
        run: npm test
      - name: Deploy to staging
        if: github.ref == 'refs/heads/main'
        run: echo "Deploying to staging"`,
      
      secrets: `name: Using Secrets
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
          API_KEY: \${{ secrets.API_KEY }}
        run: |
          echo "Deploying with secure credentials"
          # Deploy script here`,
      
      artifacts: `name: Artifacts Example
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/
  
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
      - name: Test with artifacts
        run: npm test`,
      
      custom: '# Custom workflow example'
    };

    return (
      <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-green-400 font-semibold">workflow.yml</h4>
          <button
            onClick={() => {
              try {
                navigator.clipboard.writeText(yamlExamples[concept]);
              } catch (error) {
                console.warn('Clipboard not available:', error);
                // Fallback: create a temporary text area
                const textArea = document.createElement('textarea');
                textArea.value = yamlExamples[concept];
                document.body.appendChild(textArea);
                textArea.select();
                try {
                  document.execCommand('copy');
                } catch (e) {
                  console.warn('Copy command failed:', e);
                }
                document.body.removeChild(textArea);
              }
            }}
            className="text-gray-400 hover:text-white text-sm"
          >
            📋 Copiar
          </button>
        </div>
        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
          {yamlExamples[concept]}
        </pre>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {title || currentConcept.title}
        </h2>
        <p className="text-gray-600">
          {description || currentConcept.description}
        </p>
      </div>

      {/* Animação do conceito */}
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {renderConceptAnimation()}
      </div>

      {/* Diagrama estático */}
      <div className="lg:hidden">
        {renderStaticDiagram()}
      </div>

      {/* Exemplo de código */}
      {showControls && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            💻 Exemplo de Código
          </h3>
          {renderCodeExample()}
        </div>
      )}

      {/* Dicas adicionais */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Dicas Importantes</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          {concept === 'workflow' && (
            <>
              <li>• Workflows são executados em resposta a eventos</li>
              <li>• Jobs podem executar em paralelo ou sequencialmente</li>
              <li>• Use actions da comunidade para reutilizar código</li>
            </>
          )}
          {concept === 'matrix' && (
            <>
              <li>• Matrix permite testar múltiplas configurações</li>
              <li>• Jobs de matrix executam em paralelo</li>
              <li>• Use `fail-fast: false` para continuar mesmo com falhas</li>
            </>
          )}
          {concept === 'conditional' && (
            <>
              <li>• Condições podem usar contextos do GitHub</li>
              <li>• Use `if` para controlar execução de steps/jobs</li>
              <li>• Combine com outputs para workflows complexos</li>
            </>
          )}
          {concept === 'secrets' && (
            <>
              <li>• Nunca exponha secrets em logs</li>
              <li>• Use environments para controle de acesso</li>
              <li>• Secrets são automaticamente mascarados nos logs</li>
            </>
          )}
          {concept === 'artifacts' && (
            <>
              <li>• Artifacts persistem entre jobs</li>
              <li>• Use cache para dependências</li>
              <li>• Artifacts expiram após período configurado</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AnimatedConcept;
