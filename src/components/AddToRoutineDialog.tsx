
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Stack } from '../context/RoutineContext';
import { useStackManagement } from '../hooks/useStackManagement';

interface AddToRoutineDialogProps {
  stack?: Stack | null;
}

const AddToRoutineDialog: React.FC<AddToRoutineDialogProps> = ({ stack }) => {
  const {
    isAddToRoutineModalOpen,
    closeAddToRoutineModal,
    selectedRoutineId,
    setSelectedRoutineId,
    handleAddToRoutine,
    availableRoutines
  } = useStackManagement();

  if (!stack) return null;
  
  return (
    <Dialog open={isAddToRoutineModalOpen} onOpenChange={closeAddToRoutineModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Routine</DialogTitle>
          <DialogDescription>
            Choose a routine to add "{stack.title}" to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {availableRoutines.length > 0 ? (
            <Select 
              value={selectedRoutineId || ''} 
              onValueChange={setSelectedRoutineId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a routine" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableRoutines.map(routine => (
                    <SelectItem key={routine.id} value={routine.id}>
                      {routine.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No routines available. Create a routine first.
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={closeAddToRoutineModal}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddToRoutine}
            disabled={!selectedRoutineId || availableRoutines.length === 0}
          >
            Add to Routine
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToRoutineDialog;
