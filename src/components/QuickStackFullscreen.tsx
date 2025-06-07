import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, SkipForward, Move, Clock } from "lucide-react";
import { useRoutines } from "../context/RoutineContext";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import WinAnimation from "./WinAnimation";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";

interface QuickStackAction {
  id: string;
  text: string;
  completed: boolean;
  skipped: boolean;
  streak: number;
}

interface QuickStackFullscreenProps {
  actions: QuickStackAction[];
  stackName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  onUpdate: (actions: QuickStackAction[]) => void;
}

const QuickStackFullscreen: React.FC<QuickStackFullscreenProps> = ({ actions, stackName, onClose, onSave, onUpdate }) => {
  const [completedAll, setCompletedAll] = useState(false);
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false);
  const [finalName, setFinalName] = useState(stackName);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [scheduleType, setScheduleType] = useState<"none" | "weekly" | "interval" | "biweekly">("weekly");
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [scheduleInterval, setScheduleInterval] = useState(1);

  // Timer state
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Track actions that have been completed today to prevent multiple streak increments
  const [completedToday] = useState<Record<string, boolean>>({});

  const { saveUnscheduledStack } = useRoutines();

  // One-time swipe hint state
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    return window && window.sessionStorage && !window.sessionStorage.getItem("swipeHintShown");
  });
  const handleFirstSwipe = () => {
    setShowSwipeHint(false);
    if (window && window.sessionStorage) {
      window.sessionStorage.setItem("swipeHintShown", "true");
    }
  };

  // Timer effect - automatically start when component mounts
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCompleteAction = (actionId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const actionKey = `${actionId}:${today}`;

    // Check if already completed today
    const alreadyCompleted = completedToday[actionKey];

    onUpdate(
      actions.map((action) =>
        action.id === actionId
          ? {
              ...action,
              completed: true,
              skipped: false,
              // Only increment streak if not already completed today
              streak: !alreadyCompleted ? action.streak + 1 : action.streak,
            }
          : action
      )
    );

    checkAllCompleted(actionId, true);
  };

  const handleSkipAction = (actionId: string) => {
    onUpdate(actions.map((action) => (action.id === actionId ? { ...action, skipped: true, completed: false, streak: 0 } : action)));

    checkAllCompleted(actionId, false);
  };

  const checkAllCompleted = (actionId: string, isComplete: boolean) => {
    // Check if all actions are now completed or skipped
    const updatedActions = actions.map((action) => (action.id === actionId ? { ...action, completed: isComplete, skipped: !isComplete } : action));

    if (updatedActions.every((action) => action.completed || action.skipped)) {
      setCompletedAll(true);
      setShowWinAnimation(true);

      // Hide the win animation after 2 seconds
      setTimeout(() => {
        setShowWinAnimation(false);
        setIsSaveSheetOpen(true); // Show save sheet after animation
      }, 2000);
    }
  };

  const handleSaveToLibrary = () => {
    // Create a stack and save to library
    const newStack = {
      id: crypto.randomUUID(),
      title: finalName || "Quick Stack",
      isExpanded: false, // Start collapsed
      streak: 0,
      isSchedulable: true,
      scheduleType: scheduleType,
      scheduleDays: scheduleDays,
      interval: scheduleInterval,
      actions: actions,
    };

    saveUnscheduledStack(newStack);
    toast.success("Stack saved to Library!");
    onClose();
  };

  const handleComplete = () => {
    if (completedAll) {
      setIsSaveSheetOpen(true);
    } else {
      // Check if any actions are completed
      const hasCompletedActions = actions.some((action) => action.completed);

      if (hasCompletedActions) {
        setIsSaveSheetOpen(true);
      } else {
        onClose();
      }
    }
  };

  const getProgress = () => {
    if (actions.length === 0) return 0;
    const completed = actions.filter((action) => action.completed || action.skipped).length;
    return (completed / actions.length) * 100;
  };

  // Improved drag and drop functionality
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    if (draggedItem !== index) {
      const newItems = [...actions];
      const draggedItemValue = newItems[draggedItem];

      // Remove the dragged item
      newItems.splice(draggedItem, 1);
      // Add it at the new position
      newItems.splice(index, 0, draggedItemValue);

      onUpdate(newItems);
      setDraggedItem(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const progressPercentage = getProgress();

  return (
    <div className="quick-stack-fullscreen fixed inset-0 bg-white z-50">
      <div className="stacks-container pb-20">
        {/* Swipe hint tooltip */}
        {showSwipeHint && <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-full text-xs z-50 shadow-md animate-fade-in">Tip: Swipe right to complete, left to skip</div>}
        <div className="sticky top-0 bg-white z-10 pb-4">
          <div className="flex justify-between items-center mb-4 pt-4">
            <h1 className="text-xl font-semibold">Quick Stack</h1>
            <button className="p-2 rounded-full hover:bg-gray-100" onClick={handleComplete} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center mb-4 p-3 bg-gray-50 rounded-lg">
            <Clock className="h-4 w-4 mr-2 text-gray-600" />
            <span className="text-lg font-mono font-semibold text-gray-700">{formatTime(elapsedTime)}</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full transition-all duration-500 ease-out"
              style={{
                backgroundColor: completedAll ? "#7E69AB" : "#9b87f5",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Counter */}
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{actions.filter((a) => a.completed).length} completed</span>
            <span>{actions.filter((a) => a.skipped).length} skipped</span>
            <span>{actions.filter((a) => !a.completed && !a.skipped).length} remaining</span>
          </div>

          {/* Swipe instruction hint */}
          <div className="text-center text-sm text-gray-400 dark:text-gray-500 mt-2">Swipe right to complete • Swipe left to skip</div>
        </div>

        <div className="space-y-3 mt-4">
          {actions.map((action, index) => (
            <SwipeableActionItem
              key={action.id}
              index={index}
              action={action}
              onComplete={() => {
                handleFirstSwipe();
                handleCompleteAction(action.id);
              }}
              onSkip={() => {
                handleFirstSwipe();
                handleSkipAction(action.id);
              }}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>

        {showWinAnimation && <WinAnimation show={showWinAnimation} onAnimationComplete={() => setShowWinAnimation(false)} />}

        {/* Save Sheet */}
        <Sheet open={isSaveSheetOpen} onOpenChange={setIsSaveSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle className="text-center">Save this Quick Stack for later?</SheetTitle>
            </SheetHeader>

            <div className="py-6 space-y-4">
              <input placeholder="Stack name" value={finalName} onChange={(e) => setFinalName(e.target.value)} className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-stacks-purple" />

              <div className="space-y-2">
                <label className="block text-sm font-medium">Schedule (optional)</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setScheduleType("none")} className={`px-4 py-2 text-sm rounded-full border ${scheduleType === "none" ? "bg-stacks-purple text-white border-stacks-purple" : "text-gray-700 border-gray-300"}`}>
                    No Schedule
                  </button>
                  <button onClick={() => setScheduleType("weekly")} className={`px-4 py-2 text-sm rounded-full border ${scheduleType === "weekly" ? "bg-stacks-purple text-white border-stacks-purple" : "text-gray-700 border-gray-300"}`}>
                    Weekly
                  </button>
                  <button onClick={() => setScheduleType("interval")} className={`px-4 py-2 text-sm rounded-full border ${scheduleType === "interval" ? "bg-stacks-purple text-white border-stacks-purple" : "text-gray-700 border-gray-300"}`}>
                    Every X Days
                  </button>
                  <button onClick={() => setScheduleType("biweekly")} className={`px-4 py-2 text-sm rounded-full border ${scheduleType === "biweekly" ? "bg-stacks-purple text-white border-stacks-purple" : "text-gray-700 border-gray-300"}`}>
                    Biweekly
                  </button>
                </div>
              </div>

              {scheduleType === "weekly" || scheduleType === "biweekly" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Select days</label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <button
                        key={day}
                        onClick={() => {
                          if (scheduleDays.includes(day)) {
                            setScheduleDays(scheduleDays.filter((d) => d !== day));
                          } else {
                            setScheduleDays([...scheduleDays, day]);
                          }
                        }}
                        className={`px-4 py-2 text-sm rounded-full border ${scheduleDays.includes(day) ? "bg-stacks-purple text-white border-stacks-purple" : "text-gray-700 border-gray-300"}`}>
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : scheduleType === "interval" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Repeat every</label>
                  <div className="flex items-center space-x-2">
                    <input type="number" min={1} value={scheduleInterval} onChange={(e) => setScheduleInterval(parseInt(e.target.value) || 1)} className="w-20 p-2 border rounded-md" />
                    <span>day(s)</span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 pt-4">
                <Button onClick={handleSaveToLibrary} className="w-full bg-stacks-purple hover:bg-stacks-purple/90">
                  Save Stack
                </Button>
                <Button variant="ghost" onClick={onClose} className="w-full text-gray-500">
                  Discard
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

interface SwipeableActionItemProps {
  action: QuickStackAction;
  index: number;
  onComplete: () => void;
  onSkip: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const SwipeableActionItem: React.FC<SwipeableActionItemProps> = ({ action, index, onComplete, onSkip, onDragStart, onDragOver, onDragEnd }) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const x = useMotionValue(0);
  const background = useTransform(x, [-200, -100, 0, 100, 200], ["#FEE2E2", "#FECACA", "transparent", "#D1FAE5", "#A7F3D0"]);
  const [swipeProcessed, setSwipeProcessed] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // For animating icon size
  const iconScale = useTransform(x, [-200, -100, 0, 100, 200], [1.2, 1, 1, 1, 1.2]);
  const iconOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.2, 0, 0.2, 0.5]);

  const handleDragStart = () => {
    setIsSwiping(true);
    setSwipeProcessed(false);
    setHasSwiped(false);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    x.set(info.offset.x);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsSwiping(false);
    if (swipeProcessed || hasSwiped) {
      x.set(0);
      return;
    }
    const minDistance = 100;
    if (info.offset.x > minDistance) {
      setSwipeProcessed(true);
      setHasSwiped(true);
      setIsAnimatingOut(true);
      x.set(300);
      setTimeout(() => {
        setIsAnimatingOut(false);
        onComplete();
      }, 250);
    } else if (info.offset.x < -minDistance) {
      setSwipeProcessed(true);
      setHasSwiped(true);
      setIsAnimatingOut(true);
      x.set(-300);
      setTimeout(() => {
        setIsAnimatingOut(false);
        onSkip();
      }, 250);
    } else {
      x.set(0);
    }
  };

  useEffect(() => {
    if (action.completed || action.skipped) {
      x.set(0);
    }
  }, [action.completed, action.skipped, x]);

  return (
    <motion.div
      style={{ background }}
      className={`relative rounded-lg overflow-hidden shadow-sm border transition-all duration-300 ${action.completed ? "bg-green-50 dark:bg-green-900/20" : action.skipped ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : "bg-white dark:bg-gray-800"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isAnimatingOut ? 0 : 1, y: isAnimatingOut ? 30 : 0, height: isAnimatingOut ? 0 : "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}>
      {/* Subtle arrows (chevrons) at edges */}
      {!isSwiping && !action.completed && !action.skipped && (
        <>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-lg pointer-events-none select-none opacity-60">&#8592;</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-lg pointer-events-none select-none opacity-60">&#8594;</span>
        </>
      )}
      {/* Animated check/skip icons as user swipes */}
      <motion.span className="absolute left-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ scale: iconScale, opacity: iconOpacity }}>
        <Check className="w-6 h-6 text-green-400" />
      </motion.span>
      <motion.span className="absolute right-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ scale: iconScale, opacity: iconOpacity }}>
        <SkipForward className="w-6 h-6 text-red-400" />
      </motion.span>
      <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1} dragMomentum={true} onDragStart={handleDragStart} onDrag={handleDrag} onDragEnd={handleDragEnd} style={{ x }} className={`relative p-4 select-none touch-pan-x ${isSwiping ? "" : "transition-transform duration-300"}`}>
        <div className={`${action.completed ? "line-through text-gray-400 dark:text-gray-500" : action.skipped ? "line-through text-red-400" : ""}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`flex-1 break-words ${!action.completed && !action.skipped ? "text-gray-900 dark:text-white" : ""}`}>{action.text}</span>
            <div className="flex gap-2">
              {/* Accessible buttons for non-swipe users */}
              {!action.completed && !action.skipped && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Complete"
                    onClick={() => {
                      setIsAnimatingOut(true);
                      setTimeout(onComplete, 250);
                    }}>
                    <Check className="w-5 h-5 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Skip"
                    onClick={() => {
                      setIsAnimatingOut(true);
                      setTimeout(onSkip, 250);
                    }}>
                    <SkipForward className="w-5 h-5 text-red-400" />
                  </Button>
                </>
              )}
              {action.completed && (
                <div className="flex items-center text-green-600">
                  <Check className="w-5 h-5" />
                </div>
              )}
              {action.skipped && (
                <div className="flex items-center text-red-400">
                  <SkipForward className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuickStackFullscreen;
