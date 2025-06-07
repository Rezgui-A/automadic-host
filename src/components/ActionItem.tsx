import React, { useRef, useState, useEffect } from "react";
import { Action } from "../context/RoutineContext";
import { Check, SkipForward } from "lucide-react";
import { Badge } from "./ui/badge";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";

interface ActionItemProps {
  action: Action;
  onComplete: () => void;
  onSkip: () => void;
  onUndo?: () => void;
  isFirst?: boolean;
  showSwipeHint?: boolean;
  onHintDismiss?: () => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ action, onComplete, onSkip, onUndo, isFirst = false, showSwipeHint = false, onHintDismiss }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hasNudged, setHasNudged] = useState(false);
  const dragX = useMotionValue(0);
  const constraintsRef = useRef(null);

  // Nudge animation for first item
  useEffect(() => {
    if (isFirst && showSwipeHint && !hasNudged) {
      setHasNudged(true);
      const nudge = async () => {
        await dragX.set(30);
        await new Promise((r) => setTimeout(r, 120));
        await dragX.set(-30);
        await new Promise((r) => setTimeout(r, 120));
        await dragX.set(0);
      };
      nudge();
      // Dismiss hint after nudge
      setTimeout(() => {
        if (onHintDismiss) onHintDismiss();
      }, 1200);
    }
  }, [isFirst, showSwipeHint, hasNudged, dragX, onHintDismiss]);

  // Transform drag distance to background color with dark mode support
  const backgroundColor = useTransform(dragX, [-100, -50, 0, 50, 100], ["rgba(239, 68, 68, 0.3)", "rgba(239, 68, 68, 0.1)", "transparent", "rgba(34, 197, 94, 0.1)", "rgba(34, 197, 94, 0.3)"]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    if (onHintDismiss) onHintDismiss();
    const threshold = 50;

    if (info.offset.x > threshold) {
      // Swiped right - complete
      onComplete();
    } else if (info.offset.x < -threshold) {
      // Swiped left - skip
      onSkip();
    }

    // Reset position
    dragX.set(0);
  };

  return (
    <motion.div
      ref={constraintsRef}
      className={`action-item ${action.completed ? "completed" : action.skipped ? "skipped" : ""} relative overflow-hidden`}
      style={{ x: dragX, backgroundColor }}
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      dragElastic={0.2}
      onDragStart={() => {
        setIsDragging(true);
        if (onHintDismiss) onHintDismiss();
      }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}>
      {/* Subtle swipe gradients with dark mode support */}
      {!action.completed && !action.skipped && (
        <>
          <div className="absolute left-0 top-0 h-full w-1/4 pointer-events-none select-none" style={{ background: "linear-gradient(to right, rgba(239,68,68,0.10), transparent)" }} />
          <div className="absolute right-0 top-0 h-full w-1/4 pointer-events-none select-none" style={{ background: "linear-gradient(to left, rgba(34,197,94,0.10), transparent)" }} />
        </>
      )}
      {/* Faint swipe arrows, only if not swiping/completed/skipped */}
      {!isDragging && !action.completed && !action.skipped && (
        <>
          {/* Animated chevrons for swipe hinting */}
          <motion.div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-lg pointer-events-none select-none opacity-60" animate={{ x: [0, 8, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}>
            <SkipForward size={18} className="text-red-400" />
          </motion.div>
          <motion.div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-lg pointer-events-none select-none opacity-60" animate={{ x: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}>
            <Check size={18} className="text-green-400" />
          </motion.div>
        </>
      )}
      {/* One-time swipe hint tooltip for first item */}
      {isFirst && showSwipeHint && !isDragging && !action.completed && !action.skipped && <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black dark:bg-gray-700 text-white text-xs rounded px-3 py-1 shadow z-20 animate-fade-in">Swipe right to complete, left to skip</div>}

      <div className="flex items-center justify-between relative z-10 bg-white dark:bg-gray-800">
        <span className={`flex-1 ${action.completed ? "line-through text-gray-500 dark:text-gray-400" : action.skipped ? "line-through text-red-400" : "text-gray-900 dark:text-white"}`}>{action.text}</span>

        <div className="flex items-center gap-2">
          {action.streak > 0 && (
            <Badge variant="outline" className="text-xs">
              🔥 {action.streak}
            </Badge>
          )}

          {action.completed && (
            <div className="text-green-600">
              <Check size={18} />
            </div>
          )}

          {action.skipped && (
            <div className="text-red-400">
              <SkipForward size={18} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActionItem;
