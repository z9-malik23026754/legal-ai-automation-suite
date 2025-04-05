
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FreeTrialForm from "@/components/trial/FreeTrialForm";

type DialogContentType = 'FreeTrial' | null;

interface DialogOptions {
  title: string;
  content: DialogContentType;
  size?: 'sm' | 'md' | 'lg';
}

interface DialogContextType {
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(null);

  const openDialog = (options: DialogOptions) => {
    setDialogOptions(options);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  // Map dialog content type to component
  const renderDialogContent = () => {
    if (!dialogOptions) return null;
    
    switch (dialogOptions.content) {
      case 'FreeTrial':
        return <FreeTrialForm onClose={closeDialog} />;
      default:
        return null;
    }
  };

  const getDialogClass = () => {
    if (!dialogOptions) return '';
    
    switch (dialogOptions.size) {
      case 'sm':
        return 'sm:max-w-sm';
      case 'md':
        return 'sm:max-w-md';
      case 'lg':
        return 'sm:max-w-lg';
      default:
        return 'sm:max-w-md';
    }
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={getDialogClass()}>
          {dialogOptions && (
            <>
              <DialogHeader>
                <DialogTitle>{dialogOptions.title}</DialogTitle>
              </DialogHeader>
              {renderDialogContent()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
