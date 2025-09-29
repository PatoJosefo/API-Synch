import React from 'react';
import Input from '../ui/input'; 

interface FormFieldProps {
  label: string;
  type: string;
  name: string;
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, type, name, placeholder }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200"> 
      <Input label={label} type={type} name={name} placeholder={placeholder} />
    </div>
  );
};

export default FormField;