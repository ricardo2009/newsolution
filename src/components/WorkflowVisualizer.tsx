'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'job' | 'step' | 'action';
  status: 'pending' | 'running' | 'success' | 'failure' | 'skipped';
  duration?: number;
  details?: string;
  dependencies?: string[];
}

interface WorkflowVisualizerProps {
  steps: WorkflowStep[];
  isAnimated?: boolean;
  showTimeline?: boolean;
  onStepClick?: (step: WorkflowStep) => void;
  className?: string;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  steps,
  isAnimated = true,
  showTimeline = true,
  onStepClick,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAnimated && isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2000 / playbackSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnimated, isPlaying, playbackSpeed, steps.length]);

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'trigger':
        return '⚡';
      case 'job':
        return '🏗️';
      case 'step':
        return '📝';
      case 'action':
        return '🔧';
      default:
        return '📦';
    }
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200 text-gray-600';
      case 'running':
        return 'bg-blue-200 text-blue-800 animate-pulse';
      case 'success':
        return 'bg-green-200 text-green-800';
      case 'failure':
        return 'bg-red-200 text-red-800';
      case 'skipped':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'success':
        return '✅';
      case 'failure':
        return '❌';
      case 'skipped':
        return '⏭️';
      default:
        return '⏳';
    }
  };

  const isStepActive = (index: number) => {
    return isAnimated ? index <= currentStep : true;
  };

  const renderStep = (step: WorkflowStep, index: number) => {
    const isActive = isStepActive(index);
    const isCurrent = isAnimated && index === currentStep;
    
    return (
      <div
        key={step.id}
        className={`relative flex items-center space-x-4 p-4 rounded-lg border transition-all duration-500 cursor-pointer ${
          isActive 
            ? `${getStatusColor(step.status)} border-current` 
            : 'bg-gray-50 text-gray-400 border-gray-200'
        } ${isCurrent ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
        onClick={() => onStepClick && onStepClick(step)}
      >
        <div className={`text-2xl ${isActive ? '' : 'opacity-50'}`}>
          {getStepIcon(step.type)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">{step.name}</h3>
            <span className="text-sm opacity-75 capitalize">{step.type}</span>
          </div>
          {step.details && (
            <p className="text-sm opacity-75 mt-1">{step.details}</p>
          )}
          {step.duration && (
            <p className="text-xs opacity-60 mt-1">
              Duração: {step.duration}s
            </p>
          )}
        </div>
        
        <div className={`text-2xl ${isActive ? '' : 'opacity-50'}`}>
          {getStatusIcon(step.status)}
        </div>
        
        {/* Linha conectora */}
        {index < steps.length - 1 && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className={`w-0.5 h-6 transition-all duration-500 ${
              isActive ? 'bg-blue-400' : 'bg-gray-300'
            }`} />
            <div className={`w-2 h-2 rounded-full absolute top-6 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
              isActive ? 'bg-blue-400' : 'bg-gray-300'
            }`} />
          </div>
        )}
      </div>
    );
  };

  const renderTimeline = () => {
    if (!showTimeline) return null;

    return (
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⏰ Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                  isStepActive(index) ? getStatusColor(step.status) : 'bg-gray-200 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{step.name}</span>
                    <span className="text-sm text-gray-500">({step.type})</span>
                  </div>
                  {step.duration && (
                    <span className="text-xs text-gray-400">
                      {step.duration}s
                    </span>
                  )}
                </div>
                <div className="text-lg">
                  {getStatusIcon(step.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderControls = () => {
    if (!isAnimated) return null;

    return (
      <div className="mt-6 flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg border">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? '⏸️ Pausar' : '▶️ Reproduzir'}
        </button>
        
        <button
          onClick={() => setCurrentStep(0)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          🔄 Reiniciar
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Velocidade:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Passo: {currentStep + 1} de {steps.length}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          🔄 Visualizador de Workflow
        </h2>
        {isAnimated && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              {isPlaying ? 'Reproduzindo...' : 'Pausado'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => renderStep(step, index))}
      </div>

      {renderControls()}
      {renderTimeline()}
    </div>
  );
};

// Componente para criar workflows de exemplo
export const GitHubActionsWorkflowExamples = {
  cicdPipeline: [
    {
      id: 'trigger',
      name: 'Push to main',
      type: 'trigger' as const,
      status: 'success' as const,
      duration: 0,
      details: 'Triggered by push event'
    },
    {
      id: 'checkout',
      name: 'Checkout Code',
      type: 'step' as const,
      status: 'success' as const,
      duration: 5,
      details: 'actions/checkout@v3'
    },
    {
      id: 'setup-node',
      name: 'Setup Node.js',
      type: 'action' as const,
      status: 'success' as const,
      duration: 10,
      details: 'actions/setup-node@v3'
    },
    {
      id: 'install',
      name: 'Install Dependencies',
      type: 'step' as const,
      status: 'success' as const,
      duration: 45,
      details: 'npm ci'
    },
    {
      id: 'test',
      name: 'Run Tests',
      type: 'step' as const,
      status: 'success' as const,
      duration: 30,
      details: 'npm test'
    },
    {
      id: 'build',
      name: 'Build Application',
      type: 'step' as const,
      status: 'success' as const,
      duration: 60,
      details: 'npm run build'
    },
    {
      id: 'deploy',
      name: 'Deploy to Production',
      type: 'action' as const,
      status: 'success' as const,
      duration: 90,
      details: 'Deploy to Azure Storage'
    }
  ],

  matrixStrategy: [
    {
      id: 'trigger',
      name: 'Pull Request',
      type: 'trigger' as const,
      status: 'success' as const,
      duration: 0,
      details: 'Triggered by pull_request event'
    },
    {
      id: 'matrix-node-16',
      name: 'Test Node.js 16',
      type: 'job' as const,
      status: 'success' as const,
      duration: 120,
      details: 'Matrix job for Node.js 16'
    },
    {
      id: 'matrix-node-18',
      name: 'Test Node.js 18',
      type: 'job' as const,
      status: 'success' as const,
      duration: 115,
      details: 'Matrix job for Node.js 18'
    },
    {
      id: 'matrix-node-20',
      name: 'Test Node.js 20',
      type: 'job' as const,
      status: 'failure' as const,
      duration: 45,
      details: 'Matrix job for Node.js 20 - Tests failed'
    }
  ],

  conditionalWorkflow: [
    {
      id: 'trigger',
      name: 'Push or PR',
      type: 'trigger' as const,
      status: 'success' as const,
      duration: 0,
      details: 'on: [push, pull_request]'
    },
    {
      id: 'check-changes',
      name: 'Check File Changes',
      type: 'step' as const,
      status: 'success' as const,
      duration: 5,
      details: 'Check if source files changed'
    },
    {
      id: 'run-tests',
      name: 'Run Tests',
      type: 'step' as const,
      status: 'success' as const,
      duration: 60,
      details: 'if: steps.check-changes.outputs.src == \'true\''
    },
    {
      id: 'deploy-staging',
      name: 'Deploy to Staging',
      type: 'step' as const,
      status: 'success' as const,
      duration: 90,
      details: 'if: github.event_name == \'push\' && github.ref == \'refs/heads/main\''
    },
    {
      id: 'deploy-prod',
      name: 'Deploy to Production',
      type: 'step' as const,
      status: 'skipped' as const,
      duration: 0,
      details: 'if: github.event_name == \'release\''
    }
  ]
};

export default WorkflowVisualizer;
