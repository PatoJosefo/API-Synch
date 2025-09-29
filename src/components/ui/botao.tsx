import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', onClick }) => {
  const baseClasses = "font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const primaryClasses = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
  const secondaryClasses = "bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500";

  return (
    <button className={`${baseClasses} ${variant === 'primary' ? primaryClasses : secondaryClasses}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;