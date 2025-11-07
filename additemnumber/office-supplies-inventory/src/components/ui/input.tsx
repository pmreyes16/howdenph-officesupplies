import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
}

const Input: React.FC<InputProps> = ({ id, label, ...props }) => {
  return (
    <div className="input-container">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className="input-field" {...props} />
    </div>
  );
};

export default Input;