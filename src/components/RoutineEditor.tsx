import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Routine, useRoutines } from '../context/RoutineContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import ScheduleSelector from './ScheduleSelector';
import { ScheduleOptions } from '../context/RoutineContext';
import { Plus, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { SheetHeader } from '@/components/ui/sheet';

interface RoutineEditorProps {
  routine?: Routine;  // Optional - if not provided, we're creating a new routine
  onClose: () => void;
  onRoutineCreated?: (routineId: string) => void; // Callback when routine is created
}

const RoutineEditor: React.FC<RoutineEditorProps> = ({ routine, onClose, onRoutineCreated }) => {
  const { addRoutine, renameRoutine, updateRoutineSchedule } = useRoutines();
  const [name, setName] = useState(routine?.title || '');
  const [description, setDescription] = useState(routine?.description || '');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [addToToday, setAddToToday] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleOptions>(() => {
    if (routine) {
      return {
        type: routine.scheduleType || 'daily',
        days: routine.days || [],
        interval: routine.interval,
        startDate: routine.startDate,
        dayOfMonth: routine.dayOfMonth
      };
    }
    // Default schedule for new routines - daily
    return {
      type: 'daily',
      days: [],
      isSchedulable: true
    };
  });
  const { user } = useAuth();
  const { routines } = useRoutines();
  
  const isCreating = !routine;

  // 1. Prevent empty routine titles
  const isTitleValid = name.trim().length > 0;
  const isRoutineLimit = routines.length >= 50;

  // 2. Track initial state for discard warning
  const initialState = React.useRef({
    name: routine ? routine.title : '',
    description: routine ? routine.description : '',
    schedule,
  });
  const isDirty = () => {
    return (
      name !== initialState.current.name ||
      description !== initialState.current.description ||
      JSON.stringify(schedule) !== JSON.stringify(initialState.current.schedule)
    );
  };

  // 5. Reset all state on close
  const handleClose = () => {
    setName(routine ? routine.title : '');
    setDescription(routine ? routine.description : '');
    setSchedule(routine ? {
      type: routine.scheduleType || 'daily',
      days: routine.days || [],
      interval: routine.interval,
      startDate: routine.startDate,
      dayOfMonth: routine.dayOfMonth
    } : { type: 'daily', days: [], interval: 1 });
    onClose();
  };

  const handleScheduleChange = (newSchedule: ScheduleOptions) => {
    setSchedule(newSchedule);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a routine name");
      return;
    }
    
    if (isCreating) {
      // Create new routine
      const routineId = `routine-${uuidv4()}`;
      const newRoutine: Routine = {
        id: routineId,
        title: name.trim(),
        description: description.trim(),
        stacks: [],
        days: schedule.days || [],
        streak: 0,
        scheduleType: schedule.type as any,
        interval: schedule.interval,
        startDate: schedule.startDate,
        dayOfMonth: schedule.dayOfMonth,
      };
      
      addRoutine(newRoutine);
      toast.success(`Routine "${name}" created!`);
      
      // Save to Supabase if user is authenticated
      if (user) {
        try {
          const { error } = await supabase
            .from('routines')
            .insert({ 
              id: routineId,
              user_id: user.id,
              title: name.trim(),
              description: description.trim(),
              stacks: [],
              days: schedule.days || [],
              streak: 0,
              schedule_type: schedule.type,
              interval: schedule.interval,
              start_date: schedule.startDate,
              day_of_month: schedule.dayOfMonth
            });
          
          if (error) {
            toast.error('Error saving routine to Supabase: ' + error.message);
          }
        } catch (error) {
          toast.error('Error in saving routine data: ' + (error.message || error));
        }
      }
      
      // Notify parent component that routine was created
      if (onRoutineCreated) {
        onRoutineCreated(routineId);
      } else {
        onClose();
      }
    } else if (routine) {
      // Update existing routine
      if (name !== routine.title) {
        renameRoutine(routine.id, name.trim());
      }
      
      // Update schedule if changed
      updateRoutineSchedule(routine.id, schedule);
      
      toast.success(`Routine "${name}" updated!`);
      
      // Update in Supabase if user is authenticated
      if (user) {
        try {
          const { error } = await supabase
            .from('routines')
            .update({ 
              title: name.trim(),
              description: description.trim(),
              days: schedule.days || [],
              schedule_type: schedule.type,
              interval: schedule.interval,
              start_date: schedule.startDate,
              day_of_month: schedule.dayOfMonth
            })
            .eq('id', routine.id)
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Error updating routine in Supabase:', error);
          }
        } catch (error) {
          console.error('Error in updating routine data:', error);
        }
      }
      
      onClose();
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="routine-name" className="text-sm font-medium">Routine Name</Label>
          <Input 
            id="routine-name"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="My Routine"
            className="mt-2 focus-visible:ring-stacks-purple focus-visible:ring-offset-0 focus-visible:border-stacks-purple focus-visible:ring-2"
          />
        </div>
        
        <div>
          <Label htmlFor="routine-description" className="text-sm font-medium">Description (Optional)</Label>
          <Textarea 
            id="routine-description"
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this routine for?"
            className="mt-2 h-20 focus-visible:ring-stacks-purple focus-visible:ring-offset-0 focus-visible:border-stacks-purple focus-visible:ring-2 resize-none"
          />
        </div>
        
        <div className="border rounded-lg">
          <Collapsible open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Label className="text-sm font-medium cursor-pointer">Schedule Options</Label>
                </div>
                {isScheduleOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border-t">
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="add-to-today" 
                    checked={addToToday}
                    onCheckedChange={(checked) => setAddToToday(checked as boolean)}
                  />
                  <Label htmlFor="add-to-today" className="text-sm font-medium">
                    Add to Today
                  </Label>
                </div>
                
                <ScheduleSelector 
                  initialSchedule={schedule}
                  onScheduleChange={handleScheduleChange}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {!isCreating && routine?.stacks && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Stacks</Label>
            {routine.stacks.length > 0 ? (
              <div className="space-y-2">
                {routine.stacks.map((stack) => (
                  <div key={stack.id} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{stack.title}</p>
                      <p className="text-xs text-gray-500">{stack.actions.length} actions</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No stacks in this routine yet</p>
                  <p className="text-gray-400 text-xs">Add stacks to build your routine</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-6">
          <Button 
            type="submit"
            className="w-full bg-stacks-purple hover:bg-stacks-purple/90"
            disabled={!isTitleValid || isRoutineLimit}
            aria-label="Save routine"
          >
            {isCreating ? 'Create Routine' : 'Save Changes'}
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          className="w-full"
          aria-label="Cancel routine edit"
        >
          Cancel
        </Button>
        {isRoutineLimit && (
          <div className="text-red-500 text-xs mt-2 text-center">You've reached the maximum of 50 routines. Please delete some before adding more.</div>
        )}
      </form>
      <SheetHeader>
        <button
          onClick={() => {
            if (isDirty()) {
              if (window.confirm('You have unsaved changes. Discard this routine?')) {
                handleClose();
              }
            } else {
              handleClose();
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close routine editor"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </SheetHeader>
    </div>
  );
};

export default RoutineEditor;
