import React, { useState, useEffect } from "react";
import { Stack } from "../context/RoutineContext";
import ActionItem from "./ActionItem";
import WinAnimation from "./WinAnimation";
import { StackOverflowMenu } from "./StackOverflowMenu";
import { GripVertical, Flame } from "lucide-react";
import { Badge } from "./ui/badge";
import { useScheduling } from "../hooks/useScheduling";
import { motion, AnimatePresence } from "framer-motion";

interface StackItemProps {
  stack: Stack;
  routineId: string;
  onToggleExpand: () => void;
  onCompleteAction: (actionId: string) => void;
  onSkipAction: (actionId: string) => void;
  onStackCompleted?: () => void;
  onDeleteStack?: () => Promise<void>;
  isCompleted: boolean;
  progressPercentage: number;
  isEditMode?: boolean;
  isScheduledForToday?: boolean;
}

export const StackItem: React.FC<StackItemProps> = ({
  stack,
  routineId,
  onToggleExpand,
  onCompleteAction,
  onSkipAction,
  onStackCompleted,
  onDeleteStack,
  isCompleted,
  progressPercentage,
  isEditMode = false,
  isScheduledForToday = true
}) => {
  const { shouldTrackStreak } = useScheduling();
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(isCompleted);
  const [justCompleted, setJustCompleted] = useState(false);

  const completedCount = stack.actions.filter((a) => a.completed).length;
  const skippedCount = stack.actions.filter((a) => a.skipped).length;
  const totalActions = stack.actions.length;
  const incompletedCount = totalActions - completedCount - skippedCount;

  const completedPercentage = totalActions ? (completedCount / totalActions) * 100 : 0;
  const skippedPercentage = totalActions ? (skippedCount / totalActions) * 100 : 0;

  const showStreak = stack.streak > 0 && shouldTrackStreak(stack);

  useEffect(() => {
    if (!wasCompleted && isCompleted) {
      setShowWinAnimation(true);
      setJustCompleted(true);
      setWasCompleted(true);
      if (onStackCompleted) {
        setTimeout(onStackCompleted, 500);
      }
    } else if (!isCompleted) {
      setWasCompleted(false);
      setJustCompleted(false);
    }
  }, [isCompleted, wasCompleted, onStackCompleted]);

  const handleActionComplete = (actionId: string) => {
    onCompleteAction(actionId);
    const remainingActions = stack.actions.filter(
      (action) => !action.completed && !action.skipped && action.id !== actionId
    ).length;
    if (remainingActions === 0 && onStackCompleted) {
      onStackCompleted();
    }
  };

  const handleWinAnimationComplete = () => {
    setShowWinAnimation(false);
    onStackCompleted?.();
  };

  if (!isScheduledForToday && !isEditMode) return null;

  return (
    <motion.div
      className={`stack-card rounded-lg shadow-sm border p-4 ${
        isCompleted ? "opacity-70" : ""
      }`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      {justCompleted && (
        <WinAnimation
          show={showWinAnimation}
          onAnimationComplete={handleWinAnimationComplete}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center flex-1 ${
            isEditMode ? "cursor-grab user-select-none" : "cursor-pointer"
          }`}
          onClick={!isEditMode ? onToggleExpand : undefined}
        >
          {isEditMode && (
            <div className="mr-2 text-gray-400">
              <GripVertical size={16} />
            </div>
          )}
          <div className="mr-3">
            {isCompleted ? (
              <motion.div
                className="w-6 h-6 rounded-full bg-stacks-purple flex items-center justify-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  />
                </svg>
              </motion.div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-stacks-purple flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {incompletedCount}
                </span>
              </div>
            )}
          </div>
          <h3
            className={`text-base font-semibold ${
              isCompleted ? "line-through text-gray-400" : "text-gray-900 dark:text-white"
            }`}
          >
            {stack.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {showStreak && (
            <Badge
              variant="outline"
              className="bg-yellow-100 dark:bg-yellow-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 px-2"
            >
              <Flame size={12} className="text-amber-500 dark:text-amber-400" />
              {stack.streak}
            </Badge>
          )}
          <StackOverflowMenu
            stackId={stack.id}
            routineId={routineId}
            stackTitle={stack.title}
            onDelete={
              onDeleteStack || (() => Promise.reject(new Error("Delete not implemented")))
            }
          />
          {!isEditMode && (
            <button
              onClick={onToggleExpand}
              className="p-1 -mr-1 text-gray-500 hover:text-gray-700"
              aria-label={stack.isExpanded ? "Collapse stack" : "Expand stack"}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: stack.isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 mt-3 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-700">
        <div
          className="h-full bg-green-500"
          style={{ width: `${completedPercentage}%` }}
        />
        <div
          className="h-full bg-red-400"
          style={{ width: `${skippedPercentage}%` }}
        />
        <div
          className="h-full bg-gray-300 dark:bg-zinc-600"
          style={{ width: `${100 - completedPercentage - skippedPercentage}%` }}
        />
      </div>

      {/* Actions */}
      <AnimatePresence>
        {stack.isExpanded && !isEditMode && (
          <motion.div
            className="mt-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {stack.actions.map((action) => (
              <ActionItem
                key={action.id}
                action={action}
                onComplete={() => handleActionComplete(action.id)}
                onSkip={() => onSkipAction(action.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};