import React from "react";
import { Check, Pencil, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface TodayHeaderProps {
  formattedDate: string;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  editMode: boolean;
  toggleEditMode: () => void;
  openCreateModal: () => void;
  version?: string;
}

const TodayHeader: React.FC<TodayHeaderProps> = ({ formattedDate, date, setDate, editMode, toggleEditMode, openCreateModal, version }) => {
  // Determine if the selected date is today
  const isToday = date && format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const headerTitle = isToday ? "Today" : "Routines";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{headerTitle}</h1>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-gray-600 text-sm flex items-center hover:text-stacks-purple transition-colors">
              <span className="mx-1 hidden sm:inline">·</span>
              {formattedDate}
              <Calendar className="w-4 h-4 ml-2" />
              {version && <span className="ml-2 text-xs text-muted-foreground">v{version}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 mt-2" align="start">
            <CalendarComponent mode="single" selected={date} onSelect={setDate} className="rounded-md border shadow-sm" />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        {editMode ? (
          <Button size="sm" className="bg-stacks-purple text-white hover:bg-stacks-purple/90" onClick={toggleEditMode}>
            <Check className="w-4 h-4 mr-2" />
            Done
          </Button>
        ) : (
          <Button size="icon" variant="ghost" className="bg-stacks-soft-purple/30 text-stacks-purple hover:bg-stacks-soft-purple/50" onClick={openCreateModal}>
            <Plus className="w-5 h-5" />
            <span className="sr-only">Create new</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TodayHeader;
