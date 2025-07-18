'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/types';
import MermaidRenderer from './MermaidRenderer';
import AIFlowchartGenerator from '@/lib/aiFlowchartGenerator';
import FlowchartCacheManager from '@/lib/flowchartCache';

interface MermaidArchitectureFlowchartProps {
  question: Question;
  userAnswers: string[];
  isCorrect: boolean;
  onComplete?: () => void;
}

const MermaidArchitectureFlowchart: React.FC<MermaidArchitectureFlowchartProps> = ({
  question,
  userAnswers,
  isCorrect,
  onComplete
}) => {
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [scenario, setScenario] = useState<string>('');
  const [provider, setProvider] = useState<string>('');

  const aiGenerator = AIFlowchartGenerator.getInstance();
  const cacheManager = FlowchartCacheManager.getInstance();

  useEffect(() => {
    generateFlowchart();
  }, [question, userAnswers, isCorrect]);

  const generateFlowchart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
      
      // Detectar cenário
      const detectedScenario = detectScenario(question);
      setScenario(detectedScenario);
      
      // Verificar cache primeiro
      const cachedFlowchart = cacheManager.get(question.id, correctAnswers, detectedScenario);
      
      if (cachedFlowchart) {
        setMermaidCode(cachedFlowchart);
        setProvider('cache');
        setIsLoading(false);
        return;
      }

      // Gerar novo fluxograma
      const result = await aiGenerator.generateFlowchart({
        question,
        userAnswers,
        correctAnswers,
        isCorrect
      });

      setMermaidCode(result.mermaidCode);
      setProvider(result.explanation.includes('Azure') ? 'azure' : 
                  result.explanation.includes('OpenAI') ? 'openai' : 'local');
      
      // Salvar no cache
      cacheManager.set(
        question.id,
        question.questionText,
        correctAnswers,
        result.mermaidCode,
        question.category,
        result.scenario
      );

    } catch (err) {
      console.error('Erro ao gerar fluxograma:', err);
      setError('Erro ao gerar fluxograma. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const detectScenario = (question: Question): string => {
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
  };

  const handleRegenerate = async () => {
    // Limpar cache para esta questão
    const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
    cacheManager.set(question.id, question.questionText, correctAnswers, '', question.category, scenario);
    
    // Gerar novamente
    await generateFlowchart();
  };

  if (!isVisible) return null;

  return (
    <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-purple-800">
            🎯 Fluxograma Explicativo
          </h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            {scenario.replace('-', ' ').toUpperCase()}
          </span>
          {provider && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              provider === 'azure' ? 'bg-blue-100 text-blue-700' :
              provider === 'openai' ? 'bg-green-100 text-green-700' :
              provider === 'cache' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {provider === 'azure' ? '🌟 Azure AI' :
               provider === 'openai' ? '🤖 OpenAI' :
               provider === 'cache' ? '⚡ Cache' :
               '🏠 Local'}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm transition-colors"
          >
            {isLoading ? '🔄' : '🔄 Regenerar'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-purple-600 font-medium">
            Gerando fluxograma contextual...
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-700 font-medium">Erro</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={generateFlowchart}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {mermaidCode && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <MermaidRenderer code={mermaidCode} />
        </div>
      )}

      {mermaidCode && !isLoading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Como Interpretar este Fluxograma:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• <strong>Verde:</strong> Elementos relacionados à resposta correta</li>
            <li>• <strong>Vermelho:</strong> Pontos de decisão ou validação</li>
            <li>• <strong>Azul:</strong> Processos do GitHub Actions</li>
            <li>• <strong>Roxo:</strong> Configurações específicas do cenário</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MermaidArchitectureFlowchart;
