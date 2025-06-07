/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Routine } from "../context/RoutineContext";
import { useRoutines } from "../context/RoutineContext";
import type { Stack } from "../types/stack";
import RoutineEditorSheet from "./RoutineEditorSheet";
import { GripVertical, X, Flame, CheckCircle, MoveVertical, ArrowUp, ArrowDown, Edit2, Plus } from "lucide-react";
import WinAnimation from "./WinAnimation";
import { Badge } from "./ui/badge";
import { useSupabaseSync } from "../hooks/useSupabaseSync";
import { useScheduling } from "../hooks/useScheduling";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { StackItem } from "./StackItem";

interface RoutineListProps {
  routines: Routine[];
  showCompleted?: boolean;
  isEditMode?: boolean;
  selectedDate?: Date;
}

export const RoutineList: React.FC<RoutineListProps> = ({ routines, showCompleted = true, isEditMode = false, selectedDate }) => {
  // Initialize all hooks first
  const { toggleStackExpand, completeAction, skipAction, isStackCompleted, isRoutineCompleted, getStackProgress, reorderStacks, reorderRoutines, deleteStack, getUnscheduledStacks, setRoutines, setUnscheduledStacks } = useRoutines();
  const { isStackScheduledForDate, isStackScheduledForToday } = useScheduling();
  const { fetchUserData, isLoading, hasFetched } = useSupabaseSync();

  const [draggedRoutine, setDraggedRoutine] = useState<string | null>(null);
  const [draggedStack, setDraggedStack] = useState<{ routineId: string; stackId: string } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);
  const [jiggleItems, setJiggleItems] = useState(false);
  const [completedRoutines, setCompletedRoutines] = useState<Record<string, boolean>>({});
  const [routineAnimations, setRoutineAnimations] = useState<Record<string, boolean>>({});
  const [editingStack, setEditingStack] = useState<{ routineId: string; stackId: string } | null>(null);
  const [editStackName, setEditStackName] = useState("");
  const [editStackActions, setEditStackActions] = useState<any[]>([]);
  const [newAction, setNewAction] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [editRoutineId, setEditRoutineId] = useState<string | null>(null);
  const [editRoutineName, setEditRoutineName] = useState("");
  const [editRoutineStacks, setEditRoutineStacks] = useState<any[]>([]);
  const initialFetchRef = useRef(false);
  // Initial data fetch
  useEffect(() => {
    // Only fetch if we haven't fetched before and we're not already loading
    if (!hasFetched && !isLoading) {
      fetchUserData();
    }
  }, []);

  // Setup jiggle animation for edit mode
  useEffect(() => {
    setJiggleItems(isEditMode);

    if (isEditMode) {
      document.body.classList.add("editing-mode");
    } else {
      document.body.classList.remove("editing-mode");
    }

    return () => {
      document.body.classList.remove("editing-mode");
    };
  }, [isEditMode]);
  // Track completed routines to show animations
  useEffect(() => {
    const newCompletedState: Record<string, boolean> = {};
    const newAnimationState: Record<string, boolean> = {};
    const timeouts: NodeJS.Timeout[] = [];

    routines.forEach((routine) => {
      const wasCompleted = completedRoutines[routine.id] || false;
      const isCompleted = isRoutineCompleted(routine);
      newCompletedState[routine.id] = isCompleted;

      // Only trigger animation if completion state changed from false to true
      if (isCompleted && !wasCompleted) {
        newAnimationState[routine.id] = true;
        const timeout = setTimeout(() => {
          setRoutineAnimations((prev) => {
            const updated = { ...prev };
            delete updated[routine.id];
            return updated;
          });
        }, 2000);
        timeouts.push(timeout);
      }
    });

    // Batch state updates
    setCompletedRoutines(newCompletedState);
    if (Object.keys(newAnimationState).length > 0) {
      setRoutineAnimations((prev) => ({ ...prev, ...newAnimationState }));
    }

    // Cleanup timeouts
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [routines]);

  // Get today's day of the week
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Filter routines for today
  const todaysRoutines = routines; // Already filtered for today by the hook

  // Handle stack completion to expand next stack
  const handleStackCompleted = (routine: Routine, stackId: string) => {
    const stackIndex = routine.stacks.findIndex((s) => s.id === stackId);

    // Only proceed if there's a next stack to expand
    if (stackIndex >= 0 && stackIndex < routine.stacks.length - 1) {
      const nextStack = routine.stacks[stackIndex + 1];

      // Only auto-expand next stack if it's scheduled for the selected date
      const isScheduled = selectedDate ? isStackScheduledForDate(nextStack, selectedDate) : isStackScheduledForToday(nextStack);
      if (isScheduled) {
        // Collapse current stack and expand next stack
        toggleStackExpand(routine.id, stackId);
        toggleStackExpand(routine.id, nextStack.id);
      }
    }
  };

  // Handler to remove a stack from a routine
  const handleRemoveStack = (routineId: string, stackId: string) => {
    deleteStack(routineId, stackId);
  };

  // Drag and drop handlers for Edit Mode
  const handleRoutineDragStart = (e: React.DragEvent, routineId: string) => {
    if (!isEditMode) return;
    e.dataTransfer.setData("routineId", routineId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedRoutine(routineId);

    // Set a better drag image
    const dragElement = document.getElementById(routineId);
    if (dragElement) {
      const rect = dragElement.getBoundingClientRect();
      e.dataTransfer.setDragImage(dragElement, rect.width / 2, 20);
    }
  };

  const handleRoutineDragOver = (e: React.DragEvent, routineId: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedRoutine && draggedRoutine !== routineId) {
      setIsDraggingOver(routineId);
    }
  };

  const handleRoutineDrop = (e: React.DragEvent, targetRoutineId: string) => {
    if (!isEditMode) return;
    e.preventDefault();

    const draggedId = e.dataTransfer.getData("routineId");
    if (draggedId && draggedId !== targetRoutineId) {
      // Find the indices for the source and target routines
      const sourceIndex = todaysRoutines.findIndex((r) => r.id === draggedId);
      const targetIndex = todaysRoutines.findIndex((r) => r.id === targetRoutineId);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        reorderRoutines(sourceIndex, targetIndex);
      }
    }
    setDraggedRoutine(null);
    setIsDraggingOver(null);
  };

  const handleStackDragStart = (e: React.DragEvent, routineId: string, stackId: string) => {
    if (!isEditMode) return;
    e.stopPropagation(); // Prevent routine drag
    e.dataTransfer.setData("stackInfo", JSON.stringify({ routineId, stackId }));
    e.dataTransfer.effectAllowed = "move";
    setDraggedStack({ routineId, stackId });
  };

  const handleStackDragOver = (e: React.DragEvent, stackId: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation(); // Prevent routine drag over
    e.dataTransfer.dropEffect = "move";
    if (draggedStack && draggedStack.stackId !== stackId) {
      setIsDraggingOver(stackId);
    }
  };

  const handleStackDrop = (e: React.DragEvent, routineId: string, targetStackId: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation(); // Prevent routine drop

    const stackInfoStr = e.dataTransfer.getData("stackInfo");
    if (stackInfoStr) {
      const stackInfo = JSON.parse(stackInfoStr);
      if (stackInfo.routineId === routineId && stackInfo.stackId !== targetStackId) {
        // Find the routine
        const routine = routines.find((r) => r.id === routineId);
        if (routine) {
          // Find the indices for the source and target stacks
          const sourceIndex = routine.stacks.findIndex((s) => s.id === stackInfo.stackId);
          const targetIndex = routine.stacks.findIndex((s) => s.id === targetStackId);

          if (sourceIndex !== -1 && targetIndex !== -1) {
            reorderStacks(routineId, sourceIndex, targetIndex);
          }
        }
      }
    }
    setDraggedStack(null);
    setIsDraggingOver(null);
  };

  const handleDragEnd = () => {
    setDraggedRoutine(null);
    setDraggedStack(null);
    setIsDraggingOver(null);
  };

  if (todaysRoutines.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-lg text-gray-500">No routines scheduled for today.</p>
      </div>
    );
  }

  // Sort routines to put completed ones at the bottom
  const sortedRoutines = [...todaysRoutines].sort((a, b) => {
    const aCompleted = isRoutineCompleted(a);
    const bCompleted = isRoutineCompleted(b);
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    return 0;
  });

  const unscheduledStacks = getUnscheduledStacks();
  const todayMiscStacks = unscheduledStacks.filter((stack) => {
    const isScheduled = selectedDate ? isStackScheduledForDate(stack, selectedDate) : isStackScheduledForToday(stack);
    return stack.scheduleType && stack.scheduleType !== "none" && !stack.isOneTime && isScheduled;
  });

  return (
    <div className="space-y-6">
      {sortedRoutines.map((routine) => {
        const routineIsCompleted = isRoutineCompleted(routine);
        const showRoutineStreak = routine.streak > 0;

        return (
          <div key={routine.id} className={`bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md ${routineIsCompleted ? "opacity-80" : ""}`}>
            {/* Routine Header */}
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {routineIsCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stacks-purple/10 dark:bg-stacks-purple/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stacks-purple">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </div>
                )}

                <div>
                  <h2 className={`font-semibold text-lg ${routineIsCompleted ? "text-gray-500 line-through" : "text-gray-800 dark:text-white"}`}>{routine.title}</h2>
                  {routine.description && <p className={`text-sm ${routineIsCompleted ? "text-gray-400" : "text-gray-500"}`}>{routine.description}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Streak */}
                {showRoutineStreak && (
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 px-2 py-1">
                    <Flame size={14} className="mr-1 text-orange-500" />
                    {routine.streak}
                  </Badge>
                )}

                {isEditMode && (
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Edit2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Stacks List */}
            <div className="space-y-2 p-2">
              {routine.stacks.map((stack) => (
                <StackItem
                  key={stack.id}
                  stack={stack}
                  routineId={routine.id}
                  onToggleExpand={() => toggleStackExpand(routine.id, stack.id)}
                  onCompleteAction={(actionId) => completeAction(routine.id, stack.id, actionId)}
                  onSkipAction={(actionId) => skipAction(routine.id, stack.id, actionId)}
                  onStackCompleted={() => handleStackCompleted(routine, stack.id)}
                  onDeleteStack={() => deleteStack(routine.id, stack.id)}
                  isCompleted={isStackCompleted(stack)}
                  progressPercentage={getStackProgress(stack)}
                  isEditMode={isEditMode}
                  isScheduledForToday={selectedDate ? isStackScheduledForDate(stack, selectedDate) : isStackScheduledForToday(stack)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Show unscheduled stacks that are scheduled for today */}
      {todayMiscStacks.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
<div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
</div>
              <div>
                <h2 className="font-semibold text-lg text-foreground">Stacks for the day</h2>
                <p className="text-sm text-gray-500">Scheduled stacks not in routines</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 p-2">
            {todayMiscStacks.map((stack) => (
              <StackItem
                key={stack.id}
                stack={stack}
                routineId="library"
                onToggleExpand={() => toggleStackExpand("library", stack.id)}
                onCompleteAction={(actionId) => completeAction("library", stack.id, actionId)}
                onSkipAction={(actionId) => skipAction("library", stack.id, actionId)}
                onStackCompleted={() => {}}
                onDeleteStack={() => deleteStack("library", stack.id)}
                isCompleted={isStackCompleted(stack)}
                progressPercentage={getStackProgress(stack)}
                isEditMode={isEditMode}
                isScheduledForToday={selectedDate ? isStackScheduledForDate(stack, selectedDate) : isStackScheduledForToday(stack)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineList;
