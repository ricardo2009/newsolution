'use client';

import { useState, useCallback } from 'react';
import { ParsedExamData } from '@/types';
import LoadingSpinner from './LoadingSpinner';

interface PDFUploaderProps {
  onQuestionsLoaded: (data: ParsedExamData) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onQuestionsLoaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadPDF = useCallback(async (file: File) => {
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      setError('Arquivo muito grande. Limite de 50MB.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      console.log('Enviando arquivo:', file.name, file.size, file.type);

      // Simular progresso durante o upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Erro na resposta:', responseText);
        
        // Tentar parsear como JSON
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || 'Erro desconhecido');
        } catch (parseError) {
          // Se não conseguir parsear, é provavelmente HTML
          if (responseText.includes('<!DOCTYPE')) {
            throw new Error('Erro interno do servidor. Verifique os logs do console.');
          }
          throw new Error(`Erro ${response.status}: ${responseText.substring(0, 100)}...`);
        }
      }

      const data: ParsedExamData = await response.json();
      console.log('Dados recebidos:', data);
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('Nenhuma questão foi encontrada no PDF. Verifique o formato do arquivo.');
      }

      console.log(`Sucesso: ${data.questions.length} questões extraídas`);
      onQuestionsLoaded(data);
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onQuestionsLoaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadPDF(e.dataTransfer.files[0]);
    }
  }, [uploadPDF]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadPDF(e.target.files[0]);
    }
  }, [uploadPDF]);

  if (isUploading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <LoadingSpinner size="large" message="Processando PDF..." />
        </div>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
        
        <div className="text-gray-600">
          <p className="mb-2">Extraindo questões do PDF...</p>
          <p className="text-sm">
            {uploadProgress < 30 && 'Analisando estrutura do documento...'}
            {uploadProgress >= 30 && uploadProgress < 60 && 'Identificando questões...'}
            {uploadProgress >= 60 && uploadProgress < 90 && 'Processando opções e respostas...'}
            {uploadProgress >= 90 && 'Finalizando processamento...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Carregar Questões do PDF
        </h2>
        <p className="text-gray-600">
          Faça upload do arquivo PDF com as questões do exame GH-200
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mb-4">
          <p className="text-lg text-gray-700 mb-2">
            Arraste o arquivo PDF aqui ou
          </p>
          <label className="cursor-pointer">
            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Selecionar arquivo
            </span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>

        <div className="text-sm text-gray-500">
          <p>Formatos aceitos: PDF</p>
          <p>Tamanho máximo: 50MB</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-medium">Erro:</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">
          📋 Sobre o processamento:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Extração automática de 70+ questões</li>
          <li>• Identificação de opções múltiplas (A, B, C, D, E)</li>
          <li>• Detecção de respostas corretas</li>
          <li>• Categorização por tópicos</li>
          <li>• Extração de exemplos de código</li>
          <li>• Análise de dificuldade</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFUploader;
