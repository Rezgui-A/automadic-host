import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useRoutines } from '../../context/RoutineContext';

interface CreateFirstStackProps {
  onSaveStack: (stack: any) => void;
}

const CreateFirstStack: React.FC<CreateFirstStackProps> = ({ onSaveStack }) => {
  const [stackTitle, setStackTitle] = useState('');
  const [actions, setActions] = useState<{ id: string; text: string; completed: boolean; skipped: boolean; streak: number }[]>([]);
  const [newAction, setNewAction] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { saveUnscheduledStack } = useRoutines();

  const handleAddAction = () => {
    if (newAction.trim() !== '' && actions.length < 9) {
      setActions([
        ...actions,
        {
          id: crypto.randomUUID(),
          text: newAction.trim(),
          completed: false,
          skipped: false,
          streak: 0
        }
      ]);
      setNewAction('');
      
      // Focus the input after adding
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddAction();
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex === targetIndex) return;
    
    const updatedActions = [...actions];
    const [movedAction] = updatedActions.splice(sourceIndex, 1);
    updatedActions.splice(targetIndex, 0, movedAction);
    
    setActions(updatedActions);
  };

  const handleSaveStack = () => {
    if (stackTitle.trim() === '') {
      toast.error('Please add a title for your stack');
      return;
    }
    
    if (actions.length === 0) {
      toast.error('Please add at least one action to your stack');
      return;
    }
    
    const newStack = {
      id: crypto.randomUUID(),
      title: stackTitle,
      isExpanded: true,
      actions: actions,
      streak: 0,
      isSchedulable: true
    };
    
    saveUnscheduledStack(newStack);
    onSaveStack(newStack);
  };

  const removeAction = (indexToRemove: number) => {
    setActions(actions.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-stacks-purple">Create Your First Stack</h2>
        <p className="text-gray-500">A stack contains 1-9 related actions that work together</p>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name your stack</label>
          <Input
            value={stackTitle}
            onChange={(e) => setStackTitle(e.target.value)}
            placeholder="e.g., Morning Routine, Focus Time"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Add actions (1-9)</label>
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add an action and press Enter"
              className="flex-1"
              maxLength={100}
              disabled={actions.length >= 9}
            />
            <Button 
              onClick={handleAddAction} 
              disabled={!newAction.trim() || actions.length >= 9}
              size="sm"
              variant="outline"
            >
              Add
            </Button>
          </div>
          
          {actions.length === 0 ? (
            <p className="text-gray-400 text-sm mt-6 text-center">
              Add actions to create your stack (3-9 recommended)
            </p>
          ) : (
            <p className="text-gray-500 text-xs mt-1">
              {actions.length}/9 actions • Drag to reorder
            </p>
          )}
          
          <ul className="space-y-2 mt-3">
            {actions.map((action, index) => (
              <li 
                key={action.id}
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="flex items-center flex-1">
                  <span className="cursor-grab mr-2 text-gray-400">
                    <GripVertical size={16} />
                  </span>
                  <span>{action.text}</span>
                </div>
                <button
                  onClick={() => removeAction(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <Button 
        onClick={handleSaveStack}
        disabled={!stackTitle.trim() || actions.length === 0}
        className="w-full bg-stacks-purple hover:bg-stacks-purple/90 mt-8"
        size="lg"
      >
        Save Stack
      </Button>
    </div>
  );
};

export default CreateFirstStack;
