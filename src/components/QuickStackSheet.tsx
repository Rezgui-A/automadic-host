import React, { useRef, useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ArrowUp, Move } from "lucide-react";

interface QuickStackSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStack: () => void;
  quickStackActions: { id: string; text: string; completed: boolean; skipped: boolean; streak: number }[];
  setQuickStackActions: React.Dispatch<React.SetStateAction<{ id: string; text: string; completed: boolean; skipped: boolean; streak: number }[]>>;
}

const QuickStackSheet: React.FC<QuickStackSheetProps> = ({ isOpen, onClose, onStartStack, quickStackActions, setQuickStackActions }) => {
  const [newAction, setNewAction] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const addQuickAction = () => {
    if (newAction.trim() !== "" && quickStackActions.length < 9) {
      setQuickStackActions([
        ...quickStackActions,
        {
          id: crypto.randomUUID(),
          text: newAction.trim(),
          completed: false,
          skipped: false,
          streak: 0,
        },
      ]);
      setNewAction("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addQuickAction();
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
      const newItems = [...quickStackActions];
      const draggedItemValue = newItems[draggedItem];

      // Remove the dragged item
      newItems.splice(draggedItem, 1);
      // Add it at the new position
      newItems.splice(index, 0, draggedItemValue);

      setQuickStackActions(newItems);
      setDraggedItem(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl flex flex-col">
        <SheetHeader className="text-left flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-stacks-purple text-2xl">Quick Stack</SheetTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500">
            <X className="w-4 h-4" />
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Input field - Always show at top for immediate action entry */}
          <div className="sticky top-0 bg-background z-10 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <label htmlFor="quick-action-input" className="sr-only">
                Add Action
              </label>
              <Input id="quick-action-input" ref={inputRef} placeholder="Add an action (max 9)" value={newAction} onChange={(e) => setNewAction(e.target.value)} onKeyDown={handleKeyDown} disabled={quickStackActions.length >= 9} className="flex-1" />
              <Button onClick={addQuickAction} disabled={!newAction.trim() || quickStackActions.length >= 9} size="icon" className="bg-blue-500 hover:bg-blue-600 text-white">
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions list with drag-and-drop reordering */}
          <div className="flex-1 overflow-y-auto py-2">
            {quickStackActions.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p>Add 1-9 actions to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quickStackActions.map((action, index) => (
                  <div key={action.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} className="flex items-center justify-between p-3 border rounded-lg border-border bg-card">
                    <div className="flex items-center flex-1">
                      <div className="mr-3 cursor-grab touch-manipulation">
                        <Move className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="flex-1 truncate">{action.text}</span>
                    </div>
                    <button
                      onClick={() => {
                        const newActions = [...quickStackActions];
                        newActions.splice(index, 1);
                        setQuickStackActions(newActions);
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions counter */}
          {quickStackActions.length > 0 && <div className="text-xs text-gray-500 mb-2 px-2">{quickStackActions.length}/9 actions added</div>}

          {/* Bottom area with start stack button */}
          <div className="mt-auto pt-3 pb-6 border-t border-gray-100">
            <div className="flex flex-col gap-3 px-2">
              <Button onClick={onStartStack} className="w-full bg-stacks-purple hover:bg-stacks-purple/90" disabled={quickStackActions.length === 0}>
                Start Stack
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickStackSheet;
