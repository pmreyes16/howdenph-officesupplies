import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-30" onClick={() => onOpenChange(false)} />
      <div className="bg-white rounded-lg shadow-lg z-10 p-4">
        <button className="absolute top-2 right-2" onClick={() => onOpenChange(false)}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Dialog;