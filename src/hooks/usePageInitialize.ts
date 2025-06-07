import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStackManagement } from "./useStackManagement";
import { format } from "date-fns";
import { toast } from "sonner";

/**
 * Hook to handle page initialization logic
 */
export const usePageInitialize = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Debug wrapper for setDate
  const setDateWithLogging = (newDate: Date | undefined) => {
    console.log("[usePageInitialize] Date being set to:", newDate?.toDateString());
    setDate(newDate);
  };
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isStackCreatorOpen, setIsStackCreatorOpen] = useState<boolean>(false);
  const [isRoutineEditorOpen, setIsRoutineEditorOpen] = useState<boolean>(false);
  const { isFirstTimeUser } = useStackManagement();
  const navigate = useNavigate();
  const onboardingCheckedRef = useRef(false);

  const formattedDate = date ? format(date, "PPP") : "";

  // Check if it's a first-time user and redirect to onboarding ONCE
  useEffect(() => {
    if (!onboardingCheckedRef.current && isFirstTimeUser()) {
      onboardingCheckedRef.current = true;
      navigate("/onboarding", { replace: true });
    }
  }, [isFirstTimeUser, navigate]);

  const toggleEditMode = () => {
    setEditMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        toast("Edit mode enabled. Drag items to reorder.", {
          description: "Tap and hold to drag routines and stacks.",
        });
      }
      return newMode;
    });
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateStack = () => {
    setIsStackCreatorOpen(true);
    setIsCreateModalOpen(false);
  };

  const handleCreateRoutine = () => {
    setIsRoutineEditorOpen(true);
    setIsCreateModalOpen(false);
  };

  return {
    date,
    setDate: setDateWithLogging,
    formattedDate,
    editMode,
    toggleEditMode,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isStackCreatorOpen,
    setIsStackCreatorOpen,
    isRoutineEditorOpen,
    setIsRoutineEditorOpen,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreateStack,
    handleCreateRoutine,
  };
};
