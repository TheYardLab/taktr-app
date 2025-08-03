import { useState } from 'react';

export default function FileUpload({ onFileUpload }: { onFileUpload: (file: File) => void }) {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow flex flex-col items-center">
      <label className="w-full flex flex-col items-center px-4 py-6 bg-brandLight text-brand rounded-lg shadow-lg tracking-wide uppercase border border-brand cursor-pointer hover:bg-brand hover:text-white transition">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M16.88 9.1A4 4 0 0013 5H7a4 4 0 00-3.88 4.9A5 5 0 005 19h10a5 5 0 001.88-9.9zM11 11V7h-2v4H7l3 3 3-3h-2z" />
        </svg>
        <span className="mt-2 text-base leading-normal">
          {fileName || 'Select Project File (.xml or .xlsx)'}
        </span>
        <input type="file" accept=".xml,.xlsx" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
}