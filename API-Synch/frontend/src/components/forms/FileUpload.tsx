import React from 'react';

interface FileUploadProps {
  label: string;
  name: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, name }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200"> 
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} (Upload da foto do seu veículo)
      </label>
      <input
        type="file"
        id={name}
        name={name}
        accept="image/*"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <p className="mt-1 text-sm text-gray-500">Escolha uma imagem JPG, PNG ou GIF (máx. 5MB).</p>
    </div>
  );
};

export default FileUpload;