import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { useRoutines } from '../../context/RoutineContext';
import { toast } from 'sonner';

interface CreateFirstRoutineProps {
  stack: any;
  onNext: () => void;
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CreateFirstRoutine: React.FC<CreateFirstRoutineProps> = ({ stack, onNext }) => {
  const [routineName, setRoutineName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const { addRoutine } = useRoutines();

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSaveRoutine = () => {
    if (!routineName.trim()) {
      toast.error('Please enter a name for your routine');
      return;
    }

    if (selectedDays.length === 0) {
      toast.error('Please select at least one day for your routine');
      return;
    }

    // Create new routine with the stack
    const newRoutine = {
      id: crypto.randomUUID(),
      title: routineName,
      description: 'Your first custom routine',
      stacks: [stack],
      days: selectedDays,
      streak: 0
    };

    addRoutine(newRoutine);
    toast.success('Your first routine has been created!');
    onNext();
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-stacks-purple">Create Your First Routine</h2>
        <p className="text-gray-500">This routine will show up on your selected days</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name your routine</label>
          <Input
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            placeholder="e.g., Morning Ritual, Evening Wind-Down"
            className="w-full"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected stack</label>
          <div className="p-3 border border-stacks-purple bg-stacks-purple/5 rounded-lg">
            <div className="font-medium">{stack.title}</div>
            <div className="text-sm text-gray-500 mt-1">{stack.actions.length} actions</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select days</label>
          <div className="grid grid-cols-7 gap-2">
            {weekdays.map((day, index) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`
                  h-11 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                  ${selectedDays.includes(day)
                    ? 'bg-stacks-purple text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {day.slice(0, 1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSaveRoutine}
        disabled={!routineName.trim() || selectedDays.length === 0}
        className="w-full bg-stacks-purple hover:bg-stacks-purple/90 mt-8"
        size="lg"
      >
        Save Routine
      </Button>
    </div>
  );
};

export default CreateFirstRoutine;
