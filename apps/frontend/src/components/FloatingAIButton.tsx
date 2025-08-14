'use client';

import { useState } from 'react';
import AIAssistant from './AIAssistant';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function FloatingAIButton() {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 hover:scale-110 group"
        title="Open AI Assistant"
      >
        <SparklesIcon className="h-6 w-6" />
        <span className="absolute -top-2 -left-2 h-3 w-3 bg-green-400 rounded-full animate-pulse"></span>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          AI Assistant
          <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* AI Assistant Modal */}
      <AIAssistant 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
      />
    </>
  );
}
