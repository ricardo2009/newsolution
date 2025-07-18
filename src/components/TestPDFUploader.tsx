'use client';

import { useState } from 'react';

const TestPDFUploader = () => {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestUpload = async (file: File) => {
    setIsLoading(true);
    setResult('');
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      console.log('Enviando para /api/test-pdf...');
      
      const response = await fetch('/api/test-pdf', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      console.log('Resposta bruta:', text);
      
      if (!response.ok) {
        setResult(`Erro ${response.status}: ${text}`);
        return;
      }

      const data = JSON.parse(text);
      setResult(JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('Erro:', error);
      setResult(`Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealUpload = async (file: File) => {
    setIsLoading(true);
    setResult('');
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      console.log('Enviando para /api/process-pdf...');
      
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      console.log('Resposta bruta:', text);
      
      if (!response.ok) {
        setResult(`Erro ${response.status}: ${text}`);
        return;
      }

      const data = JSON.parse(text);
      setResult(JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('Erro:', error);
      setResult(`Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Upload PDF</h1>
      
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium">
          Selecione um arquivo PDF para testar:
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              console.log('Arquivo selecionado:', file.name);
            }
          }}
          className="block w-full text-sm border rounded-lg p-2"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={(e) => {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            const file = input?.files?.[0];
            if (file) handleTestUpload(file);
          }}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testando...' : 'Teste Simples'}
        </button>
        
        <button
          onClick={(e) => {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            const file = input?.files?.[0];
            if (file) handleRealUpload(file);
          }}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Processando...' : 'Teste Completo'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Resultado:</h3>
          <pre className="text-sm overflow-auto">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default TestPDFUploader;
