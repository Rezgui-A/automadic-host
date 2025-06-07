import { Stack, Routine } from '../context/RoutineContext';
import { useScheduling } from './useScheduling';

/**
 * Hook for utility functions related to stacks
 */
export const useStackUtilities = () => {
  const { isStackScheduledForToday, shouldTrackStreak } = useScheduling();
  
  // Check if a stack is completed (all actions are either completed or skipped)
  const isStackCompleted = (stack: Stack): boolean => {
    return stack.actions.length > 0 &&
      stack.actions.every(action => action.completed || action.skipped);
  };

  // Check if a routine is completed (all stacks scheduled for today are completed)
  const isRoutineCompleted = (routine: Routine, checkScheduleForToday: (stack: Stack) => boolean): boolean => {
    // Only consider stacks that are scheduled for today when determining if routine is complete
    const todaysStacks = checkScheduleForToday 
      ? routine.stacks.filter(checkScheduleForToday)
      : routine.stacks;
      
    return todaysStacks.length > 0 && 
      todaysStacks.every(stack => isStackCompleted(stack));
  };

  // Calculate stack progress
  const getStackProgress = (stack: Stack): number => {
    if (stack.actions.length === 0) return 0;
    
    const completedCount = stack.actions.filter(action => 
      action.completed || action.skipped
    ).length;
    
    return (completedCount / stack.actions.length) * 100;
  };

  // Assign a stack to a different routine
  const assignStackToRoutine = (
    routines: Routine[], 
    setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>,
    unscheduledStacks: Stack[],
    setUnscheduledStacks: React.Dispatch<React.SetStateAction<Stack[]>>,
    sourceRoutineId: string, 
    stackId: string, 
    targetRoutineId: string
  ) => {
    let stackToMove: Stack | undefined;
    
    // Get the stack from the source (either library or routine)
    if (sourceRoutineId === 'library') {
      stackToMove = unscheduledStacks.find(stack => stack.id === stackId);
      if (stackToMove) {
        setUnscheduledStacks(prevStacks => 
          prevStacks.filter(stack => stack.id !== stackId)
        );
      }
    } else {
      const sourceRoutine = routines.find(routine => routine.id === sourceRoutineId);
      if (sourceRoutine) {
        stackToMove = sourceRoutine.stacks.find(stack => stack.id === stackId);
        setRoutines(prevRoutines =>
          prevRoutines.map(routine =>
            routine.id === sourceRoutineId
              ? {
                  ...routine,
                  stacks: routine.stacks.filter(stack => stack.id !== stackId)
                }
              : routine
          )
        );
      }
    }
    
    // If we found the stack, add it to the target
    if (stackToMove) {
      // When moving to or from library, update isSchedulable property appropriately
      const updatedStack = {
        ...stackToMove,
        isSchedulable: targetRoutineId !== 'library',
        // Reset streak when moving a stack (changing context/habit)
        streak: 0,
        // Reset action streaks too
        actions: stackToMove.actions.map(action => ({
          ...action,
          streak: 0
        }))
      };
      
      if (targetRoutineId === 'library') {
        setUnscheduledStacks(prevStacks => [...prevStacks, updatedStack]);
      } else {
        setRoutines(prevRoutines =>
          prevRoutines.map(routine =>
            routine.id === targetRoutineId
              ? {
                  ...routine,
                  stacks: [...routine.stacks, updatedStack]
                }
              : routine
          )
        );
      }
    }
  };

  // Get a stack by ID
  const getStackById = (
    routines: Routine[],
    unscheduledStacks: Stack[],
    routineId: string, 
    stackId: string
  ): Stack | undefined => {
    if (routineId === 'library') {
      return unscheduledStacks.find(stack => stack.id === stackId);
    } else {
      const routine = routines.find(r => r.id === routineId);
      return routine?.stacks.find(stack => stack.id === stackId);
    }
  };

  // Save a new unscheduled stack
  const saveUnscheduledStack = (
    unscheduledStacks: Stack[],
    setUnscheduledStacks: React.Dispatch<React.SetStateAction<Stack[]>>, 
    stack: Stack
  ) => {
    setUnscheduledStacks(prevStacks => [...prevStacks, {
      ...stack,
      isSchedulable: false,
      streak: 0, // Ensure unscheduled stacks start with 0 streak
      actions: stack.actions.map(action => ({
        ...action,
        streak: 0 // Reset action streaks too
      }))
    }]);
  };

  // Add a stack to Today (for non-recurring/one-time use)
  const addStackToToday = (
    routines: Routine[],
    setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, 
    stack: Stack
  ) => {
    // Find the "Today" routine or create it if it doesn't exist
    const todayRoutineIndex = routines.findIndex(r => r.id === 'today-routine');
    
    if (todayRoutineIndex >= 0) {
      // Add to existing Today routine
      setRoutines(prevRoutines => 
        prevRoutines.map((routine, index) => 
          index === todayRoutineIndex
            ? {
                ...routine,
                stacks: [...routine.stacks, {
                  ...stack,
                  id: crypto.randomUUID(), // Generate new unique ID
                  isSchedulable: true,
                  scheduleType: 'none', // One-time use
                  isOneTime: true // Mark as one-time for today only
                }]
              }
            : routine
        )
      );
    } else {
      // Create a new Today routine
      const todayRoutine: Routine = {
        id: 'today-routine',
        title: 'Today',
        description: 'One-time stacks for today',
        streak: 0,
        days: [], // Empty days means always available
        stacks: [
          {
            ...stack,
            id: crypto.randomUUID(),
            isSchedulable: true,
            scheduleType: 'none',
            isOneTime: true
          }
        ]
      };
      
      setRoutines(prevRoutines => [...prevRoutines, todayRoutine]);
    }
  };

  return {
    isStackCompleted,
    isRoutineCompleted,
    getStackProgress,
    assignStackToRoutine,
    getStackById,
    saveUnscheduledStack,
    addStackToToday
  };
};
