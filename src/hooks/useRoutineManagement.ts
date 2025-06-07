
import { Stack, Routine, ScheduleOptions } from '../context/RoutineContext';

/**
 * Hook for managing routines and stacks organization
 */
export const useRoutineManagement = () => {
  // Add a new routine
  const addRoutine = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routine: Routine) => {
    setRoutines(prevRoutines => [...prevRoutines, routine]);
  };
  
  // Reorder stacks within a routine
  const reorderStacks = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, sourceIndex: number, targetIndex: number) => {
    setRoutines(prevRoutines => 
      prevRoutines.map(routine => {
        if (routine.id !== routineId) return routine;
        
        const newStacks = [...routine.stacks];
        const [movedStack] = newStacks.splice(sourceIndex, 1);
        newStacks.splice(targetIndex, 0, movedStack);
        
        return {
          ...routine,
          stacks: newStacks
        };
      })
    );
  };
  
  // Reorder routines
  const reorderRoutines = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, sourceIndex: number, targetIndex: number) => {
    setRoutines(prevRoutines => {
      const newRoutines = [...prevRoutines];
      const [movedRoutine] = newRoutines.splice(sourceIndex, 1);
      newRoutines.splice(targetIndex, 0, movedRoutine);
      return newRoutines;
    });
  };
  
  // Rename a stack
  const renameStack = (
    routines: Routine[], 
    setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>,
    unscheduledStacks: Stack[],
    setUnscheduledStacks: React.Dispatch<React.SetStateAction<Stack[]>>,
    routineId: string, 
    stackId: string, 
    newName: string
  ) => {
    if (routineId === 'library') {
      setUnscheduledStacks(prevStacks =>
        prevStacks.map(stack =>
          stack.id === stackId
            ? { ...stack, title: newName }
            : stack
        )
      );
      return;
    }
    
    setRoutines(prevRoutines =>
      prevRoutines.map(routine =>
        routine.id === routineId
          ? {
              ...routine,
              stacks: routine.stacks.map(stack =>
                stack.id === stackId
                  ? { ...stack, title: newName }
                  : stack
              )
            }
          : routine
      )
    );
  };
  
  // Rename a routine
  const renameRoutine = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, newName: string) => {
    setRoutines(prevRoutines =>
      prevRoutines.map(routine =>
        routine.id === routineId
          ? { ...routine, title: newName }
          : routine
      )
    );
  };
  
  // Delete a stack
  const deleteStack = (
    routines: Routine[], 
    setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>,
    unscheduledStacks: Stack[],
    setUnscheduledStacks: React.Dispatch<React.SetStateAction<Stack[]>>,
    routineId: string, 
    stackId: string
  ) => {
    if (routineId === 'library') {
      setUnscheduledStacks(prevStacks =>
        prevStacks.filter(stack => stack.id !== stackId)
      );
      return;
    }
    
    setRoutines(prevRoutines =>
      prevRoutines.map(routine =>
        routine.id === routineId
          ? {
              ...routine,
              stacks: routine.stacks.filter(stack => stack.id !== stackId)
            }
          : routine
      )
    );
  };
  
  // Delete a routine
  const deleteRoutine = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string) => {
    setRoutines(prevRoutines =>
      prevRoutines.filter(routine => routine.id !== routineId)
    );
  };
  
  // Set stack schedule
  const setStackSchedule = (
    routines: Routine[], 
    setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>,
    unscheduledStacks: Stack[],
    setUnscheduledStacks: React.Dispatch<React.SetStateAction<Stack[]>>,
    routineId: string, 
    stackId: string, 
    options: ScheduleOptions
  ) => {
    if (routineId === 'library') {
      setUnscheduledStacks(prevStacks =>
        prevStacks.map(stack =>
          stack.id === stackId
            ? { 
                ...stack, 
                scheduleType: options.type as any, 
                scheduleDays: options.days,
                interval: options.interval,
                isSchedulable: options.isSchedulable,
                startDate: options.startDate,
                dayOfMonth: options.dayOfMonth
              }
            : stack
        )
      );
      return;
    }
    
    setRoutines(prevRoutines =>
      prevRoutines.map(routine =>
        routine.id === routineId
          ? {
              ...routine,
              stacks: routine.stacks.map(stack =>
                stack.id === stackId
                  ? { 
                      ...stack, 
                      scheduleType: options.type as any,
                      scheduleDays: options.days,
                      interval: options.interval,
                      isSchedulable: options.isSchedulable,
                      startDate: options.startDate,
                      dayOfMonth: options.dayOfMonth
                    }
                  : stack
              )
            }
          : routine
      )
    );
  };

  // Update routine schedule
  const updateRoutineSchedule = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, options: ScheduleOptions) => {
    setRoutines(prevRoutines =>
      prevRoutines.map(routine =>
        routine.id === routineId
          ? { 
              ...routine, 
              days: options.days || routine.days,
              scheduleType: options.type as any,
              interval: options.interval,
              startDate: options.startDate,
              dayOfMonth: options.dayOfMonth
            }
          : routine
      )
    );
  };

  // Update a stack's schedule days
  const updateStackSchedule = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, stackId: string, days: string[]) => {
    setRoutines(prevRoutines => 
      prevRoutines.map(routine => 
        routine.id === routineId
          ? {
              ...routine,
              stacks: routine.stacks.map(stack => 
                stack.id === stackId
                  ? { ...stack, scheduleDays: days }
                  : stack
              )
            }
          : routine
      )
    );
  };

  return {
    addRoutine,
    reorderStacks,
    reorderRoutines,
    renameStack,
    renameRoutine,
    deleteStack,
    deleteRoutine,
    setStackSchedule,
    updateRoutineSchedule,
    updateStackSchedule
  };
};
