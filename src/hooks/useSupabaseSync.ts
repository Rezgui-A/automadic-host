/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback, useRef } from "react";
import { Action, useRoutines } from "../context/RoutineContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../integrations/supabase/client";
import { Database, Json } from "../integrations/supabase/types";
import { Routine, Stack } from "../context/RoutineContext";
import { toast } from "sonner";

type Tables = Database["public"]["Tables"];
type StackRow = Tables["stacks"]["Row"];

export const useSupabaseSync = () => {
  const { routines, setRoutines, unscheduledStacks, setUnscheduledStacks } = useRoutines();
  const { user, session } = useAuth();
  const mountedRef = useRef(true);
  const isLoadingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const initializingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const transformDbRoutine = useCallback((dbRoutine: any): Routine => {
    return {
      id: dbRoutine.id,
      title: dbRoutine.title,
      description: dbRoutine.description || "",
      stacks: transformDbStacks(dbRoutine.stacks),
      days: dbRoutine.days || [],
      streak: dbRoutine.streak || 0,
      scheduleType: dbRoutine.schedule_type || "weekly",
      interval: dbRoutine.interval,
      startDate: dbRoutine.start_date,
      dayOfMonth: dbRoutine.day_of_month,
    };
  }, []);

  const transformDbStacks = useCallback((stacks: any): Stack[] => {
    if (!stacks) return [];

    // Handle both string and array cases
    const stacksData = typeof stacks === "string" ? JSON.parse(stacks) : stacks;
    if (!Array.isArray(stacksData)) return [];

    return stacksData.map((stack: any) => {
      // Ensure actions is always an array of the correct shape
      let actions: Action[] = [];
      if (Array.isArray(stack.actions)) {
        actions = stack.actions.map((a: any) => ({
          id: a.id || crypto.randomUUID(),
          text: a.text || "",
          completed: Boolean(a.completed),
          skipped: Boolean(a.skipped),
          streak: Number(a.streak) || 0,
        }));
      } else if (typeof stack.actions === "string") {
        try {
          const parsedActions = JSON.parse(stack.actions);
          if (Array.isArray(parsedActions)) {
            actions = parsedActions.map((a: any) => ({
              id: a.id || crypto.randomUUID(),
              text: a.text || "",
              completed: Boolean(a.completed),
              skipped: Boolean(a.skipped),
              streak: Number(a.streak) || 0,
            }));
          }
        } catch (e) {
          console.error("Failed to parse actions:", e);
        }
      }

      return {
        id: stack.id,
        title: stack.title,
        isExpanded: Boolean(stack.is_expanded),
        actions,
        streak: Number(stack.streak) || 0,
        scheduleType: stack.schedule_type || "none",
        scheduleDays: Array.isArray(stack.schedule_days) ? stack.schedule_days : [],
        interval: Number(stack.interval) || null,
        isSchedulable: Boolean(stack.is_schedulable),
        startDate: stack.start_date || null,
        dayOfMonth: Number(stack.day_of_month) || null,
      };
    });
  }, []);

  const transformStacksForDb = useCallback((stacks: Stack[]): Json => {
    return stacks.map((stack) => ({
      id: stack.id,
      title: stack.title,
      is_expanded: stack.isExpanded,
      actions: stack.actions.map((action) => ({
        id: action.id,
        text: action.text,
        completed: action.completed,
        skipped: action.skipped,
        streak: action.streak,
      })),
      streak: stack.streak,
      schedule_type: stack.scheduleType,
      schedule_days: stack.scheduleDays,
      interval: stack.interval,
      is_schedulable: stack.isSchedulable,
      start_date: stack.startDate,
      day_of_month: stack.dayOfMonth,
    }));
  }, []);
  interface DbStack {
    id: string;
    title: string;
    actions: Json;
    type: string;
    is_expanded?: boolean;
    streak?: number;
    schedule_type?: string;
    schedule_days?: string[];
    interval?: number;
    is_schedulable?: boolean;
    start_date?: string;
    day_of_month?: number;
    created_at: string;
    user_id: string;
  }

  const fetchUserData = useCallback(
    async (force = false) => {
      // Prevent concurrent fetches
      if (initializingRef.current) return;
      initializingRef.current = true;

      // Early return if unmounted
      if (!mountedRef.current) {
        initializingRef.current = false;
        return;
      }

      // Set loading state
      isLoadingRef.current = true;

      try {
        // Handle no session case
        if (!session?.access_token || !user?.id) {
          setRoutines([]);
          hasFetchedRef.current = false;
          return;
        }

        // Skip if already fetched and not forced
        if (hasFetchedRef.current && !force) {
          return;
        }

        // First fetch routines
        const routinesResult = await supabase.from("routines").select("*").eq("user_id", user.id).order("created_at", { ascending: true });

        if (!mountedRef.current) return;

        if (routinesResult.error) {
          throw routinesResult.error;
        }

        // Transform and set routines
        const transformedRoutines = routinesResult.data?.map(transformDbRoutine) || [];
        setRoutines(transformedRoutines);

        // Collect all stack IDs that are already in routines to avoid duplication
        const stackIdsInRoutines = new Set<string>();
        transformedRoutines.forEach((routine) => {
          routine.stacks.forEach((stack) => {
            stackIdsInRoutines.add(stack.id);
          });
        });

        console.log("[useSupabaseSync] Stack IDs in routines:", Array.from(stackIdsInRoutines));

        // Then fetch unscheduled stacks (only those not already in routines)
        const { data: stacks, error: stacksError } = await (supabase.from("stacks").select("*").is("routine_id", null).eq("user_id", user.id) as any);

        if (!mountedRef.current) return;

        if (stacksError) {
          throw stacksError;
        }

        // Transform and set unscheduled stacks, filtering out any that are already in routines
        const transformedUnscheduledStacks = (stacks || [])
          .filter((stack: any) => !stackIdsInRoutines.has(stack.id)) // Filter out stacks already in routines
          .map((stack: any) => {
            let actions: Action[] = [];
            if (Array.isArray(stack.actions)) {
              actions = stack.actions.map((a: any) => ({
                id: a.id || crypto.randomUUID(),
                text: a.text || "",
                completed: Boolean(a.completed),
                skipped: Boolean(a.skipped),
                streak: Number(a.streak) || 0,
              }));
            } else if (typeof stack.actions === "string") {
              try {
                const parsedActions = JSON.parse(stack.actions);
                if (Array.isArray(parsedActions)) {
                  actions = parsedActions.map((a: any) => ({
                    id: a.id || crypto.randomUUID(),
                    text: a.text || "",
                    completed: Boolean(a.completed),
                    skipped: Boolean(a.skipped),
                    streak: Number(a.streak) || 0,
                  }));
                }
              } catch (e) {
                console.error("Failed to parse actions:", e);
              }
            }

            return {
              id: stack.id,
              title: stack.title,
              isExpanded: stack.is_expanded ?? false,
              actions,
              streak: stack.streak || 0,
              scheduleType: stack.schedule_type || "none",
              scheduleDays: stack.schedule_days || [],
              interval: stack.interval,
              isSchedulable: stack.is_schedulable ?? true,
              startDate: stack.start_date,
              dayOfMonth: stack.day_of_month,
            };
          });

        console.log(
          "[useSupabaseSync] Raw unscheduled stacks from DB:",
          (stacks || []).map((s) => ({ id: s.id, title: s.title, routine_id: s.routine_id }))
        );
        console.log(
          "[useSupabaseSync] Filtered unscheduled stacks:",
          transformedUnscheduledStacks.map((s) => ({ id: s.id, title: s.title }))
        );

        setUnscheduledStacks(transformedUnscheduledStacks);
        hasFetchedRef.current = true;
      } catch (error: any) {
        console.error("Error fetching data:", error);
        if (mountedRef.current) {
          toast.error("Failed to load your data. Please refresh the page.");
          setRoutines([]);
          setUnscheduledStacks([]);
        }
      } finally {
        if (mountedRef.current) {
          isLoadingRef.current = false;
          initializingRef.current = false;
        }
      }
    },
    [user?.id, session?.access_token, setRoutines, setUnscheduledStacks, transformDbRoutine]
  );

  const saveUserData = useCallback(
    async (routinesToSave: Routine[], stacksToSave: Stack[] = unscheduledStacks) => {
      if (!session?.access_token || !user?.id || !mountedRef.current) {
        return;
      }

      try {
        // Save routines
        const routinePromises = routinesToSave.map((routine) => {
          const serializedStacks = transformStacksForDb(routine.stacks);
          return supabase.from("routines").upsert({
            id: routine.id,
            user_id: user.id,
            title: routine.title,
            description: routine.description || null,
            stacks: serializedStacks,
            days: routine.days || [],
            streak: routine.streak || 0,
            schedule_type: routine.scheduleType || "weekly",
            interval: routine.interval || null,
            start_date: routine.startDate || null,
            day_of_month: routine.dayOfMonth || null,
          });
        });

        // Save unscheduled stacks with proper action validation
        const stackPromises = stacksToSave.map((stack) => {
          const serializedActions = stack.actions.map((action) => ({
            id: action.id,
            text: action.text,
            completed: action.completed,
            skipped: action.skipped,
            streak: action.streak,
          })) as Json;
          console.log("Saving stack with actions:", {
            stackId: stack.id,
            actionCount: stack.actions.length,
            serializedActions,
          });

          return supabase.from("stacks").upsert({
            id: stack.id,
            user_id: user.id,
            title: stack.title,
            routine_id: null,
            actions: serializedActions,
            streak: stack.streak || 0,
            schedule_type: stack.scheduleType || "none",
            schedule_days: stack.scheduleDays || [],
            interval: stack.interval,
            is_schedulable: stack.isSchedulable !== false,
            start_date: stack.startDate,
            day_of_month: stack.dayOfMonth,
            created_at: new Date().toISOString(),
          });
        });

        const results = await Promise.all([...routinePromises, ...stackPromises]);

        // Check for errors
        const errors = results.filter((r) => r.error);
        if (errors.length > 0) {
          throw new Error(`Failed to save ${errors.length} items`);
        }

        return true;
      } catch (error: any) {
        console.error("Error saving data:", error);
        if (mountedRef.current) {
          toast.error("Failed to save your changes. Please try again.");
        }
        return false;
      }
    },
    [user, session, transformStacksForDb, unscheduledStacks]
  ); // Initialize data when auth state is ready
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeData = async () => {
      if (!session || !user) {
        setRoutines([]);
        hasFetchedRef.current = false;
        isLoadingRef.current = false;
        return;
      }

      // Small delay to ensure session is stable
      timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          fetchUserData(true);
        }
      }, 100);
    };

    initializeData();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user?.id, session?.access_token]);
  // Save data when routines change (debounced)
  useEffect(() => {
    // Skip save if no auth or no initial fetch
    if (!session?.access_token || !user?.id || !hasFetchedRef.current) return;

    // Skip save if no routines and we've already fetched (avoid saving empty state)
    if (!routines.length && hasFetchedRef.current) return;

    let saveTimeout: NodeJS.Timeout;

    // Debounce saves
    saveTimeout = setTimeout(() => {
      if (mountedRef.current) {
        saveUserData(routines);
      }
    }, 1000);

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [routines, user?.id, session?.access_token]);
  // Save data when unscheduled stacks change (debounced)
  useEffect(() => {
    // Skip save if no auth or no initial fetch
    if (!session?.access_token || !user?.id || !hasFetchedRef.current) return;

    let saveTimeout: NodeJS.Timeout;

    // Debounce saves
    saveTimeout = setTimeout(() => {
      if (mountedRef.current) {
        saveUserData(routines, unscheduledStacks);
      }
    }, 1000);

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [unscheduledStacks, user?.id, session?.access_token, routines]);

  return {
    fetchUserData,
    saveUserData: useCallback((data = routines) => saveUserData(data), [saveUserData, routines]),
    isLoading: isLoadingRef.current,
    hasFetched: hasFetchedRef.current,
    routines, // Return routines directly for components that need it
  };
};
