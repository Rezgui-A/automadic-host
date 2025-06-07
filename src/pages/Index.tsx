import React, { useEffect, useMemo } from "react";
import TabBar from "../components/TabBar";
import RoutineList from "../components/RoutineList";
import { useRoutines } from "../context/RoutineContext";
import TodayHeader from "../components/TodayHeader";
import CreateModal from "../components/CreateModal";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import CreateNewStackSheet from "../components/CreateNewStackSheet";
import RoutineEditor from "../components/RoutineEditor";
import { useSupabaseSync } from "../hooks/useSupabaseSync";
import { usePageInitialize } from "../hooks/usePageInitialize";
import { useScheduling } from "../hooks/useScheduling";
import { Analytics } from "@vercel/analytics/react";

const VERSION = "";

const Index: React.FC = () => {
  const { routines } = useRoutines();
  const { isLoading, hasFetched, fetchUserData } = useSupabaseSync();
  const { isRoutineScheduledForDate } = useScheduling();
  const { date, setDate, formattedDate, editMode, toggleEditMode, isCreateModalOpen, isStackCreatorOpen, setIsStackCreatorOpen, isRoutineEditorOpen, setIsRoutineEditorOpen, handleOpenCreateModal, handleCloseCreateModal, handleCreateStack, handleCreateRoutine } = usePageInitialize();

  const selectedDate = useMemo(() => {
    const result = date || new Date();
    console.log("[Dashboard] Selected date changed to:", result.toDateString());
    return result;
  }, [date]);

  const selectedDayName = useMemo(() => {
    return selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  }, [selectedDate]);

  const todaysRoutines = useMemo(() => {
    console.log("[Dashboard] Filtering routines for date:", selectedDate.toDateString(), "Day:", selectedDayName);

    const filtered = routines.filter((routine) => {
      const isScheduled = isRoutineScheduledForDate(routine, selectedDate);
      console.log("[Dashboard] Routine:", routine.title, "Scheduled for", selectedDate.toDateString(), ":", isScheduled);
      return isScheduled;
    });

    console.log("[Dashboard] Filtered routines count:", filtered.length);
    return filtered;
  }, [routines, selectedDate, isRoutineScheduledForDate]);

  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchUserData(true);
    }
  }, [hasFetched, isLoading, fetchUserData]);

  if (isLoading && !routines.length) {
    return (
      <div className="flex flex-col min-h-screen pb-24">
        <TabBar />
        <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6">
          <div className="animate-pulse w-full max-w-3xl space-y-6">
            <div className="h-10 w-1/2 bg-muted rounded-lg" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <TabBar />
      <main className="flex-1 container px-4 sm:px-6 max-w-3xl mt-6 space-y-6">
        <TodayHeader formattedDate={formattedDate} date={date} setDate={setDate} editMode={editMode} toggleEditMode={toggleEditMode} openCreateModal={handleOpenCreateModal} version={VERSION} />

        {todaysRoutines.length > 0 ? <RoutineList routines={todaysRoutines} isEditMode={editMode} selectedDate={selectedDate} /> : <div className="text-center py-20 text-gray-400 text-lg">No routines scheduled for {selectedDate.toDateString()}. Try creating one!</div>}
      </main>

      <CreateModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} onCreateStack={handleCreateStack} onCreateRoutine={handleCreateRoutine} />

      <Dialog open={isStackCreatorOpen} onOpenChange={setIsStackCreatorOpen}>
        <DialogContent className="sm:max-w-md p-0 rounded-xl shadow-xl">
          <CreateNewStackSheet isOpen={true} onClose={() => setIsStackCreatorOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isRoutineEditorOpen} onOpenChange={setIsRoutineEditorOpen}>
        <DialogContent className="sm:max-w-md p-0 rounded-xl shadow-xl">
          <DialogDescription className="sr-only">Create or edit a routine</DialogDescription>
          <RoutineEditor onClose={() => setIsRoutineEditorOpen(false)} />
        </DialogContent>
      </Dialog>

      <Analytics />
    </div>
  );
};

export default Index;
