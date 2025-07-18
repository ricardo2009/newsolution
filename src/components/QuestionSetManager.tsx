'use client';

import React, { useState, useEffect } from 'react';
import { QuestionPersistence, SavedQuestionSet } from '@/lib/questionPersistence';

interface QuestionSetManagerProps {
  onSetSelected: (questionSet: SavedQuestionSet) => void;
  onClose: () => void;
}

const QuestionSetManager: React.FC<QuestionSetManagerProps> = ({
  onSetSelected,
  onClose
}) => {
  const [questionSets, setQuestionSets] = useState<SavedQuestionSet[]>([]);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showExportDialog, setShowExportDialog] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => {
    loadQuestionSets();
  }, []);

  const loadQuestionSets = () => {
    const sets = QuestionPersistence.getAllQuestionSets();
    const currentId = QuestionPersistence.getCurrentQuestionSetId();
    setQuestionSets(sets);
    setCurrentSetId(currentId);
  };

  const handleSelectSet = (set: SavedQuestionSet) => {
    QuestionPersistence.setCurrentQuestionSet(set.id);
    setCurrentSetId(set.id);
    onSetSelected(set);
    onClose();
  };

  const handleDeleteSet = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este conjunto de questões?')) {
      QuestionPersistence.deleteQuestionSet(id);
      loadQuestionSets();
    }
  };

  const handleRenameSet = (id: string) => {
    if (newName.trim()) {
      QuestionPersistence.renameQuestionSet(id, newName.trim());
      setShowRenameDialog(null);
      setNewName('');
      loadQuestionSets();
    }
  };

  const handleExport = (id: string) => {
    try {
      const exportData = QuestionPersistence.exportQuestionSet(id);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questoes-${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowExportDialog(null);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  const handleImport = () => {
    try {
      setImportError('');
      QuestionPersistence.importQuestionSet(importData);
      setShowImportDialog(false);
      setImportData('');
      loadQuestionSets();
    } catch (error) {
      setImportError((error as Error).message);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Workflows': 'bg-blue-100 text-blue-800',
      'Actions': 'bg-green-100 text-green-800',
      'Runners': 'bg-yellow-100 text-yellow-800',
      'Security': 'bg-red-100 text-red-800',
      'Monitoring': 'bg-purple-100 text-purple-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.default;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Gerenciar Conjuntos de Questões
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowImportDialog(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                📥 Importar
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {questionSets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600">Nenhum conjunto de questões salvo.</p>
              <p className="text-gray-500 text-sm mt-2">
                Carregue um PDF para criar seu primeiro conjunto de questões.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {questionSets.map((set) => (
                <div
                  key={set.id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    currentSetId === set.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {set.name}
                        {currentSetId === set.id && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Atual
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {set.questions.length} questões • Criado em {formatDate(set.createdAt)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Usado pela última vez em {formatDate(set.lastUsed)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowRenameDialog(set.id);
                          setNewName(set.name);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Renomear"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setShowExportDialog(set.id)}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Exportar"
                      >
                        📤
                      </button>
                      <button
                        onClick={() => handleDeleteSet(set.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {set.metadata.categories.map((category, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(category)}`}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {set.metadata.pdfPages && (
                        <span className="mr-4">📄 {set.metadata.pdfPages} páginas</span>
                      )}
                      {set.metadata.pdfSize && (
                        <span>{Math.round(set.metadata.pdfSize / 1024)} KB</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSelectSet(set)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentSetId === set.id
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {currentSetId === set.id ? 'Usar Este Conjunto' : 'Selecionar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rename Dialog */}
        {showRenameDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Renomear Conjunto</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do conjunto"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowRenameDialog(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRenameSet(showRenameDialog)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Renomear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Dialog */}
        {showExportDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Exportar Conjunto</h3>
              <p className="text-gray-600 mb-4">
                Isso fará o download de um arquivo JSON com todas as questões deste conjunto.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowExportDialog(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleExport(showExportDialog)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Exportar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Dialog */}
        {showImportDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Importar Conjunto</h3>
              <p className="text-gray-600 mb-4">
                Cole aqui o conteúdo JSON de um conjunto de questões exportado:
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cole o JSON aqui..."
              />
              {importError && (
                <p className="text-red-600 text-sm mt-2">{importError}</p>
              )}
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowImportDialog(false);
                    setImportData('');
                    setImportError('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Importar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSetManager;
