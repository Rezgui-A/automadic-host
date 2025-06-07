
import React from 'react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <div className="max-w-md w-full text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-stacks-purple">Welcome to STACKS.</h1>
        <p className="text-xl text-gray-600">
          This is more than a habit tracker — it's how you build routines that stick.
        </p>
      </div>
      <div>
        <Button 
          onClick={onNext} 
          className="w-full bg-stacks-purple hover:bg-stacks-purple/90 text-white py-6"
          size="lg"
        >
          Let's Go
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
