
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface OnboardingCompleteProps {
  onComplete: () => void;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ onComplete }) => {
  return (
    <div className="max-w-md w-full text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-stacks-purple">You're all set!</h1>
        <p className="text-xl text-gray-600">
          Your custom routine will show up on the Today screen starting tomorrow.
        </p>
      </div>
      
      <Button 
        onClick={onComplete} 
        className="w-full bg-stacks-purple hover:bg-stacks-purple/90 text-white"
        size="lg"
      >
        Go to Today
      </Button>
    </div>
  );
};

export default OnboardingComplete;
