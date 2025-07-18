'use client';

import FlowchartDemo from '@/components/FlowchartDemo';
import WorkflowVisualizer from '@/components/WorkflowVisualizer';

export default function VisualDemoPage() {
  const sampleWorkflowSteps = [
    {
      id: "1",
      name: "Checkout",
      type: "action" as const,
      status: "success" as const,
      details: "Faz checkout do código do repositório"
    },
    {
      id: "2", 
      name: "Setup Node.js",
      type: "action" as const,
      status: "success" as const,
      details: "Configura o ambiente Node.js"
    },
    {
      id: "3",
      name: "Install Dependencies",
      type: "step" as const,
      status: "success" as const,
      details: "Instala as dependências do projeto"
    },
    {
      id: "4",
      name: "Build",
      type: "step" as const,
      status: "running" as const,
      details: "Faz build do projeto"
    },
    {
      id: "5",
      name: "Deploy to Azure",
      type: "action" as const,
      status: "pending" as const,
      details: "Deploy para Azure Web App"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-8">
            {/* Fluxograma Demo */}
            <div>
              <FlowchartDemo />
            </div>
            
            {/* Workflow Visualizer */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                🔄 Visualizador de Workflow GitHub Actions
              </h2>
              <WorkflowVisualizer steps={sampleWorkflowSteps} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
