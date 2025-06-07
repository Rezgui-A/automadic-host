import { Stack, Routine } from "../context/RoutineContext";

// Unified scheduling item type
type SchedulableItem = Stack | Routine;

/**
 * Utility hook for unified scheduling logic for both stacks and routines
 */
export const useScheduling = () => {
  /**
   * Check if a schedulable item (stack or routine) is scheduled for a specific date
   */
  const isItemScheduledForDate = (item: SchedulableItem, targetDate?: Date): boolean => {
    const checkDate = targetDate || new Date();

    // Get the correct schedule days property based on item type
    const scheduleDays = "scheduleDays" in item ? item.scheduleDays : (item as Routine).days;

    // If the item doesn't have specific scheduling, assume it follows default schedule
    if (!scheduleDays || scheduleDays.length === 0) {
      // For stacks, if no schedule is set, check if it's schedulable
      if ("isSchedulable" in item && item.isSchedulable === false) {
        return false;
      }
      // Default to true for routines or schedulable stacks
      return true;
    }

    // If the item is explicitly not schedulable (stacks only), it doesn't show up in Today
    if ("isSchedulable" in item && item.isSchedulable === false) {
      return false;
    }

    const dayOfWeek = checkDate.toLocaleDateString("en-US", { weekday: "long" });
    const dayOfMonth = checkDate.getDate();

    console.log("[useScheduling] Checking item:", item.title || "Unknown", "for date:", checkDate.toDateString(), "Day:", dayOfWeek);

    // Handle different schedule types
    if (!item.scheduleType || item.scheduleType === "weekly") {
      // Simple weekly schedule - check if today is one of the scheduled days
      return scheduleDays.includes(dayOfWeek);
    } else if (item.scheduleType === "interval") {
      // Every X days interval
      if (!item.startDate) {
        return false; // If no start date is set, don't schedule
      }

      const startDate = new Date(item.startDate);
      const daysSinceStart = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // If interval is set, check if today falls on the interval
      if (item.interval) {
        return daysSinceStart >= 0 && daysSinceStart % item.interval === 0;
      }

      return false;
    } else if (item.scheduleType === "biweekly") {
      // Every X weeks on specific days
      if (!item.startDate) {
        return false; // If no start date is set, don't schedule
      }

      const startDate = new Date(item.startDate);
      const weeksSinceStart = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

      // If interval is set and today is one of the specified days
      if (item.interval && scheduleDays.includes(dayOfWeek)) {
        return weeksSinceStart >= 0 && weeksSinceStart % item.interval === 0;
      }

      return false;
    } else if (item.scheduleType === "monthly") {
      // Monthly scheduling based on specific day of the month
      if (!item.startDate || !item.dayOfMonth) {
        return false; // If no start date or day of month is set, don't schedule
      }

      const startDate = new Date(item.startDate);
      const monthsSinceStart = (checkDate.getFullYear() - startDate.getFullYear()) * 12 + (checkDate.getMonth() - startDate.getMonth());

      // Check if today's day of month matches and we're on the right month interval
      if (item.interval && dayOfMonth === item.dayOfMonth) {
        return monthsSinceStart >= 0 && monthsSinceStart % item.interval === 0;
      }

      return false;
    } else if (item.scheduleType === "oneTime") {
      // One-time schedule - check if today matches the start date
      if (!item.startDate) {
        return false;
      }

      const startDate = new Date(item.startDate);
      const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

      return checkDateOnly.getTime() === startDateOnly.getTime();
    } else if (item.scheduleType === "none") {
      // No schedule - don't show in today
      return false;
    }

    // Default: use weekly schedule for backward compatibility
    return scheduleDays.includes(dayOfWeek);
  };

  /**
   * Check if a schedulable item (stack or routine) is scheduled for today (current date)
   */
  const isItemScheduledForToday = (item: SchedulableItem): boolean => {
    return isItemScheduledForDate(item, new Date());
  };

  /**
   * Legacy function for stack compatibility - checks current date
   */
  const isStackScheduledForToday = (stack: Stack): boolean => {
    return isItemScheduledForDate(stack, new Date());
  };

  /**
   * Check if a stack is scheduled for a specific date
   */
  const isStackScheduledForDate = (stack: Stack, targetDate: Date): boolean => {
    return isItemScheduledForDate(stack, targetDate);
  };

  /**
   * Check if a routine is scheduled for today (current date)
   */
  const isRoutineScheduledForToday = (routine: Routine): boolean => {
    return isItemScheduledForDate(routine, new Date());
  };

  /**
   * Check if a routine is scheduled for a specific date
   */
  const isRoutineScheduledForDate = (routine: Routine, targetDate: Date): boolean => {
    return isItemScheduledForDate(routine, targetDate);
  };

  /**
   * Check if an item should track streaks
   * Items that are quick stacks, manually launched, or unscheduled should not track streaks
   */
  const shouldTrackStreak = (item: SchedulableItem): boolean => {
    // Don't track streaks for stacks that aren't schedulable
    if ("isSchedulable" in item && item.isSchedulable === false) {
      return false;
    }

    // Don't track streaks for items with no schedule
    if (!item.scheduleType || item.scheduleType === "none") {
      return false;
    }

    // Don't track streaks for one-time items
    if (item.scheduleType === "oneTime") {
      return false;
    }

    return true;
  };

  return {
    isItemScheduledForDate,
    isItemScheduledForToday,
    isStackScheduledForToday,
    isStackScheduledForDate,
    isRoutineScheduledForToday,
    isRoutineScheduledForDate,
    shouldTrackStreak,
  };
};
