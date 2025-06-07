import React, { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScheduleOptions } from '../context/RoutineContext';

interface ScheduleSelectorProps {
  initialSchedule?: ScheduleOptions;
  onScheduleChange: (schedule: ScheduleOptions) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ initialSchedule, onScheduleChange }) => {
  const [scheduleType, setScheduleType] = useState<string>(initialSchedule?.type || 'daily');
  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    // For weekly and biweekly, start with empty array unless there's initial data
    if (initialSchedule?.type === 'weekly' || initialSchedule?.type === 'biweekly') {
      return initialSchedule?.days || [];
    }
    return initialSchedule?.days || [];
  });
  const [intervalValue, setIntervalValue] = useState<number>(initialSchedule?.interval || 1);
  const [weekIntervalValue, setWeekIntervalValue] = useState<number>(initialSchedule?.interval || 1);
  const [monthIntervalValue, setMonthIntervalValue] = useState<number>(initialSchedule?.interval || 1);
  const [monthlyDayOfMonth, setMonthlyDayOfMonth] = useState<number>(
    initialSchedule?.dayOfMonth || 1
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialSchedule?.startDate ? new Date(initialSchedule.startDate) : new Date()
  );
  
  // Update parent component whenever schedule changes
  useEffect(() => {
    let currentInterval = intervalValue;
    if (scheduleType === 'biweekly') {
      currentInterval = weekIntervalValue;
    } else if (scheduleType === 'monthly') {
      currentInterval = monthIntervalValue;
    }
    
    updateParentSchedule(scheduleType, selectedDays, currentInterval, startDate);
  }, [scheduleType, selectedDays, intervalValue, weekIntervalValue, monthIntervalValue, monthlyDayOfMonth, startDate]);
  
  const handleScheduleTypeChange = (value: string) => {
    if (!value) return;
    setScheduleType(value);
    
    // Clear selected days when switching to weekly or biweekly to force user selection
    if (value === 'weekly' || value === 'biweekly') {
      setSelectedDays([]);
    }
  };
  
  const toggleDay = (day: string) => {
    // Convert array to set for easier toggling
    const daySet = new Set(selectedDays);
    
    if (daySet.has(day)) {
      daySet.delete(day);
    } else {
      daySet.add(day);
    }
    
    const newSelectedDays = Array.from(daySet);
    setSelectedDays(newSelectedDays);
  };
  
  const updateParentSchedule = (
    type: string, 
    days: string[] = selectedDays, 
    interval: number = intervalValue,
    date: Date | undefined = startDate
  ) => {
    const scheduleData: ScheduleOptions = {
      type,
      days: type !== 'none' && type !== 'monthly' && type !== 'daily' ? days : [],
      interval: (type === 'interval' || type === 'biweekly' || type === 'monthly') ? interval : undefined,
      isSchedulable: type !== 'none',
      startDate: (type === 'interval' || type === 'biweekly' || type === 'oneTime' || type === 'monthly') ? date?.toISOString() : undefined
    };
    
    // Add day of month for monthly schedules
    if (type === 'monthly') {
      scheduleData.dayOfMonth = monthlyDayOfMonth;
    }
    
    onScheduleChange(scheduleData);
  };
  
  const getScheduleDescription = () => {
    if (scheduleType === 'none') {
      return "This item will only appear in the Library, not in Today view.";
    } else if (scheduleType === 'daily') {
      return "✅ Will show every day";
    } else if (scheduleType === 'weekly') {
      return selectedDays.length > 0 
        ? `✅ Will show on: ${selectedDays.map(d => d.slice(0,3)).join(', ')}`
        : "⚠️ No days selected";
    } else if (scheduleType === 'interval') {
      return `✅ Every ${intervalValue} day${intervalValue !== 1 ? 's' : ''} starting ${startDate ? format(startDate, 'MMM d, yyyy') : 'today'}`;
    } else if (scheduleType === 'oneTime') {
      return `✅ Only on ${startDate ? format(startDate, 'MMM d, yyyy') : 'today'}`;
    } else if (scheduleType === 'biweekly') {
      const daysList = selectedDays.length > 0 
        ? selectedDays.map(d => d.slice(0,3)).join(', ')
        : "no days selected";
      return `✅ Every ${weekIntervalValue} week${weekIntervalValue !== 1 ? 's' : ''} on ${daysList}`;
    } else if (scheduleType === 'monthly') {
      return `✅ Every ${monthIntervalValue} month${monthIntervalValue !== 1 ? 's' : ''} on day ${monthlyDayOfMonth} starting ${startDate ? format(startDate, 'MMM d, yyyy') : 'today'}`;
    }
    return "";
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium mb-2">Schedule Type</Label>
        <ToggleGroup 
          type="single" 
          value={scheduleType} 
          onValueChange={handleScheduleTypeChange} 
          className="flex flex-wrap gap-1 justify-center"
        >
          <ToggleGroupItem 
            value="daily" 
            className="px-3 py-1 text-sm rounded-full data-[state=on]:bg-stacks-purple data-[state=on]:text-white"
          >
            Daily
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="weekly" 
            className="px-3 py-1 text-sm rounded-full data-[state=on]:bg-stacks-purple data-[state=on]:text-white"
          >
            Weekly
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="interval" 
            className="px-3 py-1 text-sm rounded-full data-[state=on]:bg-stacks-purple data-[state=on]:text-white"
          >
            Every X Days
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="biweekly" 
            className="px-3 py-1 text-sm rounded-full data-[state=on]:bg-stacks-purple data-[state=on]:text-white"
          >
            Every X Weeks
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="monthly" 
            className="px-3 py-1 text-sm rounded-full data-[state=on]:bg-stacks-purple data-[state=on]:text-white"
          >
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="oneTime" 
            className="px-3 py-1 text-sm rounded-full data-[state=on]:bg-stacks-purple data-[state=on]:text-white"
          >
            One Time
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="none" 
            className="px-3 py-1 text-sm rounded-full data-[state=on]:bg-stacks-purple data-[state=on]:text-white"
          >
            No Schedule
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Weekly schedule options */}
      {scheduleType === 'weekly' && (
        <div className="space-y-2">
          <Label className="block text-sm font-medium mb-2">Select Days</Label>
          <div className="flex flex-wrap justify-center gap-2">
            {DAYS_OF_WEEK.map(day => (
              <Badge
                key={day}
                variant={selectedDays.includes(day) ? "default" : "outline"}
                className={`cursor-pointer py-1 px-3 ${
                  selectedDays.includes(day) 
                    ? 'bg-stacks-purple hover:bg-stacks-purple/90'
                    : 'bg-transparent hover:bg-gray-100'
                }`}
                onClick={() => toggleDay(day)}
              >
                {day.slice(0, 3)}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Interval schedule options */}
      {scheduleType === 'interval' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Every</Label>
            <Input
              type="number" 
              min={1}
              max={365}
              value={intervalValue}
              onChange={e => setIntervalValue(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <Label>day{intervalValue !== 1 ? 's' : ''}</Label>
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-2">Starting From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      
      {/* One time schedule option */}
      {scheduleType === 'oneTime' && (
        <div>
          <Label className="block text-sm font-medium mb-2">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      {/* Biweekly schedule options */}
      {scheduleType === 'biweekly' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Every</Label>
            <Input
              type="number"
              min={1}
              max={52}
              value={weekIntervalValue}
              onChange={e => setWeekIntervalValue(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <Label>week{weekIntervalValue !== 1 ? 's' : ''} on:</Label>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {DAYS_OF_WEEK.map(day => (
              <Badge
                key={day}
                variant={selectedDays.includes(day) ? "default" : "outline"}
                className={`cursor-pointer py-1 px-3 ${
                  selectedDays.includes(day) 
                    ? 'bg-stacks-purple hover:bg-stacks-purple/90' 
                    : 'bg-transparent hover:bg-gray-100'
                }`}
                onClick={() => toggleDay(day)}
              >
                {day.slice(0, 3)}
              </Badge>
            ))}
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-2">Starting From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      
      {/* Monthly schedule options */}
      {scheduleType === 'monthly' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Every</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={monthIntervalValue}
              onChange={e => setMonthIntervalValue(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <Label>month{monthIntervalValue !== 1 ? 's' : ''} on day</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={monthlyDayOfMonth}
              onChange={e => setMonthlyDayOfMonth(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-2">Starting From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      
      {/* Show visual feedback on the selected schedule */}
      <div className={`text-sm mt-2 p-3 rounded-lg ${
        scheduleType === 'none' ? 'bg-gray-50 text-gray-500' : 'bg-green-50 text-green-700'
      }`}>
        {getScheduleDescription()}
      </div>
      
      {scheduleType === 'none' && (
        <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-gray-500">
            Manual stacks only appear when triggered — not on the Today screen.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;
