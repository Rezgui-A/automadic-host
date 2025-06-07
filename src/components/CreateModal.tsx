
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStack: () => void;
  onCreateRoutine: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({ 
  isOpen,
  onClose,
  onCreateStack,
  onCreateRoutine
}) => {
  const handleCreateStack = () => {
    onCreateStack();
    onClose();
  };

  const handleCreateRoutine = () => {
    onCreateRoutine();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button 
            onClick={handleCreateStack} 
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <span className="mr-2">➕</span> Create New Stack
          </Button>
          <Button 
            onClick={handleCreateRoutine}
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <span className="mr-2">➕</span> Create New Routine
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModal;
