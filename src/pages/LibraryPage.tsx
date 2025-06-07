/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useRef, useEffect } from "react";
import { useRoutines } from "../context/RoutineContext";
import { useSupabaseSync } from "../hooks/useSupabaseSync";
import TabBar from "../components/TabBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, X, Calendar, ArrowRight, Edit2, Settings, ChevronDown, ChevronRight, Check, ArrowUp, ArrowDown, Flame, List, LayoutGrid, Clock, Sun, Moon } from "lucide-react";
import RoutineEditorSheet from "../components/RoutineEditorSheet";
import { StackOverflowMenu } from "../components/StackOverflowMenu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import QuickStackFullscreen from "../components/QuickStackFullscreen";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CreateNewStackSheet from "../components/CreateNewStackSheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RoutineEditor from "../components/RoutineEditor";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const VERSION = "";

const LibraryPage = () => {
  const { user } = useAuth();
  const { routines, getUnscheduledStacks, saveUnscheduledStack, isStackCompleted, getStackProgress, isRoutineCompleted, isStackScheduledForToday, setRoutines, setUnscheduledStacks, updateActions, renameStack, renameRoutine, deleteStack, deleteRoutine, updateRoutineSchedule } = useRoutines();

  const { isLoading, hasFetched, fetchUserData } = useSupabaseSync();

  // Ensure data is loaded when component mounts
  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchUserData(true);
    }
  }, [hasFetched, isLoading, fetchUserData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(new Set());
  const [expandedStacks, setExpandedStacks] = useState<Set<string>>(new Set());
  const unscheduledStacks = getUnscheduledStacks();

  const [isQuickStackOpen, setIsQuickStackOpen] = useState(false);
  const [isQuickStackFullscreen, setIsQuickStackFullscreen] = useState(false);
  const [quickStackName, setQuickStackName] = useState("");
  const [quickStackActions, setQuickStackActions] = useState<{ id: string; text: string; completed: boolean; skipped: boolean; streak: number }[]>([]);
  const [newAction, setNewAction] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [isCreateNewStackOpen, setIsCreateNewStackOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<string | null>(null);
  const [isCreateNewRoutineOpen, setIsCreateNewRoutineOpen] = useState(false);
  const [showAddStacksPrompt, setShowAddStacksPrompt] = useState(false);
  const [newlyCreatedRoutineId, setNewlyCreatedRoutineId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const [editRoutineId, setEditRoutineId] = useState<string | null>(null);
  const [editRoutineName, setEditRoutineName] = useState("");
  const [editRoutineStacks, setEditRoutineStacks] = useState<any[]>([]);
  const [editStackKey, setEditStackKey] = useState<string | null>(null);
  const [editStackName, setEditStackName] = useState("");
  const [editStackActions, setEditStackActions] = useState<any[]>([]);

  const toggleRoutineExpansion = (routineId: string) => {
    setExpandedRoutines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routineId)) {
        newSet.delete(routineId);
      } else {
        newSet.add(routineId);
      }
      return newSet;
    });
  };

  const toggleStackExpansion = (stackId: string, routineId: string) => {
    const stackKey = `${routineId}-${stackId}`;
    setExpandedStacks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stackKey)) {
        newSet.delete(stackKey);
      } else {
        newSet.add(stackKey);
      }
      return newSet;
    });
  };

  const getAllStacks = () => {
    const allStacks = [];

    unscheduledStacks.forEach((stack) => {
      allStacks.push({
        ...stack,
        routineId: "library",
        routineName: "Unscheduled",
      });
    });

    routines.forEach((routine) => {
      routine.stacks.forEach((stack) => {
        allStacks.push({
          ...stack,
          routineId: routine.id,
          routineName: routine.title,
        });
      });
    });

    return allStacks;
  };

  const allStacks = getAllStacks();

  const filteredRoutines = searchQuery ? routines.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase())) : routines;

  const filteredStacks = searchQuery ? allStacks.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.actions.some((a) => a.text.toLowerCase().includes(searchQuery.toLowerCase())) || s.routineName.toLowerCase().includes(searchQuery.toLowerCase())) : allStacks;

  const openQuickStack = () => {
    setIsQuickStackOpen(true);
    setQuickStackActions([]);
    setQuickStackName("");
    setNewAction("");

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const addQuickAction = () => {
    if (newAction.trim() !== "" && quickStackActions.length < 9) {
      setQuickStackActions([
        ...quickStackActions,
        {
          id: crypto.randomUUID(),
          text: newAction.trim(),
          completed: false,
          skipped: false,
          streak: 0,
        },
      ]);
      setNewAction("");

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  };

  const handleStartQuickStack = () => {
    setIsQuickStackOpen(false);
    setIsQuickStackFullscreen(true);
  };

  const handleSaveQuickStack = async (name: string) => {
    const newStack = {
      id: crypto.randomUUID(),
      title: name || "Quick Stack",
      isExpanded: true,
      streak: 0,
      isSchedulable: false,
      actions: quickStackActions,
    };

    try {
      // Save to Supabase
      const { error } = await supabase.from("stacks").upsert({
        id: newStack.id,
        user_id: user?.id,
        title: newStack.title,
        routine_id: null,
        actions: JSON.stringify(newStack.actions),
        streak: newStack.streak,
        is_schedulable: newStack.isSchedulable,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Save to local state
      saveUnscheduledStack(newStack);
      setIsQuickStackFullscreen(false);
      toast.success("Quick stack saved!");
    } catch (error) {
      console.error("Error saving quick stack:", error);
      toast.error("Failed to save quick stack");
    }
  };

  const handleCloseQuickStack = () => {
    setIsQuickStackOpen(false);
    setIsQuickStackFullscreen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addQuickAction();
    }
  };

  const addStackToToday = (stack: any) => {
    const { addStackToRoutine } = useRoutines();

    // Find or create the Today routine
    const todayRoutine = routines.find((r) => r.id === "today-routine");

    if (todayRoutine) {
      // Add to existing Today routine
      addStackToRoutine("today-routine", {
        ...stack,
        id: crypto.randomUUID(),
        isSchedulable: true,
        scheduleType: "none",
        isOneTime: true,
      });
    } else {
      // Create Today routine if it doesn't exist
      const { addRoutine } = useRoutines();
      const newTodayRoutine = {
        id: "today-routine",
        title: "Today",
        description: "One-time stacks for today",
        streak: 0,
        days: [],
        stacks: [],
      };

      addRoutine(newTodayRoutine);

      // Then add the stack
      setTimeout(() => {
        addStackToRoutine("today-routine", {
          ...stack,
          id: crypto.randomUUID(),
          isSchedulable: true,
          scheduleType: "none",
          isOneTime: true,
        });
      }, 100);
    }

    toast.success(`"${stack.title}" added to Today`);
  };

  const openCreateNewStack = () => {
    setIsCreateNewStackOpen(true);
  };

  const openCreateNewRoutine = () => {
    setIsCreateNewRoutineOpen(true);
  };

  const handleRoutineCreated = (routineId: string) => {
    setIsCreateNewRoutineOpen(false);
    setNewlyCreatedRoutineId(routineId);
    setShowAddStacksPrompt(true);

    setTimeout(() => {
      toast.success("Routine created! Add some stacks to get started.");
    }, 300);
  };

  const handleAddStacksToNewRoutine = () => {
    setShowAddStacksPrompt(false);
    if (newlyCreatedRoutineId) {
      setIsCreateNewStackOpen(true);
    }
  };

  const handleSkipAddingStacks = () => {
    setShowAddStacksPrompt(false);
    setNewlyCreatedRoutineId(null);
  };

  const handleStackCreatedForNewRoutine = () => {
    setIsCreateNewStackOpen(false);
    setShowAddStacksPrompt(false);
    setNewlyCreatedRoutineId(null);
  };

  const handleRoutineEditorClose = () => {
    setRoutineToEdit(null);
  };

  // Save routine edits to Supabase
  const saveRoutineEdits = async (routineId: string) => {
    try {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return;

      const { error } = await supabase.from("routines").upsert({
        id: routine.id,
        user_id: user?.id,
        title: editRoutineName,
        description: routine.description,
        days: routine.days,
        streak: routine.streak,
        schedule_type: routine.scheduleType,
        interval: routine.interval,
        start_date: routine.startDate,
        day_of_month: routine.dayOfMonth,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update stacks order if changed

      renameRoutine(routineId, editRoutineName);
      setEditRoutineId(null);
      toast.success("Routine updated!");
    } catch (error) {
      console.error("Error updating routine:", error);
      toast.error("Failed to update routine");
    }
  };
  // Save stack edits to Supabase
  const saveStackEdits = async (stackKey: string) => {
    try {
      const [routineId, stackId] = stackKey.split("-");
      const stack = routines.flatMap((r) => r.stacks).find((s) => s.id === stackId) || unscheduledStacks.find((s) => s.id === stackId);

      if (!stack) return;

      const { error } = await supabase.from("stacks").upsert({
        id: stack.id,
        user_id: user?.id,
        title: editStackName,
        actions: JSON.stringify(editStackActions),
        routine_id: routineId === "library" ? null : routineId,
        streak: stack.streak,
        schedule_type: stack.scheduleType,
        schedule_days: stack.scheduleDays,
        interval: stack.interval,
        is_schedulable: stack.isSchedulable,
        start_date: stack.startDate,
        day_of_month: stack.dayOfMonth,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update local state
      if (routineId === "library") {
        setUnscheduledStacks((prev) => prev.map((s) => (s.id === stackId ? { ...s, title: editStackName, actions: editStackActions } : s)));
      } else {
        setRoutines((prev) =>
          prev.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  stacks: r.stacks.map((s) => (s.id === stackId ? { ...s, title: editStackName, actions: editStackActions } : s)),
                }
              : r
          )
        );
      }

      setEditStackKey(null);
      toast.success("Stack updated!");
    } catch (error) {
      console.error("Error updating stack:", error);
      toast.error("Failed to update stack");
    }
  };

  // Delete routine from Supabase
  const handleDeleteRoutine = async (routineId: string) => {
    try {
      // First delete all stacks in this routine
      const { error: stacksError } = await supabase.from("stacks").delete().eq("routine_id", routineId);

      if (stacksError) throw stacksError;

      // Then delete the routine
      const { error: routineError } = await supabase.from("routines").delete().eq("id", routineId);

      if (routineError) throw routineError;

      // Update local state
      deleteRoutine(routineId);
      toast.success("Routine deleted!");
    } catch (error) {
      console.error("Error deleting routine:", error);
      toast.error("Failed to delete routine");
    }
  };

  // Delete stack from Supabase with optimistic updates

  // Ensure data is loaded
  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchUserData(true);
    }
  }, [hasFetched, isLoading, fetchUserData]);

  // Full-page loading state
  if (isLoading && !routines.length) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-lg w-48" />
          <div className="h-12 bg-muted/50 rounded-lg" />
          <div className="space-y-3 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Library</h1>
          <span className="text-xs text-gray-400">{VERSION}</span>
        </div>
        <p className="text-gray-500 text-sm">Manage your routines and stacks</p>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Search routines and stacks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-background border-border focus-visible:ring-stacks-purple" />
          {searchQuery && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery("")} aria-label="Clear search">
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-12 bg-stacks-purple/5 border-stacks-purple/20 hover:bg-stacks-purple/10 hover:border-stacks-purple/30 text-stacks-purple hover:text-stacks-purple transition-all flex items-center justify-center gap-2" onClick={openCreateNewStack}>
            <Plus className="h-4 w-4" />
            <span>New Stack</span>
          </Button>
          <Button variant="outline" className="flex-1 h-12 bg-stacks-purple/5 border-stacks-purple/20 hover:bg-stacks-purple/10 hover:border-stacks-purple/30 text-stacks-purple hover:text-stacks-purple transition-all flex items-center justify-center gap-2" onClick={openCreateNewRoutine}>
            <Plus className="h-4 w-4" />
            <span>New Routine</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="routines" className="w-full px-4">
        <TabsList className="w-full mb-4 grid grid-cols-2 bg-muted h-10">
          <TabsTrigger value="routines" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-stacks-purple h-9">
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span>Routines</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="stacks" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-stacks-purple h-9">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Stacks</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Routines Tab */}
 <TabsContent value="routines" className="space-y-4">
  {filteredRoutines.length > 0 ? (
    <div className="space-y-4">
      {filteredRoutines
        .filter((r) => r.id !== "today-routine")
        .map((routine) => {
          const routineIsCompleted = isRoutineCompleted(routine);
          const showRoutineStreak = routine.streak > 0;
          const isExpanded = expandedRoutines.has(routine.id);
          const isEditing = editRoutineId === routine.id;

          return (
            <div key={routine.id} className={`bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all hover:shadow-md ${isEditing ? "ring-2 ring-stacks-purple" : ""}`}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleRoutineExpansion(routine.id)}>
                <div className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <CollapsibleTrigger className="flex-1 text-left">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">{isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}</div>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            {isEditing ? (
                              <Input value={editRoutineName} onChange={(e) => setEditRoutineName(e.target.value)} className="font-semibold text-gray-900 mr-2" />
                            ) : (
                              <>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{routine.title}</h3>
                                {showRoutineStreak && (
                                  <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200">
                                    <Flame className="h-3 w-3 mr-1" />
                                    {routine.streak}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                          {routine.description && <p className="text-sm text-gray-500 mb-2">{routine.description}</p>}
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <span key={day} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${routine.days.includes(day) ? (today.startsWith(day) ? "bg-stacks-purple text-white" : "bg-stacks-purple/10 dark:bg-stacks-purple/20 text-stacks-purple") : "bg-muted text-muted-foreground"}`}>
                                  {day.charAt(0)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => {
                          setEditRoutineId(routine.id);
                          setEditRoutineName(routine.title);
                          setEditRoutineStacks([...routine.stacks]);
                        }}
                        disabled={isEditing}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <RoutineEditorSheet routine={routine} />
                    </div>
                  </div>
                  {isEditing && (
                    <div className="mt-3 flex flex-col gap-2">
                      {editRoutineStacks.length > 1 && (
                        <div className="space-y-2">
                          {editRoutineStacks.map((stack, idx) => (
                            <div key={stack.id} className="flex items-center gap-2 bg-muted rounded-lg p-2">
                              <span className="flex-1 text-sm text-foreground dark:text-white">{stack.title}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={idx === 0}
                                onClick={() => {
                                  const newStacks = [...editRoutineStacks];
                                  [newStacks[idx - 1], newStacks[idx]] = [newStacks[idx], newStacks[idx - 1]];
                                  setEditRoutineStacks(newStacks);
                                }}>
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={idx === editRoutineStacks.length - 1}
                                onClick={() => {
                                  const newStacks = [...editRoutineStacks];
                                  [newStacks[idx], newStacks[idx + 1]] = [newStacks[idx + 1], newStacks[idx]];
                                  setEditRoutineStacks(newStacks);
                                }}>
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => saveRoutineEdits(routine.id)} className="flex-1 bg-green-500 hover:bg-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            if (editRoutineName !== routine.title || JSON.stringify(editRoutineStacks) !== JSON.stringify(routine.stacks)) {
                              if (window.confirm("Discard unsaved changes?")) {
                                setEditRoutineId(null);
                              }
                            } else {
                              setEditRoutineId(null);
                            }
                          }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <CollapsibleContent>
                  {routine.stacks.length > 0 && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                      {routine.stacks.map((stack) => {
                        const stackIsCompleted = isStackCompleted(stack);
                        const isScheduledToday = isStackScheduledForToday(stack);
                        const showStackStreak = stack.streak > 0;
                        const stackKey = `${routine.id}-${stack.id}`;
                        const isStackExpanded = expandedStacks.has(stackKey);

                        return (
                          <div key={stack.id} className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border hover:bg-muted/80 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 flex-shrink-0">
                                  <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="#7E69AB" strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - getStackProgress(stack)} strokeLinecap="round" transform="rotate(-90 18 18)" />
                                  </svg>
                                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-stacks-purple">
                                    {stack.actions.filter((a) => a.completed).length}/{stack.actions.length}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{stack.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">
                                      {stack.actions.length} action{stack.actions.length !== 1 ? "s" : ""}
                                    </span>
                                    {isScheduledToday && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30">
                                        Today
                                      </Badge>
                                    )}
                                    {showStackStreak && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                                        <Flame className="h-3 w-3 mr-1" />
                                        {stack.streak}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <StackOverflowMenu
                                  stackId={stack.id}
                                  routineId={routine.id}
                                  stackTitle={stack.title}
                                  onDelete={async () => {
                                    if (window.confirm(`Are you sure you want to delete "${stack.title}"?`)) {
                                      await deleteStack(routine.id, stack.id);
                                    }
                                  }}
                                />
                                <button onClick={() => toggleStackExpansion(stack.id, routine.id)}>
                                  {isStackExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {isStackExpanded && (
                              <div className="pl-4 pr-2 space-y-2">
                                {stack.actions.map((action, index) => (
                                  <div key={action.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-500 font-medium w-6">{index + 1}.</span>
                                      <span className="text-sm text-gray-700">{action.text}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {action.completed && (
                                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                          <Check className="w-3 h-3 text-white" />
                                        </div>
                                      )}
                                      {action.skipped && (
                                        <div className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center">
                                          <X className="w-3 h-3 text-white" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
    </div>
  ) : (
    <div className="py-16 text-center">
      <div className="mx-auto w-16 h-16 bg-stacks-purple/10 rounded-full flex items-center justify-center mb-4">
        <List className="h-6 w-6 text-stacks-purple" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No routines found</h3>
      <p className="text-gray-500 mb-6">Create your first routine to get started</p>
      <Button onClick={openCreateNewRoutine} className="bg-stacks-purple hover:bg-stacks-purple/90">
        <Plus className="h-4 w-4 mr-2" />
        Create Routine
      </Button>
    </div>
  )}
</TabsContent>

        {/* Stacks Tab */}
        <TabsContent value="stacks" className="space-y-4">
          {filteredStacks.length > 0 ? (
            <div className="space-y-4">
              {filteredStacks.map((stack) => {
                const stackKey = `${stack.routineId}-${stack.id}`;
                const isExpanded = expandedStacks.has(stackKey);
                const isEditing = editStackKey === stackKey;

                return (
                  <div key={stackKey} className={`bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all hover:shadow-md ${isEditing ? "ring-2 ring-stacks-purple" : ""}`}>
                    <Collapsible open={isExpanded} onOpenChange={() => toggleStackExpansion(stack.id, stack.routineId)}>
                      <div className="p-4">
                        <div className="flex justify-between items-center gap-3">
                          <CollapsibleTrigger className="flex-1 text-left">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">{isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}</div>
                              <div className="bg-stacks-purple text-white text-sm font-medium rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">{stack.actions.length}</div>
                              <div>
                                {isEditing ? <Input value={editStackName} onChange={(e) => setEditStackName(e.target.value)} className="font-semibold" /> : <h3 className="font-semibold text-foreground dark:text-white">{stack.title}</h3>}
                                <Badge variant="outline" className="text-xs mt-1 bg-muted text-muted-foreground border-border">
                                  {stack.routineName}
                                </Badge>
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <div className="flex items-center gap-2">
                            {/*                         <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                              onClick={() => {
                                setEditStackKey(stackKey);
                                setEditStackName(stack.title);
                                setEditStackActions([...stack.actions]);
                              }}
                              disabled={isEditing}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
*/}
                            <StackOverflowMenu
                              stackId={stack.id}
                              routineId={stack.routineId}
                              stackTitle={stack.title}
                              onDelete={async () => {
                                if (window.confirm(`Are you sure you want to delete "${stack.title}"?`)) {
                                  await deleteStack(stack.routineId, stack.id);
                                }
                              }}
                            />
                          </div>
                        </div>

                        {isEditing && (
                          <div className="mt-3 space-y-3">
                            {/*  <div className="space-y-2">
                              {editStackActions.map((action, idx) => (
                                <div key={action.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                                  <span className="flex-1 text-sm text-gray-900">{action.text}</span>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      aria-label="Move up"
                                      disabled={idx === 0}
                                      onClick={() => {
                                        const newActions = [...editStackActions];
                                        [newActions[idx - 1], newActions[idx]] = [newActions[idx], newActions[idx - 1]];
                                        setEditStackActions(newActions);
                                      }}>
                                      <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      aria-label="Move down"
                                      disabled={idx === editStackActions.length - 1}
                                      onClick={() => {
                                        const newActions = [...editStackActions];
                                        [newActions[idx], newActions[idx + 1]] = [newActions[idx + 1], newActions[idx]];
                                        setEditStackActions(newActions);
                                      }}>
                                      <ArrowDown className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      aria-label={`Remove action ${action.text}`}
                                      className="text-red-500 hover:bg-red-50"
                                      onClick={() => {
                                        const newActions = [...editStackActions];
                                        newActions.splice(idx, 1);
                                        setEditStackActions(newActions);
                                      }}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Add new action..."
                                value={newAction}
                                onChange={(e) => setNewAction(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && newAction.trim()) {
                                    setEditStackActions([
                                      ...editStackActions,
                                      {
                                        id: crypto.randomUUID(),
                                        text: newAction.trim(),
                                        completed: false,
                                        skipped: false,
                                        streak: 0,
                                      },
                                    ]);
                                    setNewAction("");
                                  }
                                }}
                                className="flex-1"
                                ref={inputRef}
                              />
                              <Button
                                onClick={() => {
                                  if (newAction.trim()) {
                                    setEditStackActions([
                                      ...editStackActions,
                                      {
                                        id: crypto.randomUUID(),
                                        text: newAction.trim(),
                                        completed: false,
                                        skipped: false,
                                        streak: 0,
                                      },
                                    ]);
                                    setNewAction("");
                                  }
                                }}
                                disabled={!newAction.trim()}
                                size="icon"
                                className="rounded-full">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>*/}

                            <div className="flex gap-2 mt-3">
                              <Button onClick={() => saveStackEdits(stackKey)} className="flex-1 bg-green-500 hover:bg-green-600">
                                <Check className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  if (editStackName !== stack.title || JSON.stringify(editStackActions) !== JSON.stringify(stack.actions)) {
                                    if (window.confirm("Discard unsaved changes?")) {
                                      setEditStackKey(null);
                                    }
                                  } else {
                                    setEditStackKey(null);
                                  }
                                }}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                          {stack.actions.map((action, index) => (
                            <div key={action.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 font-medium w-6">{index + 1}.</span>
                                <span className="text-sm text-gray-700">{action.text}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {action.completed && (
                                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                {action.skipped && (
                                  <div className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center">
                                    <X className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto w-16 h-16 bg-stacks-purple/10 rounded-full flex items-center justify-center mb-4">
                <LayoutGrid className="h-6 w-6 text-stacks-purple" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No stacks found</h3>
              <p className="text-gray-500 mb-6">Create new stacks or save Quick Stacks here</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={openQuickStack} className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Quick Stack
                </Button>
                <Button onClick={openCreateNewStack} className="flex-1 bg-stacks-purple hover:bg-stacks-purple/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Stack
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stack Sheet */}
      <Sheet open={isQuickStackOpen} onOpenChange={setIsQuickStackOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-stacks-purple text-2xl">Quick Stack</SheetTitle>
          </SheetHeader>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Input ref={inputRef} placeholder="Add an action (max 9)" value={newAction} onChange={(e) => setNewAction(e.target.value)} onKeyDown={handleKeyDown} disabled={quickStackActions.length >= 9} className="flex-1" />
              <Button onClick={addQuickAction} variant="outline" disabled={!newAction.trim() || quickStackActions.length >= 9}>
                Add
              </Button>
            </div>

            {quickStackActions.length > 0 && <div className="text-xs text-gray-500 mb-2">{quickStackActions.length}/9 actions added</div>}

            {quickStackActions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-stacks-purple/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-stacks-purple" />
                </div>
                <h3 className="text-gray-700 mb-1">Add 1-9 actions</h3>
                <p className="text-gray-500">Create a quick stack to complete right away</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto mb-4">
                {quickStackActions.map((action, index) => (
                  <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{index + 1}.</span>
                      <span>{action.text}</span>
                    </div>
                    <button
                      onClick={() => {
                        const newActions = [...quickStackActions];
                        newActions.splice(index, 1);
                        setQuickStackActions(newActions);
                      }}
                      className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {quickStackActions.length > 0 && (
              <Button onClick={handleStartQuickStack} className="w-full bg-stacks-purple hover:bg-stacks-purple/90 mt-4">
                Start Stack
              </Button>
            )}
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={handleCloseQuickStack} className="w-full">
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {isQuickStackFullscreen && <QuickStackFullscreen actions={quickStackActions} stackName={quickStackName} onClose={handleCloseQuickStack} onSave={handleSaveQuickStack} onUpdate={setQuickStackActions} />}

      {/* Create New Stack Sheet */}
      <CreateNewStackSheet isOpen={isCreateNewStackOpen} onClose={() => setIsCreateNewStackOpen(false)} onRoutineCreated={newlyCreatedRoutineId ? handleStackCreatedForNewRoutine : handleRoutineCreated} routineId={newlyCreatedRoutineId || undefined} />

      {/* Add Stacks Prompt Sheet */}
      <Sheet open={showAddStacksPrompt} onOpenChange={setShowAddStacksPrompt}>
        <SheetContent side="bottom" className="h-[40vh] rounded-t-2xl">
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-stacks-purple/10 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-stacks-purple" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Add Stacks to Your Routine</h3>
            <p className="text-gray-500 mb-6">Great! Your routine is ready. Add some stacks to make it complete.</p>
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={handleSkipAddingStacks} className="flex-1">
                Skip for Now
              </Button>
              <Button onClick={handleAddStacksToNewRoutine} className="flex-1 bg-stacks-purple hover:bg-stacks-purple/90">
                Add Stacks
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* New Routine Creation Sheet */}
      <Sheet open={isCreateNewRoutineOpen}>
        <SheetContent className="fixed inset-0 h-screen w-screen max-w-full rounded-none flex flex-col">
          <SheetHeader className="flex flex-row items-center justify-between p-4 border-b">
            <SheetTitle className="text-stacks-purple text-2xl">Create New Routine</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto">
            <RoutineEditor onClose={() => setIsCreateNewRoutineOpen(false)} onRoutineCreated={handleRoutineCreated} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Floating Action Button */}
      <button onClick={openQuickStack} className="fixed bottom-24 right-6 bg-stacks-purple text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-stacks-purple/90 hover:shadow-xl transition-all">
        <Plus className="h-6 w-6" />
      </button>

      <TabBar activeTab="library" onQuickStackClick={openQuickStack} />
    </div>
  );
};

export default LibraryPage;
