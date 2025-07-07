
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
      <p className="font-bold">An Error Occurred</p>
      <p>{message}</p>
      <p className="mt-2 text-sm">Please check your network connection or API key and try again.</p>
    </div>
  );
};

export default ErrorDisplay;
