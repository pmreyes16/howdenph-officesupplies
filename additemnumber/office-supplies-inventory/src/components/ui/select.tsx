import React from 'react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
      >
        {children}
      </select>
    </div>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md">
      {children}
    </div>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return (
    <span className="text-gray-500">
      {placeholder}
    </span>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
}

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  return (
    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
      {children}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return (
    <div
      onClick={() => {
        // Handle item selection
      }}
      className="cursor-pointer p-2 hover:bg-gray-100"
    >
      {children}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };