import React from 'react';
import { Button } from '@/components/ui/button';

interface WhatIsRoutineProps {
  onNext: () => void;
}

const WhatIsRoutine: React.FC<WhatIsRoutineProps> = ({ onNext }) => {
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
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="m16.24 16.24 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="m16.24 7.76 2.83-2.83" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stacks-purple">Routines = Your Stacks, grouped + scheduled</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Routines show up on the days you choose. Each Routine is made of one or more Stacks.
          </p>
        </div>

        <div className="space-y-5 pt-2">
          <div className="bg-green-50 p-5 rounded-xl text-left border border-green-100 hover:border-green-200 transition-all">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-700"
                >
                  <path d="M12 2v8" />
                  <path d="m18 10-4 4-4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="font-bold text-green-700 text-lg">Morning Routine</h3>
            </div>
            <ul className="space-y-3">
              <li className="bg-white p-3 rounded-lg border border-green-200 flex items-center hover:bg-green-50/50 transition-colors">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600"
                  >
                    <path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4" />
                  </svg>
                </div>
                <span className="text-gray-700">Mindset Stack</span>
              </li>
              <li className="bg-white p-3 rounded-lg border border-green-200 flex items-center hover:bg-green-50/50 transition-colors">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600"
                  >
                    <path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4" />
                  </svg>
                </div>
                <span className="text-gray-700">Bathroom Stack</span>
              </li>
            </ul>
          </div>

          <div className="bg-indigo-50 p-5 rounded-xl text-left border border-indigo-100 hover:border-indigo-200 transition-all">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-indigo-700"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
              <h3 className="font-bold text-indigo-700 text-lg">Wind Down Routine</h3>
            </div>
            <ul className="space-y-3">
              <li className="bg-white p-3 rounded-lg border border-indigo-200 flex items-center hover:bg-indigo-50/50 transition-colors">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-600"
                  >
                    <path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4" />
                  </svg>
                </div>
                <span className="text-gray-700">Relax Stack</span>
              </li>
              <li className="bg-white p-3 rounded-lg border border-indigo-200 flex items-center hover:bg-indigo-50/50 transition-colors">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-600"
                  >
                    <path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4" />
                  </svg>
                </div>
                <span className="text-gray-700">Night Hygiene Stack</span>
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
        Build a Routine
      </Button>


    </div>
  );
};

export default WhatIsRoutine;