'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question } from '@/types';

interface FlowchartStep {
  id: string;
  title: string;
  description: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'action';
  isCorrect?: boolean;
  color: string;
  position: { x: number; y: number };
  connections: string[];
}

interface AnimatedFlowchartProps {
  question: Question;
  userAnswer: string | string[];
  isCorrect: boolean;
  onComplete?: () => void;
}

const AnimatedFlowchart: React.FC<AnimatedFlowchartProps> = ({
  question,
  userAnswer,
  isCorrect,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState<FlowchartStep[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    generateFlowchartSteps();
  }, [question, userAnswer, isCorrect]);

  const generateFlowchartSteps = () => {
    const baseSteps: FlowchartStep[] = [
      {
        id: 'start',
        title: 'Início',
        description: 'Analisando a questão...',
        type: 'start',
        color: '#3B82F6',
        position: { x: 50, y: 10 },
        connections: ['analyze']
      },
      {
        id: 'analyze',
        title: 'Análise da Questão',
        description: question.questionText.substring(0, 80) + '...',
        type: 'process',
        color: '#8B5CF6',
        position: { x: 50, y: 25 },
        connections: ['decision']
      },
      {
        id: 'decision',
        title: 'Sua Resposta',
        description: `Você escolheu: ${Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer}`,
        type: 'decision',
        color: isCorrect ? '#10B981' : '#EF4444',
        position: { x: 50, y: 45 },
        connections: [isCorrect ? 'correct' : 'incorrect']
      }
    ];

    if (isCorrect) {
      baseSteps.push({
        id: 'correct',
        title: '✅ Resposta Correta!',
        description: 'Parabéns! Sua resposta está correta.',
        type: 'end',
        isCorrect: true,
        color: '#10B981',
        position: { x: 50, y: 65 },
        connections: ['explanation']
      });
    } else {
      baseSteps.push({
        id: 'incorrect',
        title: '❌ Resposta Incorreta',
        description: 'Vamos entender o que aconteceu...',
        type: 'action',
        isCorrect: false,
        color: '#EF4444',
        position: { x: 30, y: 65 },
        connections: ['correction']
      });
      
      baseSteps.push({
        id: 'correction',
        title: '📚 Resposta Correta',
        description: `A resposta correta é: ${Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}`,
        type: 'process',
        color: '#10B981',
        position: { x: 70, y: 65 },
        connections: ['explanation']
      });
    }

    baseSteps.push({
      id: 'explanation',
      title: '💡 Explicação',
      description: question.explanation,
      type: 'end',
      color: '#F59E0B',
      position: { x: 50, y: 85 },
      connections: []
    });

    setSteps(baseSteps);
  };

  const startAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          onComplete?.();
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const getStepIcon = (type: FlowchartStep['type']) => {
    switch (type) {
      case 'start': return '🚀';
      case 'process': return '⚙️';
      case 'decision': return '🤔';
      case 'action': return '⚡';
      case 'end': return '🎯';
      default: return '📋';
    }
  };

  const getStepShape = (type: FlowchartStep['type']) => {
    switch (type) {
      case 'start':
      case 'end':
        return 'rounded-full';
      case 'decision':
        return 'transform rotate-45';
      default:
        return 'rounded-lg';
    }
  };

  const renderConnection = (from: FlowchartStep, to: FlowchartStep, index: number) => {
    const isActive = currentStep > steps.findIndex(s => s.id === from.id);
    
    return (
      <line
        key={`${from.id}-${to.id}`}
        x1={`${from.position.x}%`}
        y1={`${from.position.y + 5}%`}
        x2={`${to.position.x}%`}
        y2={`${to.position.y - 5}%`}
        stroke={isActive ? '#3B82F6' : '#E5E7EB'}
        strokeWidth="2"
        strokeDasharray={isActive ? '0' : '5,5'}
        className={`transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}
        markerEnd="url(#arrowhead)"
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          🎯 Fluxograma da Resposta
        </h3>
        <div className="flex gap-2">
          <button
            onClick={startAnimation}
            disabled={isPlaying}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isPlaying
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isPlaying ? '⏸️ Reproduzindo...' : '▶️ Iniciar Animação'}
          </button>
          <button
            onClick={() => setCurrentStep(steps.length - 1)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ⏭️ Pular para o Fim
          </button>
        </div>
      </div>

      <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          className="absolute inset-0"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#3B82F6"
              />
            </marker>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Render connections */}
          {steps.map(step => 
            step.connections.map(connectionId => {
              const targetStep = steps.find(s => s.id === connectionId);
              return targetStep ? renderConnection(step, targetStep, 0) : null;
            })
          )}
        </svg>

        {/* Render steps */}
        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isAnimating = index === currentStep && isPlaying;
          
          return (
            <div
              key={step.id}
              className={`absolute transition-all duration-500 transform ${
                isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-30'
              } ${isAnimating ? 'animate-pulse' : ''}`}
              style={{
                left: `${step.position.x}%`,
                top: `${step.position.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isActive ? 10 : 5
              }}
            >
              <div
                className={`relative p-4 min-w-48 text-center ${getStepShape(step.type)} shadow-lg border-2 transition-all duration-300`}
                style={{
                  backgroundColor: isActive ? step.color : '#F3F4F6',
                  borderColor: step.color,
                  filter: isAnimating ? 'url(#glow)' : 'none'
                }}
              >
                <div className="text-2xl mb-2">
                  {getStepIcon(step.type)}
                </div>
                <h4 className={`font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {step.title}
                </h4>
                <p className={`text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {step.description.length > 50 
                    ? step.description.substring(0, 50) + '...' 
                    : step.description}
                </p>
                
                {/* Step number indicator */}
                <div
                  className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-white text-gray-800' : 'bg-gray-400 text-white'
                  }`}
                >
                  {index + 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step details */}
      {steps[currentStep] && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
            {getStepIcon(steps[currentStep].type)}
            {steps[currentStep].title}
          </h4>
          <p className="text-gray-700">
            {steps[currentStep].description}
          </p>
          
          {steps[currentStep].id === 'explanation' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-2">
                📝 Tópicos Relacionados:
              </h5>
              <div className="flex flex-wrap gap-2">
                {question.relatedTopics.map(topic => (
                  <span
                    key={topic}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Progresso: {currentStep + 1} de {steps.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedFlowchart;
