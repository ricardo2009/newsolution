'use client';

import React, { useState } from 'react';
import { Question } from '@/types';

interface SearchBarProps {
  questions: Question[];
  onSearch: (filteredQuestions: Question[]) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  questions, 
  onSearch, 
  placeholder = "Buscar por texto, categoria ou tópico..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      onSearch(questions);
      return;
    }

    const filtered = questions.filter(question => 
      question.questionText.toLowerCase().includes(term.toLowerCase()) ||
      question.category.toLowerCase().includes(term.toLowerCase()) ||
      question.explanation.toLowerCase().includes(term.toLowerCase()) ||
      question.relatedTopics.some(topic => 
        topic.toLowerCase().includes(term.toLowerCase())
      ) ||
      (question.codeExample && question.codeExample.toLowerCase().includes(term.toLowerCase()))
    );

    onSearch(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch(questions);
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Search Results Info */}
      {searchTerm && (
        <div className="mt-2 text-sm text-gray-600">
          Encontradas {questions.length} questões para "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default SearchBar;
