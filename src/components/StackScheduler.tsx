
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Repeat } from 'lucide-react';
import { Stack, useRoutines, ScheduleOptions } from '../context/RoutineContext';
import ScheduleSelector from './ScheduleSelector';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface StackSchedulerProps {
  routineId: string;
  stack: Stack;
}

const StackScheduler: React.FC<StackSchedulerProps> = ({ routineId, stack }) => {
  const { setStackSchedule } = useRoutines();
  
  const [schedule, setSchedule] = useState<ScheduleOptions>({
    type: stack.scheduleType || 'weekly',
    days: stack.scheduleDays || [],
    interval: stack.interval || 1,
    isSchedulable: stack.isSchedulable !== false,
    startDate: stack.startDate
  });
  
  // Get a user-friendly description of the schedule
  const getScheduleDescription = () => {
    const type = schedule.type;
    
    if (type === 'none' || !type) {
      return "No schedule";
    } else if (type === 'weekly') {
      const days = schedule.days || [];
      return days.length > 0 
        ? `Weekly on ${days.map(d => d.slice(0,3)).join(', ')}`
        : "Weekly (no days selected)";
    } else if (type === 'interval') {
      const interval = schedule.interval || 1;
      return `Every ${interval} day${interval !== 1 ? 's' : ''}`;
    } else if (type === 'biweekly') {
      const interval = schedule.interval || 1;
      const days = schedule.days || [];
      return `Every ${interval} week${interval !== 1 ? 's' : ''} on ${days.map(d => d.slice(0,3)).join(', ')}`;
    } else if (type === 'oneTime') {
      return `One time on ${schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : 'set date'}`;
    }
    
    return "Custom schedule";
  };
  
  const handleSave = () => {
    setStackSchedule(routineId, stack.id, schedule);
    toast.success("Stack schedule updated");
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1 h-7 w-7 relative group">
          <Repeat size={16} className="group-hover:text-stacks-purple transition-colors" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-stacks-purple rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Badge variant="outline" className="hidden group-hover:flex absolute -bottom-6 text-[10px] whitespace-nowrap z-10 bg-white border border-gray-200 px-1.5 py-0.5">
            {getScheduleDescription()}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-center text-stacks-purple">{stack.title} Schedule</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 h-[60vh] overflow-y-auto">
          <ScheduleSelector 
            initialSchedule={schedule}
            onScheduleChange={setSchedule}
          />
        </div>
        
        <SheetFooter className="sticky bottom-0 bg-white pt-2 pb-4 border-t border-gray-100">
          <Button onClick={handleSave} className="w-full bg-stacks-purple hover:bg-stacks-purple/90">
            Save Schedule
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default StackScheduler;
