import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Routine } from '../context/RoutineContext';
import { Button } from '@/components/ui/button';
import { Edit, Plus, X } from 'lucide-react';
import RoutineEditor from './RoutineEditor';
import CreateNewStackSheet from './CreateNewStackSheet';

interface RoutineEditorSheetProps {
  routine: Routine;
}

const RoutineEditorSheet: React.FC<RoutineEditorSheetProps> = ({ routine }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateNewStackOpen, setIsCreateNewStackOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        setIsSheetOpen(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setIsSheetOpen(open);
    }
  };

  const handleCreateNewStackOpen = () => {
    setIsCreateNewStackOpen(true);
    setIsSheetOpen(false); // Close the routine editor sheet
  };

  const handleCreateNewStackClose = () => {
    setIsCreateNewStackOpen(false);
    setIsSheetOpen(true); // Re-open the routine editor sheet
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
      <SheetContent>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => handleOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <SheetHeader>
          <SheetTitle>Edit Routine</SheetTitle>
          <SheetDescription>
            Make changes to your routine here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        
        <RoutineEditor 
          routine={routine} 
          onClose={() => setIsSheetOpen(false)} 
          onChangesMade={() => setHasUnsavedChanges(true)}
        />

        <Button 
          variant="ghost" 
          size="sm" 
          className="text-stacks-purple mt-4"
          onClick={handleCreateNewStackOpen}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New Stack
        </Button>
      </SheetContent>

      {/* Create New Stack Sheet */}
      <CreateNewStackSheet
        isOpen={isCreateNewStackOpen}
        onClose={handleCreateNewStackClose}
        routineId={routine.id} // Pass the routine ID
      />
    </Sheet>
  );
};

export default RoutineEditorSheet;
