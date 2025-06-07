import React from 'react';
import { Button } from '@/components/ui/button';

interface WhatIsStackProps {
  onNext: () => void;
}

const WhatIsStack: React.FC<WhatIsStackProps> = ({ onNext }) => {
  return (
    <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stacks-purple/10 rounded-full mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-stacks-purple"
            >
              <path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stacks-purple">Stacks = Bite-sized routines</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            A Stack is a short sequence of 3–9 actions designed to fit in your brain's working memory — so you actually follow through.
          </p>
        </div>

        <div className="space-y-5 pt-2">
          <div className="bg-blue-50 p-5 rounded-xl text-left border border-blue-100 hover:border-blue-200 transition-all">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-700 text-xl">🛁</span>
              </div>
              <h3 className="font-bold text-blue-700 text-lg">Bathroom Stack</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 text-xs font-medium">1</span>
                <span className="text-gray-700">Brush teeth</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 text-xs font-medium">2</span>
                <span className="text-gray-700">Floss</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 text-xs font-medium">3</span>
                <span className="text-gray-700">Skincare</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-5 rounded-xl text-left border border-purple-100 hover:border-purple-200 transition-all">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-700 text-xl">🧠</span>
              </div>
              <h3 className="font-bold text-purple-700 text-lg">Mindset Stack</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3 text-xs font-medium">1</span>
                <span className="text-gray-700">Meditate</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3 text-xs font-medium">2</span>
                <span className="text-gray-700">Journal</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3 text-xs font-medium">3</span>
                <span className="text-gray-700">Set daily focus</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Button 
        onClick={onNext} 
        className="w-full bg-stacks-purple hover:bg-stacks-purple/90 text-white shadow-md hover:shadow-lg transition-all"
        size="lg"
      >
        Create My First Stack
      </Button>
      

    </div>
  );
};

export default WhatIsStack;