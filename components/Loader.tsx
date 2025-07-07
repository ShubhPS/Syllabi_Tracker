
import React from 'react';
import { SparklesIcon } from './icons';

const Loader = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-lg shadow-md">
      <SparklesIcon className="w-12 h-12 text-blue-500 animate-pulse" />
      <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>
      <p className="text-sm text-gray-500">Please wait a moment...</p>
    </div>
  );
};

export default Loader;
