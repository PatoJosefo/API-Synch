import { useRef, useState } from "react";

interface FileUploadProps {
  label: string;
  accept: string;
  multiple?: boolean;
  value: File | File[] | null;
  onChange: (files: File | File[] | null) => void;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  multiple = false,
  value,
  onChange,
  error,
  hint,
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (multiple) {
      onChange(files);
    } else {
      onChange(files[0] || null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (multiple) {
        onChange(Array.from(files));
      } else {
        onChange(files[0] || null);
      }
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const getFileNames = () => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return value.map((f) => f.name).join(", ");
    }
    return value.name;
  };

  return (
    <div className="form-group">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="required">*</span>}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}
          ${error ? "border-red-500 bg-red-50" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center text-center">
          <svg
            className={`w-12 h-12 mb-3 transition-colors ${
              isDragging ? "text-blue-500" : "text-gray-400"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {getFileNames() ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">📎 {getFileNames()}</p>
              <p className="text-xs text-gray-500">Clique para alterar</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Arraste o arquivo aqui
              </p>
              <p className="text-xs text-gray-500 mb-3">ou clique para selecionar</p>
              <button
                type="button"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
              >
                Escolher Arquivo
              </button>
            </>
          )}
        </div>
      </div>

      {hint && <small className="field-hint">{hint}</small>}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
