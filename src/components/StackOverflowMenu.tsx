import React, { useState } from "react";
import { MoreVertical, GripVertical, Plus, X, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRoutines } from "../context/RoutineContext";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useStackActions } from "../hooks/useStackActions";
import type { Action } from "../types/stack";

interface StackOverflowMenuProps {
  stackId: string;
  routineId: string;
  stackTitle: string;
  onDelete: () => Promise<void>;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const StackOverflowMenu: React.FC<StackOverflowMenuProps> = ({ stackId, routineId, stackTitle, onDelete }) => {
  const { renameStack, deleteStack, assignStackToRoutine, getRoutines, setStackSchedule, getStackById, updateActions, addRoutine } = useRoutines();

  const { isUpdating, updateStackActions, addActionToStack, removeActionFromStack } = useStackActions();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isEditActionsOpen, setIsEditActionsOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [newName, setNewName] = useState(stackTitle);
  const [selectedRoutineId, setSelectedRoutineId] = useState(routineId);
  const [scheduleType, setScheduleType] = useState("weekly");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [intervalValue, setIntervalValue] = useState<number>(1);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());

  // For schedule display
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // For action editing
  const stack = getStackById(routineId, stackId);
  const [actions, setActions] = useState(stack?.actions || []);
  const [newActionText, setNewActionText] = useState("");

  const routines = getRoutines();

  // Initialize selected days from stack when opening schedule section
  React.useEffect(() => {
    if (isScheduleOpen && stack) {
      setSelectedDays(stack.scheduleDays || []);
      setScheduleType(stack.scheduleType || "weekly");
      setIntervalValue(stack.interval || 1);
      if (stack.startDate) {
        setStartDate(new Date(stack.startDate));
      }
    }
  }, [isScheduleOpen, stack]);

  const handleRename = () => {
    if (newName.trim()) {
      renameStack(routineId, stackId, newName.trim());
      setIsRenameOpen(false);
      toast.success("Stack renamed successfully");
    }
  };

  const handleAssign = () => {
    if (selectedRoutineId) {
      assignStackToRoutine(routineId, stackId, selectedRoutineId);
      setIsAssignOpen(false);
      toast.success("Stack assigned to routine");
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
      setIsDeleteOpen(false);
      toast.success("Stack deleted successfully");
    } catch (error) {
      console.error("Error deleting stack:", error);
      toast.error("Failed to delete stack");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScheduleUpdate = () => {
    setStackSchedule(routineId, stackId, {
      type: scheduleType,
      days: selectedDays,
      interval: intervalValue,
      isSchedulable: scheduleType !== "none",
      startDate: startDate.toISOString(),
    });
    setIsScheduleOpen(false);
    toast.success("Stack schedule updated");
  };

  const handleActionsUpdate = () => {
    updateActions(routineId, stackId, actions);
    setIsEditActionsOpen(false);
    toast.success("Stack actions updated");
  };

  const handleAddAction = async () => {
    if (!newActionText.trim() || !stack) return;

    try {
      setIsActionLoading(true);
      const newAction: Omit<Action, "id"> = {
        text: newActionText.trim(),
        completed: false,
        skipped: false,
        streak: 0,
      };

      const updatedActions = await addActionToStack(stack, newAction);
      setActions(updatedActions);
      setNewActionText("");
      toast.success("Action added successfully");
    } catch (error) {
      console.error("Error adding action:", error);
      toast.error("Failed to add action");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveAction = async (actionId: string) => {
    if (!stack) return;

    try {
      setIsActionLoading(true);
      const updatedActions = await removeActionFromStack(stack, actionId);
      setActions(updatedActions);
      toast.success("Action removed successfully");
    } catch (error) {
      console.error("Error removing action:", error);
      toast.error("Failed to remove action");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleCreateRoutine = () => {
    if (!newRoutineName.trim()) {
      toast.error("Please enter a routine name");
      return;
    }

    // Create the new routine
    const routineId = `routine-${uuidv4()}`;
    const newRoutine = {
      id: routineId,
      title: newRoutineName.trim(),
      stacks: [],
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      streak: 0,
    };

    addRoutine(newRoutine);

    // Set it as selected
    setSelectedRoutineId(routineId);

    // Reset state
    setIsCreatingRoutine(false);
    setNewRoutineName("");

    toast.success(`New routine "${newRoutineName}" created`);
  };

  const getScheduleDescription = () => {
    if (scheduleType === "none") {
      return "This stack will only appear in the Library";
    } else if (scheduleType === "weekly") {
      return selectedDays.length > 0 ? `Will show on: ${selectedDays.map((d) => d.slice(0, 3)).join(", ")}` : "No days selected";
    } else if (scheduleType === "interval") {
      return `Every ${intervalValue} day${intervalValue !== 1 ? "s" : ""} starting ${startDate.toLocaleDateString()}`;
    } else if (scheduleType === "oneTime") {
      return `Only on ${startDate.toLocaleDateString()}`;
    } else if (scheduleType === "biweekly") {
      return `Every ${intervalValue} week${intervalValue !== 1 ? "s" : ""} on ${selectedDays.map((d) => d.slice(0, 3)).join(", ")}`;
    }
    return "";
  };

  const resetState = () => {
    const currentStack = getStackById(routineId, stackId);
    setNewName(stackTitle);
    setSelectedRoutineId(routineId);
    setScheduleType("weekly");
    setActions(currentStack?.actions || []);
    setNewActionText("");
    setIsRenameOpen(false);
    setIsEditActionsOpen(false);
    setIsAssignOpen(false);
    setIsScheduleOpen(false);
    setIsDeleteOpen(false);
    setIsCreatingRoutine(false);
    setNewRoutineName("");
    setSelectedDays(currentStack?.scheduleDays || []);
    setIntervalValue(currentStack?.interval || 1);
    if (currentStack?.startDate) {
      setStartDate(new Date(currentStack.startDate));
    } else {
      setStartDate(new Date());
    }
  };

  return (
    <Sheet onOpenChange={resetState}>
      <SheetTrigger asChild>
        <button
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-40 hover:opacity-100"
          onClick={(e) => e.stopPropagation()} // Prevent stack expansion when clicking the menu
          aria-label="Stack options">
          <MoreVertical className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-center">Stack Options</SheetTitle>
        </SheetHeader>

        <div className="pt-6 space-y-4 pb-20">
          <p className="text-sm text-gray-500 text-center mb-4">"{stackTitle}"</p>

          <div className="flex flex-col gap-3">
            {/* Rename Stack Option */}
            {isRenameOpen ? (
              <div className="space-y-4">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New stack name" className="w-full" />
                <div className="flex justify-between gap-2">
                  <Button variant="outline" className="w-1/2" onClick={() => setIsRenameOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="w-1/2 bg-stacks-purple hover:bg-stacks-purple/90" onClick={handleRename}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsRenameOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Rename Stack
              </Button>
            )}

            {/* Edit Actions Option */}
            <Collapsible open={isEditActionsOpen} onOpenChange={setIsEditActionsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                  </svg>
                  Edit Actions
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-4">
                {/* Input for adding new actions */}
                <div className="flex items-center gap-2">
                  <Input
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    placeholder="Add a new action"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newActionText.trim()) {
                        handleAddAction();
                      }
                    }}
                  />
                  <Button variant="outline" onClick={handleAddAction} disabled={!newActionText.trim() || isActionLoading}>
                    {isActionLoading ? <span className="animate-spin">⊚</span> : <Plus size={16} />}
                  </Button>
                </div>

                {/* List of actions */}
                {actions.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No actions yet. Add one above.</p>
                ) : (
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {actions.map((action, index) => (
                      <div key={action.id} className="flex items-center gap-2 p-3 border rounded-lg border-gray-200 bg-white">
                        <div className="cursor-move">
                          <GripVertical size={16} className="text-gray-400" />
                        </div>
                        <Input
                          value={action.text}
                          onChange={(e) => {
                            const newActions = [...actions];
                            newActions[index].text = e.target.value;
                            setActions(newActions);
                          }}
                          className="flex-1 border-0 focus-visible:ring-0 p-0 h-auto"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500" onClick={() => handleRemoveAction(action.id)} disabled={isActionLoading}>
                          {isActionLoading ? <span className="animate-spin">⊚</span> : <X size={16} />}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between gap-2 pt-2">
                  <Button variant="outline" className="w-1/2" onClick={() => setIsEditActionsOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="w-1/2 bg-stacks-purple hover:bg-stacks-purple/90" onClick={handleActionsUpdate}>
                    Save
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Assign to Routine Option */}
            <Collapsible open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
                  </svg>
                  Assign to Routine
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-4">
                {isCreatingRoutine ? (
                  <div className="space-y-4">
                    <Input value={newRoutineName} onChange={(e) => setNewRoutineName(e.target.value)} placeholder="New routine name" className="w-full" />
                    <div className="flex justify-between gap-2">
                      <Button variant="outline" className="w-1/2" onClick={() => setIsCreatingRoutine(false)}>
                        Cancel
                      </Button>
                      <Button className="w-1/2 bg-stacks-purple hover:bg-stacks-purple/90" onClick={handleCreateRoutine} disabled={!newRoutineName.trim()}>
                        Create Routine
                      </Button>
                    </div>
                  </div>
                ) : (
                  <RadioGroup value={selectedRoutineId} onValueChange={setSelectedRoutineId} className="space-y-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Unassigned (Library only)</Label>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="library" id="library" />
                        <Label htmlFor="library">Library</Label>
                      </div>
                    </div>

                    <Label className="text-sm font-medium block mt-4">Routines</Label>
                    <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                      {routines.map((routine) => (
                        <div key={routine.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={routine.id} id={routine.id} />
                          <Label htmlFor={routine.id}>{routine.title}</Label>
                        </div>
                      ))}
                    </div>

                    <Button variant="ghost" className="w-full mt-2 justify-center text-stacks-purple border border-dashed border-stacks-purple/40" onClick={() => setIsCreatingRoutine(true)}>
                      <Plus size={16} className="mr-2" />
                      Create New Routine
                    </Button>

                    <div className="flex justify-between gap-2 pt-2 mt-4">
                      <Button variant="outline" className="w-1/2" onClick={() => setIsAssignOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="w-1/2 bg-stacks-purple hover:bg-stacks-purple/90" onClick={handleAssign} disabled={!selectedRoutineId}>
                        Save
                      </Button>
                    </div>
                  </RadioGroup>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Set Schedule Option */}
            <Collapsible open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Stack
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-4">
                <div className="space-y-6">
                  {/* Schedule Types - Now as segmented buttons */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Schedule Type</Label>
                    <ToggleGroup
                      type="single"
                      value={scheduleType}
                      onValueChange={(value) => {
                        if (value) setScheduleType(value);
                      }}
                      className="flex flex-wrap justify-center gap-1">
                      <ToggleGroupItem value="weekly" className="data-[state=on]:bg-stacks-purple data-[state=on]:text-white">
                        Weekly
                      </ToggleGroupItem>
                      <ToggleGroupItem value="interval" className="data-[state=on]:bg-stacks-purple data-[state=on]:text-white">
                        Every X Days
                      </ToggleGroupItem>
                      <ToggleGroupItem value="oneTime" className="data-[state=on]:bg-stacks-purple data-[state=on]:text-white">
                        One Time
                      </ToggleGroupItem>
                      <ToggleGroupItem value="none" className="data-[state=on]:bg-stacks-purple data-[state=on]:text-white">
                        Manual Only
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* Weekly schedule options */}
                  {scheduleType === "weekly" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select Days</Label>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {DAYS_OF_WEEK.map((day) => (
                          <Badge key={day} variant={selectedDays.includes(day) ? "default" : "outline"} className={`cursor-pointer py-1 px-3 ${selectedDays.includes(day) ? "bg-stacks-purple hover:bg-stacks-purple/90" : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"}`} onClick={() => handleToggleDay(day)}>
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interval schedule options */}
                  {scheduleType === "interval" && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Interval</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Label>Every</Label>
                          <Input type="number" min={1} max={365} value={intervalValue} onChange={(e) => setIntervalValue(parseInt(e.target.value) || 1)} className="w-20" />
                          <Label>day{intervalValue !== 1 ? "s" : ""}</Label>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Starting Date</Label>
                        <Input
                          type="date"
                          value={startDate.toISOString().split("T")[0]}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            if (!isNaN(date.getTime())) {
                              setStartDate(date);
                            }
                          }}
                          className="w-full mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* One-time schedule options */}
                  {scheduleType === "oneTime" && (
                    <div>
                      <Label className="text-sm font-medium">Date</Label>
                      <Input
                        type="date"
                        value={startDate.toISOString().split("T")[0]}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          if (!isNaN(date.getTime())) {
                            setStartDate(date);
                          }
                        }}
                        className="w-full mt-1"
                      />
                    </div>
                  )}

                  {/* Manual only info */}
                  {scheduleType === "none" && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-500 dark:text-gray-400 flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Manual stacks only appear when triggered — not on the Today screen.</p>
                    </div>
                  )}

                  {/* Schedule preview */}
                  {scheduleType !== "none" && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500 mr-2 flex-shrink-0">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm">{getScheduleDescription()}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between gap-2 pt-2">
                    <Button variant="outline" className="w-1/2" onClick={() => setIsScheduleOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="w-1/2 bg-stacks-purple hover:bg-stacks-purple/90" onClick={handleScheduleUpdate}>
                      Save Schedule
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Delete Stack Option */}
            {isDeleteOpen ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Are you sure you want to delete this stack? This action cannot be undone.</p>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" className="w-1/2" onClick={() => setIsDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" className="w-1/2" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⊚</span>
                        Deleting...
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/5" onClick={() => setIsDeleteOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Delete Stack
              </Button>
            )}
          </div>
        </div>

        {/* Sticky save button at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <Button variant="outline" onClick={() => resetState()} className="px-8">
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { StackOverflowMenu };
