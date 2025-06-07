/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Action, Stack, Routine } from "../context/RoutineContext";
import { useScheduling } from "./useScheduling";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

// Helper function to safely parse actions
const parseActions = (actions: any): Action[] => {
  if (Array.isArray(actions)) {
    return actions.map((action) => ({
      id: action.id || "",
      text: action.text || "",
      completed: Boolean(action.completed),
      skipped: Boolean(action.skipped),
      streak: Number(action.streak) || 0,
    }));
  }

  try {
    const parsed = JSON.parse(actions || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Helper to transform Supabase stack to frontend stack
const transformStack = (dbStack: any): Stack => ({
  id: dbStack.id,
  title: dbStack.title,
  isExpanded: dbStack.is_expanded === "true" || dbStack.is_expanded === true,
  actions: parseActions(dbStack.actions),
  streak: Number(dbStack.streak) || 0,
  scheduleType: dbStack.schedule_type || "weekly",
  scheduleDays: Array.isArray(dbStack.schedule_days) ? dbStack.schedule_days : dbStack.schedule_days ? [dbStack.schedule_days] : [],
  interval: dbStack.interval ? Number(dbStack.interval) : undefined,
  isSchedulable: dbStack.is_schedulable !== false,
  startDate: dbStack.start_date || undefined,
  dayOfMonth: dbStack.day_of_month ? Number(dbStack.day_of_month) : undefined,
});

export const useStackActions = () => {
  const { shouldTrackStreak, isStackScheduledForToday } = useScheduling();

  const [completionDates, setCompletionDates] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleStackExpand = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, stackId: string) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              stacks: routine.stacks.map((stack) => (stack.id === stackId ? { ...stack, isExpanded: !stack.isExpanded } : stack)),
            }
          : routine
      )
    );
  };

  const completeAction = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, stackId: string, actionId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const actionKey = `${routineId}:${stackId}:${actionId}`;

    setCompletionDates((prev) => ({
      ...prev,
      [actionKey]: today,
    }));

    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) => {
        if (routine.id !== routineId) return routine;

        return {
          ...routine,
          stacks: routine.stacks.map((stack) => {
            if (stack.id !== stackId) return stack;

            const trackStreak = shouldTrackStreak(stack) && isStackScheduledForToday(stack);
            const alreadyCompletedToday = completionDates[actionKey] === today;

            return {
              ...stack,
              actions: stack.actions.map((action) => {
                const newStreak = action.id === actionId && trackStreak && !alreadyCompletedToday ? (action.streak || 0) + 1 : action.streak || 0;

                return action.id === actionId
                  ? {
                      ...action,
                      completed: true,
                      skipped: false,
                      streak: newStreak,
                    }
                  : action;
              }),
            };
          }),
        };
      })
    );

    updateStackStreaksAfterAction(routines, setRoutines, routineId, stackId);
  };

  const skipAction = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, stackId: string, actionId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const actionKey = `${routineId}:${stackId}:${actionId}:skipped`;

    setCompletionDates((prev) => ({
      ...prev,
      [actionKey]: today,
    }));

    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              stacks: routine.stacks.map((stack) =>
                stack.id === stackId
                  ? {
                      ...stack,
                      actions: stack.actions.map((action) =>
                        action.id === actionId
                          ? {
                              ...action,
                              skipped: true,
                              completed: false,
                              streak: 0,
                            }
                          : action
                      ),
                    }
                  : stack
              ),
            }
          : routine
      )
    );

    resetStackStreak(routines, setRoutines, routineId, stackId);
  };

  const updateStackStreaksAfterAction = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, stackId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const stackIndex = routine.stacks.findIndex((s) => s.id === stackId);
    if (stackIndex === -1) return;

    const stack = routine.stacks[stackIndex];
    const allActionsHandled = stack.actions.every((action) => action.completed || action.skipped);
    const allActionsCompleted = stack.actions.every((action) => action.completed);

    if (allActionsHandled) {
      const stackScheduledForToday = isStackScheduledForToday(stack);
      const trackStreak = shouldTrackStreak(stack);

      if (allActionsCompleted && stackScheduledForToday && trackStreak) {
        const today = new Date().toISOString().split("T")[0];
        const stackKey = `${routineId}:${stackId}:completed`;
        const lastCompletionDate = completionDates[stackKey];
        const alreadyCompletedToday = lastCompletionDate === today;

        setCompletionDates((prev) => ({
          ...prev,
          [stackKey]: today,
        }));

        // Update stack streak
        if (!alreadyCompletedToday) {
          setRoutines((prevRoutines) =>
            prevRoutines.map((r) =>
              r.id === routineId
                ? {
                    ...r,
                    stacks: r.stacks.map((s, idx) => (idx === stackIndex ? { ...s, streak: (s.streak || 0) + 1, isExpanded: false } : idx === stackIndex + 1 && routine.stacks.length > stackIndex + 1 ? { ...s, isExpanded: true } : s)),
                  }
                : r
            )
          );
        }

        updateRoutineStreakAfterStackCompletion(routines, setRoutines, routineId);
      } else if (!allActionsCompleted && stackScheduledForToday) {
        resetStackStreak(routines, setRoutines, routineId, stackId);
      }

      // Auto-expand next stack if available
      if (stackIndex < routine.stacks.length - 1) {
        const nextStack = routine.stacks[stackIndex + 1];
        if (nextStack && isStackScheduledForToday(nextStack)) {
          setRoutines((prevRoutines) =>
            prevRoutines.map((r) =>
              r.id === routineId
                ? {
                    ...r,
                    stacks: r.stacks.map((s, idx) => (idx === stackIndex ? { ...s, isExpanded: false } : idx === stackIndex + 1 ? { ...s, isExpanded: true } : s)),
                  }
                : r
            )
          );
        }
      }
    }
  };

  const resetStackStreak = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, stackId: string) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((r) =>
        r.id === routineId
          ? {
              ...r,
              stacks: r.stacks.map((s) => (s.id === stackId ? { ...s, streak: 0 } : s)),
            }
          : r
      )
    );

    resetRoutineStreak(routines, setRoutines, routineId);
  };

  const updateRoutineStreakAfterStackCompletion = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const todayStacks = routine.stacks.filter((stack) => isStackScheduledForToday(stack));
    if (todayStacks.length === 0) return;

    const allTodayStacksCompleted = todayStacks.every((stack) => {
      return stack.actions.every((action) => action.completed);
    });

    if (allTodayStacksCompleted) {
      const today = new Date().toISOString().split("T")[0];
      const routineKey = `${routineId}:completed`;
      const lastCompletionDate = completionDates[routineKey];
      const alreadyCompletedToday = lastCompletionDate === today;

      setCompletionDates((prev) => ({
        ...prev,
        [routineKey]: today,
      }));

      if (!alreadyCompletedToday) {
        setRoutines((prevRoutines) => prevRoutines.map((r) => (r.id === routineId ? { ...r, streak: (r.streak || 0) + 1 } : r)));
      }

      collapseAllStacks(routines, setRoutines, routineId);
    }
  };

  const resetRoutineStreak = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string) => {
    setRoutines((prevRoutines) => prevRoutines.map((r) => (r.id === routineId ? { ...r, streak: 0 } : r)));
  };

  const collapseAllStacks = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              stacks: routine.stacks.map((stack) => ({
                ...stack,
                isExpanded: false,
              })),
            }
          : routine
      )
    );
  };

  const resetCompletedItems = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>) => {
    setRoutines((prevRoutines) => {
      return prevRoutines.map((routine) => {
        const incompleteStacks = routine.stacks.filter((stack) => {
          const scheduled = isStackScheduledForToday(stack);
          const completed = stack.actions.every((a) => a.completed || a.skipped);
          return scheduled && !completed && shouldTrackStreak(stack);
        });

        const shouldResetRoutineStreak = incompleteStacks.length > 0;

        return {
          ...routine,
          streak: shouldResetRoutineStreak ? 0 : routine.streak,
          stacks: routine.stacks.map((stack) => {
            const scheduled = isStackScheduledForToday(stack);
            const allActionsCompleted = stack.actions.every((a) => a.completed);
            const anyActionsSkipped = stack.actions.some((a) => a.skipped);
            const shouldResetStackStreak = scheduled && (!allActionsCompleted || anyActionsSkipped) && shouldTrackStreak(stack);

            return {
              ...stack,
              streak: shouldResetStackStreak ? 0 : stack.streak,
              actions: stack.actions.map((action) => ({
                ...action,
                streak: action.skipped || (scheduled && !action.completed) ? 0 : action.streak,
                completed: false,
                skipped: false,
              })),
            };
          }),
        };
      });
    });

    const today = new Date().toISOString().split("T")[0];
    setCompletionDates((prev) => {
      const updatedDates: Record<string, string> = {};
      Object.entries(prev).forEach(([key, date]) => {
        if (date === today) {
          updatedDates[key] = date;
        }
      });
      return updatedDates;
    });
  };

  const updateActions = (routines: Routine[], setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>, routineId: string, stackId: string, actions: Action[]) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              stacks: routine.stacks.map((stack) =>
                stack.id === stackId
                  ? {
                      ...stack,
                      actions: actions.map((a) => ({
                        ...a,
                        streak: a.streak || 0,
                        completed: Boolean(a.completed),
                        skipped: Boolean(a.skipped),
                      })),
                    }
                  : stack
              ),
            }
          : routine
      )
    );
  };

  const updateStackActions = async (stack: Stack, actions: Action[]) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("stacks")
        .update({
          actions: JSON.stringify(actions),
          updated_at: new Date().toISOString(),
        })
        .eq("id", stack.id);

      if (error) throw error;
      return actions;
    } catch (error) {
      console.error("Error updating stack actions:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const addActionToStack = async (stack: Stack, action: Omit<Action, "id">) => {
    const newAction = {
      ...action,
      id: crypto.randomUUID(),
    };

    const updatedActions = [...stack.actions, newAction];
    await updateStackActions(stack, updatedActions);
    return updatedActions;
  };

  const removeActionFromStack = async (stack: Stack, actionId: string) => {
    const updatedActions = stack.actions.filter((a) => a.id !== actionId);
    await updateStackActions(stack, updatedActions);
    return updatedActions;
  };

  const reorderStackActions = async (stack: Stack, sourceIndex: number, targetIndex: number) => {
    const updatedActions = [...stack.actions];
    const [movedAction] = updatedActions.splice(sourceIndex, 1);
    updatedActions.splice(targetIndex, 0, movedAction);
    await updateStackActions(stack, updatedActions);
    return updatedActions;
  };

  return {
    unscheduledStacks: [],
    setUnscheduledStacks: () => {},
    toggleStackExpand,
    completeAction,
    skipAction,
    resetCompletedItems,
    updateActions,
    collapseAllStacks,
    transformStack,
    isUpdating,
    updateStackActions,
    addActionToStack,
    removeActionFromStack,
    reorderStackActions,
  };
};
