import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from './WelcomeScreen';
import WhatIsStack from './WhatIsStack';
import CreateFirstStack from './CreateFirstStack';
import WhatIsRoutine from './WhatIsRoutine';
import CreateFirstRoutine from './CreateFirstRoutine';
import OnboardingComplete from './OnboardingComplete';
import { useRoutines } from '../../context/RoutineContext';

const OnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [firstStack, setFirstStack] = useState<any>(null);
  const navigate = useNavigate();
  const { routines } = useRoutines();

  // Skip onboarding if user already has a real routine with at least one stack
  useEffect(() => {
    const hasRealRoutine = routines.some(
      r => r.id !== 'today-routine' && r.stacks && r.stacks.length > 0
    );
    if (hasRealRoutine) {
      navigate('/dashboard');
    }
  }, [routines, navigate]);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSaveStack = (stack: any) => {
    setFirstStack(stack);
    handleNext();
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return <WelcomeScreen onNext={handleNext} />;
      case 2:
        return <WhatIsStack onNext={handleNext} />;
      case 3:
        return <CreateFirstStack onSaveStack={handleSaveStack} />;
      case 4:
        return <WhatIsRoutine onNext={handleNext} />;
      case 5:
        return <CreateFirstRoutine stack={firstStack} onNext={handleNext} />;
      case 6:
        return <OnboardingComplete onComplete={handleComplete} />;
      default:
        return <WelcomeScreen onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        {renderCurrentStep()}
      </div>
      <div className="p-4 flex justify-center">
        <div className="flex space-x-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i + 1 === step ? 'bg-stacks-purple' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
