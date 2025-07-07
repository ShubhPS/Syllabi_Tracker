
import React, { useState, useRef } from 'react';
import { UploadIcon, FileIcon, SparklesIcon } from './icons';

interface SyllabusUploaderProps {
  onGenerate: (file: File) => void;
  isLoading: boolean;
}

const SyllabusUploader: React.FC<SyllabusUploaderProps> = ({ onGenerate, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setFileName(droppedFile.name);
        if (fileInputRef.current) {
          fileInputRef.current.files = e.dataTransfer.files;
        }
      }
    }
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if(e.type === 'dragenter' || e.type === 'dragover') {
          setIsDragOver(true);
      } else if (e.type === 'dragleave') {
          setIsDragOver(false);
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onGenerate(file);
    }
  };

  const isButtonDisabled = !file || isLoading;

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Syllabus PDF
            </label>
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragEvents}
              onDragEnter={handleDragEvents}
              onDragLeave={handleDragEvents}
              onClick={() => fileInputRef.current?.click()}
              className={`flex justify-center w-full px-6 pt-5 pb-6 border-2 ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} border-dashed rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100`}
            >
              <div className="space-y-1 text-center">
                {fileName ? (
                  <>
                    <FileIcon className="mx-auto h-12 w-12 text-green-500" />
                    <p className="text-sm text-gray-700 font-medium">{fileName}</p>
                    <p className="text-xs text-gray-500">Click or drag to replace</p>
                  </>
                ) : (
                  <>
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Syllabus in PDF format</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isButtonDisabled}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            <SparklesIcon className="h-5 w-5" />
            {isLoading ? 'Generating...' : 'Generate Learning Roadmap'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SyllabusUploader;