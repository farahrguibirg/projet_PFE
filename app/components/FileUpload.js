// components/FileUpload.js
'use client';

import { useState, useRef } from 'react';
import { Upload as UploadIcon, CloudUpload } from '@mui/icons-material';

export default function FileUpload({ 
  onUpload, 
  accept = ".xlsx, .xls", 
  loading = false,
  title = "Import data",
  description = "Drag & drop a file or click to browse"
}) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage('');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }
    setMessage('');
    await onUpload(file);
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-md p-8 rounded-xl bg-white shadow-2xl border border-gray-100 transform transition-all hover:shadow-xl">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
          <CloudUpload className="text-2xl" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>

      <div
        onClick={handleContainerClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300 ${
          dragging 
            ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-inner' 
            : file 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        {file ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <UploadIcon className="text-xl" />
              </div>
            </div>
            <p className="text-gray-700 font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="mt-2 text-sm text-red-500 hover:text-red-700"
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <div className={`mb-4 mx-auto flex items-center justify-center w-16 h-16 rounded-full ${
              dragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            } transition-colors`}>
              <UploadIcon className="text-3xl" />
            </div>
            <p className="text-gray-600 mb-1">{description}</p>
            <p className="text-sm text-gray-400">Supports: {accept}</p>
            {dragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-50 rounded-lg">
                <div className="p-3 bg-white rounded-md shadow-sm border border-blue-100">
                  Drop your file here
                </div>
              </div>
            )}
          </>
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          accept={accept} 
          onChange={handleFileChange} 
          className="hidden" 
          id="fileInput" 
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        className={`mt-6 w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
          loading || !file
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Upload File'
        )}
      </button>

      {message && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {message}
        </div>
      )}
    </div>
  );
}