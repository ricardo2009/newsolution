'use client';

import React from 'react';
import { Question } from '@/types';

interface FilterPanelProps {
  questions: Question[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  showOnlyIncorrect: boolean;
  onShowIncorrectChange: (show: boolean) => void;
  showOnlyFavorites: boolean;
  onShowFavoritesChange: (show: boolean) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  questions,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  showOnlyIncorrect,
  onShowIncorrectChange,
  showOnlyFavorites,
  onShowFavoritesChange,
}) => {
  const categories = Array.from(new Set(questions.map(q => q.category)));
  const difficulties = Array.from(new Set(questions.map(q => q.difficulty)));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Dificuldade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dificuldade
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as dificuldades</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros de Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyIncorrect}
                onChange={(e) => onShowIncorrectChange(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Apenas incorretas</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyFavorites}
                onChange={(e) => onShowFavoritesChange(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Apenas favoritas</span>
            </label>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estatísticas
          </label>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Total: {questions.length}</div>
            <div>Categorias: {categories.length}</div>
            <div>Dificuldades: {difficulties.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
