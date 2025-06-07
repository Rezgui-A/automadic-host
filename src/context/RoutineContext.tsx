/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useStackActions } from "../hooks/useStackActions";
import { useRoutineManagement } from "../hooks/useRoutineManagement";
import { useStackUtilities } from "../hooks/useStackUtilities";
import { useScheduling } from "../hooks/useScheduling";
import { useAuth } from "./AuthContext";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

// Types remain exactly the same
export interface Action {
  id: string;
  text: string;
  completed: boolean;
  skipped: boolean;
  streak: number;
}

export interface ScheduleOptions {
  type: string;
  days?: string[];
  interval?: number;
  isSchedulable?: boolean;
  startDate?: string;
  dayOfMonth?: number;
}

export interface Stack {
  id: string;
  title: string;
  isExpanded: boolean;
  actions: Action[];
  streak: number;
  scheduleType?: "daily" | "weekly" | "interval" | "biweekly" | "monthly" | "oneTime" | "none";
  scheduleDays?: string[];
  interval?: number;
  isSchedulable?: boolean;
  startDate?: string;
  isOneTime?: boolean;
  dayOfMonth?: number;
}

export interface Routine {
  id: string;
  title: string;
  description?: string;
  stacks: Stack[];
  days: string[];
  streak: number;
  scheduleType?: "daily" | "weekly" | "interval" | "biweekly" | "monthly" | "oneTime" | "none";
  interval?: number;
  startDate?: string;
  dayOfMonth?: number;
}

interface RoutineContextType {
  routines: Routine[];
  setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>;
  unscheduledStacks: Stack[];
  setUnscheduledStacks: React.Dispatch<React.SetStateAction<Stack[]>>;
  toggleStackExpand: (routineId: string, stackId: string) => void;
  completeAction: (routineId: string, stackId: string, actionId: string) => void;
  skipAction: (routineId: string, stackId: string, actionId: string) => void;
  resetCompletedItems: () => void;
  isStackCompleted: (stack: Stack) => boolean;
  isRoutineCompleted: (routine: Routine) => boolean;
  getStackProgress: (stack: Stack) => number;
  addRoutine: (routine: Routine) => void;
  reorderStacks: (routineId: string, sourceIndex: number, targetIndex: number) => void;
  reorderRoutines: (sourceIndex: number, targetIndex: number) => void;
  renameStack: (routineId: string, stackId: string, newName: string) => void;
  renameRoutine: (routineId: string, newName: string) => void;
  deleteStack: (routineId: string, stackId: string) => Promise<void>;
  deleteRoutine: (routineId: string) => void;
  assignStackToRoutine: (sourceRoutineId: string, stackId: string, targetRoutineId: string) => void;
  setStackSchedule: (routineId: string, stackId: string, options: ScheduleOptions) => void;
  updateRoutineSchedule: (routineId: string, options: ScheduleOptions) => void;
  getUnscheduledStacks: () => Stack[];
  getRoutines: () => Routine[];
  saveUnscheduledStack: (stack: Stack) => void;
  getStackById: (routineId: string, stackId: string) => Stack | undefined;
  updateActions: (routineId: string, stackId: string, actions: Action[]) => void;
  isStackScheduledForToday: (stack: Stack) => boolean;
  isRoutineScheduledForToday: (routine: Routine) => boolean;
  updateStackSchedule: (routineId: string, stackId: string, days: string[]) => void;
  addStackToRoutine: (routineId: string, stack: Stack) => void;
  collapseAllStacks: (routineId: string) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface RoutineProviderProps {
  children: ReactNode;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

const RoutineProvider: React.FC<RoutineProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [unscheduledStacks, setUnscheduledStacks] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Import hooks
  const { toggleStackExpand: toggleStackExpandAction, completeAction: completeActionBase, skipAction: skipActionBase, resetCompletedItems: resetCompletedItemsBase, updateActions: updateActionsBase, collapseAllStacks: collapseAllStacksBase } = useStackActions();

  const { addRoutine: addRoutineBase, reorderStacks: reorderStacksBase, reorderRoutines: reorderRoutinesBase, renameStack: renameStackBase, renameRoutine: renameRoutineBase, deleteStack: deleteStackBase, deleteRoutine: deleteRoutineBase, setStackSchedule: setStackScheduleBase, updateRoutineSchedule: updateRoutineScheduleBase, updateStackSchedule: updateStackScheduleBase } = useRoutineManagement();

  const { isStackCompleted, isRoutineCompleted: isRoutineCompletedBase, getStackProgress, assignStackToRoutine: assignStackToRoutineBase, getStackById: getStackByIdBase, saveUnscheduledStack: saveUnscheduledStackBase } = useStackUtilities();

  const { isStackScheduledForToday, isRoutineScheduledForToday } = useScheduling();

  // Load data from Supabase
  useEffect(() => {
    if (!user) {
      setRoutines([]);
      setUnscheduledStacks([]);
      setIsLoading(false);
      return;
    }

    // Save unscheduled stacks with proper type handling
    const saveStacks = async () => {
      try {
        for (const stack of unscheduledStacks) {
          // Convert actions to JSON if needed
          const actionsToSave = Array.isArray(stack.actions) ? JSON.stringify(stack.actions) : stack.actions;

          const { error } = await supabase.from("stacks").upsert({
            id: stack.id,
            user_id: user.id,
            title: stack.title,
            routine_id: null, // This indicates it's unscheduled
            actions: actionsToSave,
            streak: stack.streak || 0,
            schedule_type: stack.scheduleType || "weekly",
            schedule_days: stack.scheduleDays || [],
            interval: stack.interval || null,
            is_schedulable: stack.isSchedulable !== false,
            start_date: stack.startDate || null,
            day_of_month: stack.dayOfMonth || null,
            created_at: new Date().toISOString(),
          });

          if (error) throw error;
        }
      } catch (error) {
        console.error("Error saving unscheduled stacks:", error);
      }
    };

    const timer = setTimeout(() => {
      saveStacks();
    }, 1000);

    return () => clearTimeout(timer);
  }, [unscheduledStacks, user, isLoading]);

  // All wrapped methods remain exactly the same
  const toggleStackExpand = (routineId: string, stackId: string) => {
    toggleStackExpandAction(routines, setRoutines, routineId, stackId);
  };

  const completeAction = (routineId: string, stackId: string, actionId: string) => {
    completeActionBase(routines, setRoutines, routineId, stackId, actionId);
  };

  const skipAction = (routineId: string, stackId: string, actionId: string) => {
    skipActionBase(routines, setRoutines, routineId, stackId, actionId);
  };

  const resetCompletedItems = () => {
    resetCompletedItemsBase(routines, setRoutines);
  };

  const isRoutineCompleted = (routine: Routine) => {
    return isRoutineCompletedBase(routine, isStackScheduledForToday);
  };

  const addRoutine = (routine: Routine) => {
    addRoutineBase(routines, setRoutines, routine);
  };

  const reorderStacks = (routineId: string, sourceIndex: number, targetIndex: number) => {
    reorderStacksBase(routines, setRoutines, routineId, sourceIndex, targetIndex);
  };

  const reorderRoutines = (sourceIndex: number, targetIndex: number) => {
    reorderRoutinesBase(routines, setRoutines, sourceIndex, targetIndex);
  };

  const renameStack = (routineId: string, stackId: string, newName: string) => {
    renameStackBase(routines, setRoutines, unscheduledStacks, setUnscheduledStacks, routineId, stackId, newName);
  };

  const renameRoutine = (routineId: string, newName: string) => {
    renameRoutineBase(routines, setRoutines, routineId, newName);
  };

  const deleteStack = async (routineId: string, stackId: string) => {
    console.log("[RoutineContext] deleteStack called:", { routineId, stackId });

    // Store current state for rollback
    const currentUnscheduledStacks = [...unscheduledStacks];
    const currentRoutines = [...routines];

    try {
      // Optimistic update - remove from frontend state
      if (routineId === "library") {
        setUnscheduledStacks((prev) => prev.filter((s) => s.id !== stackId));
      } else {
        setRoutines((prev) =>
          prev.map((routine) =>
            routine.id === routineId
              ? {
                  ...routine,
                  stacks: routine.stacks.filter((stack) => stack.id !== stackId),
                }
              : routine
          )
        );
      }

      // Delete from Supabase stacks table
      const { error: stackError } = await supabase.from("stacks").delete().eq("id", stackId);

      if (stackError) throw stackError;

      // If the stack was in a routine (not library), also update the routine's stacks JSON
      if (routineId !== "library") {
        const routine = routines.find((r) => r.id === routineId);
        if (routine) {
          const updatedStacks = routine.stacks.filter((s) => s.id !== stackId);
          const { error: routineError } = await supabase
            .from("routines")
            .update({
              stacks: JSON.stringify(
                updatedStacks.map((s) => ({
                  id: s.id,
                  title: s.title,
                  is_expanded: s.isExpanded,
                  actions: s.actions,
                  streak: s.streak,
                  schedule_type: s.scheduleType,
                  schedule_days: s.scheduleDays,
                  interval: s.interval,
                  is_schedulable: s.isSchedulable,
                  start_date: s.startDate,
                  day_of_month: s.dayOfMonth,
                }))
              ),
              updated_at: new Date().toISOString(),
            })
            .eq("id", routineId);

          if (routineError) throw routineError;
        }
      }

      toast.success("Stack deleted successfully");
    } catch (error) {
      console.error("Error deleting stack:", error);
      // Rollback on error
      setUnscheduledStacks(currentUnscheduledStacks);
      setRoutines(currentRoutines);
      toast.error("Failed to delete stack");
      throw error;
    }
  };

  const deleteRoutine = (routineId: string) => {
    deleteRoutineBase(routines, setRoutines, routineId);
  };

  const assignStackToRoutine = async (sourceRoutineId: string, stackId: string, targetRoutineId: string) => {
    console.log("[RoutineContext] assignStackToRoutine called:", { sourceRoutineId, stackId, targetRoutineId });

    // Store current state for rollback
    const currentUnscheduledStacks = [...unscheduledStacks];
    const currentRoutines = [...routines];

    const stack = sourceRoutineId === "library" ? unscheduledStacks.find((s) => s.id === stackId) : routines.find((r) => r.id === sourceRoutineId)?.stacks.find((s) => s.id === stackId);

    if (!stack) {
      console.log("[RoutineContext] Stack not found:", { sourceRoutineId, stackId });
      return;
    }

    try {
      // Optimistic update - remove from source
      if (sourceRoutineId === "library") {
        setUnscheduledStacks((prev) => prev.filter((s) => s.id !== stackId));
      } else {
        setRoutines((prev) => prev.map((r) => (r.id === sourceRoutineId ? { ...r, stacks: r.stacks.filter((s) => s.id !== stackId) } : r)));
      }

      // Add to target with proper routine_id
      const updatedStack = { ...stack, routine_id: targetRoutineId === "library" ? null : targetRoutineId };

      if (targetRoutineId === "library") {
        setUnscheduledStacks((prev) => [...prev, updatedStack]);
      } else {
        setRoutines((prev) => prev.map((r) => (r.id === targetRoutineId ? { ...r, stacks: [...r.stacks, updatedStack] } : r)));
      }

      // Update in Supabase stacks table
      const { error: stackError } = await supabase
        .from("stacks")
        .update({
          routine_id: targetRoutineId === "library" ? null : targetRoutineId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", stackId);

      if (stackError) throw stackError;

      // Update routines table to maintain consistency
      // First, remove stack from source routine if it's not library
      if (sourceRoutineId !== "library") {
        const sourceRoutine = routines.find((r) => r.id === sourceRoutineId);
        if (sourceRoutine) {
          const updatedSourceStacks = sourceRoutine.stacks.filter((s) => s.id !== stackId);
          const { error: sourceRoutineError } = await supabase
            .from("routines")
            .update({
              stacks: JSON.stringify(
                updatedSourceStacks.map((s) => ({
                  id: s.id,
                  title: s.title,
                  is_expanded: s.isExpanded,
                  actions: s.actions,
                  streak: s.streak,
                  schedule_type: s.scheduleType,
                  schedule_days: s.scheduleDays,
                  interval: s.interval,
                  is_schedulable: s.isSchedulable,
                  start_date: s.startDate,
                  day_of_month: s.dayOfMonth,
                }))
              ),
              updated_at: new Date().toISOString(),
            })
            .eq("id", sourceRoutineId);

          if (sourceRoutineError) throw sourceRoutineError;
        }
      }

      // Then, add stack to target routine if it's not library
      if (targetRoutineId !== "library") {
        const targetRoutine = routines.find((r) => r.id === targetRoutineId);
        if (targetRoutine) {
          const updatedTargetStacks = [...targetRoutine.stacks.filter((s) => s.id !== stackId), updatedStack];
          const { error: targetRoutineError } = await supabase
            .from("routines")
            .update({
              stacks: JSON.stringify(
                updatedTargetStacks.map((s) => ({
                  id: s.id,
                  title: s.title,
                  is_expanded: s.isExpanded,
                  actions: s.actions,
                  streak: s.streak,
                  schedule_type: s.scheduleType,
                  schedule_days: s.scheduleDays,
                  interval: s.interval,
                  is_schedulable: s.isSchedulable,
                  start_date: s.startDate,
                  day_of_month: s.dayOfMonth,
                }))
              ),
              updated_at: new Date().toISOString(),
            })
            .eq("id", targetRoutineId);

          if (targetRoutineError) throw targetRoutineError;
        }
      }

      toast.success("Stack moved successfully");
    } catch (error) {
      console.error("Error moving stack:", error);
      // Rollback on error
      setUnscheduledStacks(currentUnscheduledStacks);
      setRoutines(currentRoutines);
      toast.error("Failed to move stack");
    }
  };

  const setStackSchedule = (routineId: string, stackId: string, options: ScheduleOptions) => {
    setStackScheduleBase(routines, setRoutines, unscheduledStacks, setUnscheduledStacks, routineId, stackId, options);
  };

  const updateRoutineSchedule = (routineId: string, options: ScheduleOptions) => {
    updateRoutineScheduleBase(routines, setRoutines, routineId, options);
  };

  const getUnscheduledStacks = () => {
    return unscheduledStacks;
  };

  const getRoutines = () => {
    return routines;
  };

  const saveUnscheduledStack = (stack: Stack) => {
    saveUnscheduledStackBase(unscheduledStacks, setUnscheduledStacks, stack);
  };

  const getStackById = (routineId: string, stackId: string): Stack | undefined => {
    return getStackByIdBase(routines, unscheduledStacks, routineId, stackId);
  };

  const updateActions = (routineId: string, stackId: string, actions: Action[]) => {
    updateActionsBase(routines, setRoutines, routineId, stackId, actions);
  };

  const updateStackSchedule = (routineId: string, stackId: string, days: string[]) => {
    updateStackScheduleBase(routines, setRoutines, routineId, stackId, days);
  };

  const addStackToRoutine = async (routineId: string, stack: Stack) => {
    const newStack = {
      ...stack,
      isExpanded: false,
      routine_id: routineId, // Ensure routine_id is set
    };

    // Optimistic update - add to routine
    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              stacks: [...routine.stacks, newStack],
            }
          : routine
      )
    );

    // If this stack was in unscheduled stacks, remove it
    const wasUnscheduled = unscheduledStacks.some((s) => s.id === stack.id);
    if (wasUnscheduled) {
      setUnscheduledStacks((prev) => prev.filter((s) => s.id !== stack.id));
    }

    try {
      // Update or create stack in Supabase stacks table
      const { error: stackError } = await supabase.from("stacks").upsert({
        id: newStack.id,
        user_id: user?.id,
        title: newStack.title,
        routine_id: routineId,
        actions: JSON.stringify(newStack.actions),
        streak: newStack.streak || 0,
        schedule_type: newStack.scheduleType || "none",
        schedule_days: newStack.scheduleDays || [],
        interval: newStack.interval,
        is_schedulable: newStack.isSchedulable !== false,
        start_date: newStack.startDate,
        day_of_month: newStack.dayOfMonth,
        is_expanded: newStack.isExpanded,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (stackError) throw stackError;

      // Update routine's stacks JSON in routines table
      const targetRoutine = routines.find((r) => r.id === routineId);
      if (targetRoutine) {
        const updatedStacks = [...targetRoutine.stacks.filter((s) => s.id !== newStack.id), newStack];
        const { error: routineError } = await supabase
          .from("routines")
          .update({
            stacks: JSON.stringify(
              updatedStacks.map((s) => ({
                id: s.id,
                title: s.title,
                is_expanded: s.isExpanded,
                actions: s.actions,
                streak: s.streak,
                schedule_type: s.scheduleType,
                schedule_days: s.scheduleDays,
                interval: s.interval,
                is_schedulable: s.isSchedulable,
                start_date: s.startDate,
                day_of_month: s.dayOfMonth,
              }))
            ),
            updated_at: new Date().toISOString(),
          })
          .eq("id", routineId);

        if (routineError) throw routineError;
      }
    } catch (error) {
      console.error("Error adding stack to routine:", error);
      // Rollback optimistic updates on error
      setRoutines((prevRoutines) =>
        prevRoutines.map((routine) =>
          routine.id === routineId
            ? {
                ...routine,
                stacks: routine.stacks.filter((s) => s.id !== newStack.id),
              }
            : routine
        )
      );
      if (wasUnscheduled) {
        setUnscheduledStacks((prev) => [...prev, stack]);
      }
      toast.error("Failed to add stack to routine");
    }
  };

  const collapseAllStacks = (routineId: string) => {
    collapseAllStacksBase(routines, setRoutines, routineId);
  };

  return (
    <RoutineContext.Provider
      value={{
        routines,
        setRoutines,
        unscheduledStacks,
        setUnscheduledStacks,
        isLoading,
        setIsLoading,
        toggleStackExpand,
        completeAction,
        skipAction,
        resetCompletedItems,
        isStackCompleted,
        isRoutineCompleted,
        getStackProgress,
        addRoutine,
        reorderStacks,
        reorderRoutines,
        renameStack,
        renameRoutine,
        deleteStack,
        deleteRoutine,
        assignStackToRoutine,
        setStackSchedule,
        updateRoutineSchedule,
        getUnscheduledStacks,
        getRoutines,
        saveUnscheduledStack,
        getStackById,
        updateActions,
        isStackScheduledForToday,
        isRoutineScheduledForToday,
        updateStackSchedule,
        addStackToRoutine,
        collapseAllStacks,
      }}>
      {children}
    </RoutineContext.Provider>
  );
};

const useRoutines = () => {
  const context = useContext(RoutineContext);

  if (context === undefined) {
    throw new Error("useRoutines must be used within a RoutineProvider");
  }

  return context;
};

export { RoutineProvider, RoutineContext, useRoutines };
