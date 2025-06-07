
import { useState } from 'react';
import { Routine, Stack, useRoutines } from '../context/RoutineContext';
import { toast } from 'sonner';

export const useStackManagement = () => {
  const { addStackToRoutine, routines } = useRoutines();
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [isAddToRoutineModalOpen, setIsAddToRoutineModalOpen] = useState(false);
  const [stackToAdd, setStackToAdd] = useState<Stack | null>(null);

  const openAddToRoutineModal = (stack: Stack) => {
    setStackToAdd(stack);
    setIsAddToRoutineModalOpen(true);
  };

  const closeAddToRoutineModal = () => {
    setIsAddToRoutineModalOpen(false);
    setSelectedRoutineId(null);
    setStackToAdd(null);
  };

  const handleAddToRoutine = () => {
    if (!selectedRoutineId || !stackToAdd) return;
    
    addStackToRoutine(selectedRoutineId, stackToAdd);
    const routineName = routines.find(r => r.id === selectedRoutineId)?.title || "routine";
    toast.success(`Stack "${stackToAdd.title}" added to ${routineName}`);
    closeAddToRoutineModal();
  };

  // Check if this is a first-time user (for onboarding)
  const isFirstTimeUser = () => {
    return routines.length === 0 || (routines.length === 1 && routines[0].id === 'today-routine' && routines[0].stacks.length === 0);
  };

  return {
    selectedRoutineId,
    setSelectedRoutineId,
    isAddToRoutineModalOpen,
    openAddToRoutineModal,
    closeAddToRoutineModal,
    handleAddToRoutine,
    isFirstTimeUser,
    availableRoutines: routines.filter(r => r.id !== 'today-routine'), // Filter out the Today routine
  };
};
