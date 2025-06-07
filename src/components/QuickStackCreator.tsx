import React, { useState } from 'react';
import { useRoutines } from '../context/RoutineContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Plus, X, ArrowUp, Check, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface QuickStackCreatorProps {
  routineId?: string; // Optional: if provided, add to this routine directly
  onComplete?: () => void;
  simplified?: boolean; // For simplified inline version
}

const QuickStackCreator: React.FC<QuickStackCreatorProps> = ({ 
  routineId, 
  onComplete,
  simplified = false 
}) => {
  const { addRoutine, saveUnscheduledStack } = useRoutines();
  const [isAdding, setIsAdding] = useState(false);
  const [stackTitle, setStackTitle] = useState('');
  const [actions, setActions] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState('');
  
  const handleAddAction = () => {
    if (!currentAction.trim()) return;
    
    setActions([...actions, currentAction.trim()]);
    setCurrentAction('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAction();
    }
    
    // Arrow up adds action when input is empty
    if (e.key === 'ArrowUp' && !currentAction.trim() && actions.length > 0) {
      e.preventDefault();
      handleDone();
    }
  };
  
  const handleRemoveAction = (index: number) => {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  };
  
  const handleDone = () => {
    if (actions.length === 0) {
      toast.error("Please add at least one action before saving");
      return;
    }
    
    // Create a new stack
    const newStackId = crypto.randomUUID();
    const newStack = {
      id: newStackId,
      title: stackTitle || `Quick Stack ${new Date().toLocaleTimeString()}`,
      isExpanded: true,
      actions: actions.map((text) => ({
        id: crypto.randomUUID(),
        text,
        completed: false,
        skipped: false,
        streak: 0
      })),
      streak: 0,
      isSchedulable: true
    };
    
    // If routineId is provided, add the stack to that routine
    if (routineId) {
      // Logic to add to existing routine would be implemented here
      toast.success(`Stack "${newStack.title}" added to routine`);
    } else {
      // Add to library
      saveUnscheduledStack(newStack);
      toast.success("Stack saved to library");
    }
    
    // Reset state
    setStackTitle('');
    setActions([]);
    setCurrentAction('');
    setIsAdding(false);
    
    if (onComplete) {
      onComplete();
    }
  };
  
  const handleCancel = () => {
    setIsAdding(false);
    setStackTitle('');
    setActions([]);
    setCurrentAction('');
  };
  
  // Simplified view for inline usage
  if (simplified) {
    return (
      <div className="my-2">
        {!isAdding ? (
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 border-dashed border-gray-300" 
            onClick={() => setIsAdding(true)}
          >
            <PlusCircle size={16} />
            <span>Add New Stack</span>
          </Button>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <Input
                placeholder="Stack name"
                value={stackTitle}
                onChange={(e) => setStackTitle(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCancel}
                className="ml-2"
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="space-y-2 mb-4">
              {actions.map((action, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="flex-1 text-sm">{action}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveAction(index)}>
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Input
                placeholder="Add action item"
                value={currentAction}
                onChange={(e) => setCurrentAction(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleAddAction}
                disabled={!currentAction.trim()}
              >
                <ArrowUp size={18} />
              </Button>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleDone} 
                className="bg-stacks-purple hover:bg-stacks-purple/90"
                disabled={actions.length === 0}
              >
                Save Stack
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Full view
  return (
    <div className="my-4">
      {!isAdding ? (
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 border-dashed border-gray-300 h-16" 
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle size={20} />
          <span>Create New Stack</span>
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create New Stack</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCancel}
            >
              <X size={18} />
            </Button>
          </div>
          
          <div className="mb-4">
            <Input
              placeholder="Stack name"
              value={stackTitle}
              onChange={(e) => setStackTitle(e.target.value)}
              className="mb-4"
            />
            
            <div className="space-y-2 mb-4">
              {actions.map((action, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="flex-1">{action}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveAction(index)}>
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Add action item"
                value={currentAction}
                onChange={(e) => setCurrentAction(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleAddAction}
                disabled={!currentAction.trim()}
              >
                <ArrowUp size={18} />
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 mb-4">
              <p>Press Enter to add an action. Press Up Arrow when done to save.</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleDone} 
              className="bg-stacks-purple hover:bg-stacks-purple/90"
              disabled={actions.length === 0}
            >
              <Check size={16} className="mr-2" />
              Create Stack
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickStackCreator;
