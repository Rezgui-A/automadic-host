import React, { useRef, useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, ArrowUp, Move, Plus } from 'lucide-react';
import { useRoutines, ScheduleOptions } from '../context/RoutineContext';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ScheduleSelector from './ScheduleSelector';

interface CreateNewStackSheetProps {
  isOpen?: boolean; 
  onClose: () => void;
  routineId?: string; // Optional: if provided, we'll add the stack to this routine
  onRoutineCreated?: (routineId: string) => void; // Callback for when a new routine is created
}

type FormValues = {
  title: string;
};

const CreateNewStackSheet: React.FC<CreateNewStackSheetProps> = ({
  isOpen = false,
  onClose,
  routineId,
  onRoutineCreated
}) => {
  const [actions, setActions] = useState<{id: string; text: string; completed: boolean; skipped: boolean; streak: number}[]>([]);
  const [newAction, setNewAction] = useState('');
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const { saveUnscheduledStack, addStackToRoutine, routines, addRoutine } = useRoutines();
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [addToToday, setAddToToday] = useState(true);
  const [selectedRoutineId, setSelectedRoutineId] = useState(routineId || 'library');
  const [schedule, setSchedule] = useState<{type: string; days: string[]; interval?: number; startDate?: string; dayOfMonth?: number}>({
    type: 'daily',
    days: [],
    interval: 1,
  });
  const [isRoutineDropdownOpen, setIsRoutineDropdownOpen] = useState(false);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const { user } = useAuth();
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Form setup
  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
    }
  });

  const addAction = () => {
    if (newAction.trim() !== '' && actions.length < 9) {
      setActions([
        ...actions, 
        { 
          id: crypto.randomUUID(), 
          text: newAction.trim(), 
          completed: false, 
          skipped: false,
          streak: 0 
        }
      ]);
      setNewAction('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAction();
    }
  };
  
  // Drag and drop functionality
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
      
      setActions(newItems);
      setDraggedItem(index);
    }
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleCreateRoutine = () => {
    if (!newRoutineName.trim()) {
      toast.error("Please enter a routine name");
      return;
    }
    
    // Create a new routine
    const routineId = crypto.randomUUID();
    const newRoutine = {
      id: routineId,
      title: newRoutineName.trim(),
      stacks: [],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      streak: 0
    };
    
    addRoutine(newRoutine);
    setSelectedRoutineId(routineId);
    setIsCreatingRoutine(false);
    setNewRoutineName('');
    
    toast.success(`New routine "${newRoutineName}" created`);
  };

  const onSubmit = async (data: FormValues) => {
    if (actions.length === 0) {
      toast.error("Please add at least one action to your stack");
      return;
    }
    
    const stackId = crypto.randomUUID();
    const newStack = {
      id: stackId,
      title: data.title,
      isExpanded: true,
      streak: 0,
      isSchedulable: schedule.type !== 'none',
      scheduleType: schedule.type as "weekly" | "interval" | "biweekly" | "monthly" | "none",
      scheduleDays: schedule.days || [],
      interval: schedule.interval || 1,
      startDate: schedule.startDate,
      dayOfMonth: schedule.dayOfMonth,
      actions: actions
    };
    
    // Ensure if "Add Today" is checked, today's day is selected
    if (addToToday && !newStack.scheduleDays?.includes(today)) {
      newStack.scheduleDays = [...(newStack.scheduleDays || []), today];
    }
    
    // Check if we created a new routine during this session
    const createdNewRoutine = selectedRoutineId && selectedRoutineId !== 'library' && 
      !routines.some(r => r.id === selectedRoutineId);
    
    console.log('[CreateNewStackSheet] Submitting new stack:', newStack, 'to routine:', selectedRoutineId);
    if (selectedRoutineId && selectedRoutineId !== 'library') {
      // Add to specific routine
      addStackToRoutine(selectedRoutineId, newStack);
      const routineName = routines.find(r => r.id === selectedRoutineId)?.title || "routine";
      toast.success(`Stack "${data.title}" added to ${routineName}`);
      
      // If we created a new routine, trigger the callback to navigate to routine configuration
      if (createdNewRoutine && onRoutineCreated) {
        onRoutineCreated(selectedRoutineId);
      }
    } else {
      // Save as unscheduled stack
      saveUnscheduledStack(newStack);
      toast.success(`Stack "${data.title}" saved to library`);
    }
    
    // Save to Supabase if user is authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('stacks')
          .insert({
            id: stackId,
            title: data.title,
            user_id: user.id,
            schedule_days: newStack.scheduleDays,
            actions: actions,
            is_schedulable: newStack.isSchedulable,
            routine_id: selectedRoutineId === 'library' ? null : selectedRoutineId,
            schedule_type: newStack.scheduleType,
            interval: newStack.interval,
            start_date: newStack.startDate,
            day_of_month: newStack.dayOfMonth
          });
        if (error) {
          toast.error('Error saving stack to Supabase: ' + error.message);
        }
      } catch (error) {
        toast.error('Error in saving stack data: ' + (error.message || error));
      }
    }
    
    onClose();
  };

  const isSheetMode = isOpen !== undefined;

  const handleScheduleChange = (newSchedule: ScheduleOptions) => {
    setSchedule({
      type: newSchedule.type,
      days: newSchedule.days || [],
      interval: newSchedule.interval,
      startDate: newSchedule.startDate,
      dayOfMonth: newSchedule.dayOfMonth
    });
  };

  // 1. Prevent empty stack titles
  const isTitleValid = form.watch('title').trim().length > 0;
  const isActionCountValid = actions.length > 0;
  const isStackLimit = routines.reduce((acc, r) => acc + r.stacks.length, 0) + actions.length >= 50;

  // 2. Track initial state for discard warning
  const initialState = React.useRef({
    title: '',
    actions: [],
    schedule,
    selectedRoutineId,
  });
  const isDirty = () => {
    return (
      form.getValues('title') !== initialState.current.title ||
      JSON.stringify(actions) !== JSON.stringify(initialState.current.actions) ||
      JSON.stringify(schedule) !== JSON.stringify(initialState.current.schedule) ||
      selectedRoutineId !== initialState.current.selectedRoutineId
    );
  };

  // 3. Reset all state on close
  const handleClose = () => {
    setActions([]);
    setNewAction('');
    setAddToToday(true);
    setSchedule({ type: 'daily', days: [], interval: 1 });
    setSelectedRoutineId(routineId || 'library');
    setIsCreatingRoutine(false);
    setNewRoutineName('');
    form.reset();
    onClose();
  };

  const renderContent = () => (
    <div className="flex-1 overflow-auto flex flex-col pt-4 px-1">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            if (isDirty()) {
              if (window.confirm('You have unsaved changes. Discard this stack?')) {
                handleClose();
              }
            } else {
              handleClose();
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close create new stack"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full space-y-6">
          <div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name your stack</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Morning Stack" 
                      {...field}
                      className="h-12 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="action-input">Add actions (1-9)</Label>
              <p className="text-xs text-gray-500 mb-3">
                Stacks should be 3–9 steps — just enough to stay in working memory.
              </p>
            
              <div className="flex items-center gap-2">
                <Input
                  id="action-input"
                  placeholder="Add an action (max 9)"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={actions.length >= 9}
                  className="h-12 focus-visible:ring-offset-0"
                />
                <Button 
                  type="button"
                  onClick={addAction}
                  disabled={!newAction.trim() || actions.length >= 9}
                  size="icon"
                  className="bg-stacks-purple hover:bg-stacks-purple/90 text-white h-12 w-12"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </div>
            
              {/* Actions counter */}
              {actions.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  {actions.length}/9 actions added
                </div>
              )}
            </div>
            
            {/* Actions list */}
            <div className="max-h-48 overflow-y-auto">
              {actions.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <p>Add 1-9 actions to create your stack</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <div key={action.id} className="flex items-center gap-2">
                      <button
                        aria-label="Move action up"
                        disabled={index === 0}
                        onClick={() => {
                          if (index > 0) {
                            const newActions = [...actions];
                            [newActions[index - 1], newActions[index]] = [newActions[index], newActions[index - 1]];
                            setActions(newActions);
                          }
                        }}
                        className="p-1 rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        aria-label="Move action down"
                        disabled={index === actions.length - 1}
                        onClick={() => {
                          if (index < actions.length - 1) {
                            const newActions = [...actions];
                            [newActions[index], newActions[index + 1]] = [newActions[index + 1], newActions[index]];
                            setActions(newActions);
                          }
                        }}
                        className="p-1 rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <span className="flex-1 truncate">{action.text}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newActions = [...actions];
                          newActions.splice(index, 1);
                          setActions(newActions);
                        }}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                        aria-label="Remove action"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Schedule options as a collapsible */}
          <Collapsible className="border rounded-lg p-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <span className="text-sm font-medium">Schedule Options</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox 
                    id="add-today" 
                    checked={addToToday}
                    onCheckedChange={(checked) => setAddToToday(checked === true)}
                  />
                  <label 
                    htmlFor="add-today" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Add to Today
                  </label>
                </div>
                
                <ScheduleSelector 
                  initialSchedule={{
                    type: schedule.type,
                    days: schedule.days,
                    interval: schedule.interval,
                    startDate: schedule.startDate,
                    dayOfMonth: schedule.dayOfMonth
                  }}
                  onScheduleChange={handleScheduleChange}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Routine selector as a collapsible */}
          <Collapsible className="border rounded-lg p-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <span className="text-sm font-medium">Routine Assignment</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              {isCreatingRoutine ? (
                <div className="space-y-4">
                  <Input 
                    value={newRoutineName}
                    onChange={(e) => setNewRoutineName(e.target.value)}
                    placeholder="New routine name"
                    className="w-full h-12 focus-visible:ring-offset-0"
                  />
                  <div className="flex justify-between gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-1/2" 
                      onClick={() => setIsCreatingRoutine(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button"
                      className="w-1/2 bg-stacks-purple hover:bg-stacks-purple/90" 
                      onClick={handleCreateRoutine}
                      disabled={!newRoutineName.trim()}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Label htmlFor="routine-select" className="block mb-2">Add to Routine (Optional)</Label>
                  <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId} open={isRoutineDropdownOpen} onOpenChange={setIsRoutineDropdownOpen}>
                    <SelectTrigger id="routine-select" className="h-12 focus:ring-offset-0">
                      <SelectValue placeholder="Select a routine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="library">No routine (Library)</SelectItem>
                      {routines.map((routine) => (
                        <SelectItem key={routine.id} value={routine.id}>{routine.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full mt-2 justify-center text-stacks-purple border border-dashed border-stacks-purple/40" 
                    onClick={() => {
                      setIsRoutineDropdownOpen(false);
                      setIsCreatingRoutine(true);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Create New Routine
                  </Button>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
          
          <div className="sticky bottom-0 bg-white pt-3 pb-6 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <Button 
                type="submit"
                className="w-full bg-stacks-purple hover:bg-stacks-purple/90"
                disabled={!isTitleValid || !isActionCountValid || isStackLimit}
                aria-label="Save stack"
              >
                Save Stack
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full"
                aria-label="Cancel create new stack"
              >
                Cancel
              </Button>
              {isStackLimit && (
                <div className="text-red-500 text-xs mt-2 text-center">You've reached the maximum of 50 stacks. Please delete some before adding more.</div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );

  // Render as sheet or inline content based on the context
  return (
    <Sheet open={isOpen}>
      <SheetContent className="fixed inset-0 h-screen w-screen max-w-full rounded-none flex flex-col z-50">
        <SheetHeader className="flex flex-row items-center justify-between p-4 border-b">
          <SheetTitle className="text-stacks-purple text-2xl">Create New Stack</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto p-4">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateNewStackSheet;
