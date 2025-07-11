
import React, { useState, useCallback } from 'react';
import SyllabusUploader from './components/SyllabusUploader';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import RoadmapDisplay from './components/RoadmapDisplay';
import { generateRoadmapFromSyllabus } from './services/geminiService';
import { Roadmap } from './types';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<Roadmap | null>(null);

  const handleGenerateRoadmap = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setRoadmapData(null);
    try {
      const data = await generateRoadmapFromSyllabus(file);
      setRoadmapData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 font-sans text-gray-900">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
            <SparklesIcon className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 mr-3"/>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">AI Learning Roadmap Generator</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">From Syllabus to Complete Study Plan</h2>
            <p className="mt-4 text-xl text-gray-600">
                Upload your course syllabus PDF. Our AI will analyze it and generate a detailed learning roadmap with curated resources to guide your studies.
            </p>
        </div>
        
        {!roadmapData && (
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <SyllabusUploader onGenerate={handleGenerateRoadmap} isLoading={isLoading} />
            </div>
        )}

        <div className="mt-12">
            {isLoading && <Loader message="Analyzing syllabus and building your custom roadmap..." />}
            {error && <ErrorDisplay message={error} />}
            {roadmapData && <RoadmapDisplay data={roadmapData} />}
        </div>
      </main>
      
      <footer className="text-center py-8 border-t border-gray-200/80 mt-16">
        <div className="flex items-center justify-center space-x-2">
          <p className="text-sm text-gray-500">Project By:</p>
          <a 
            href="https://github.com/ShubhPS" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline"
          >
            Shubh Pratap Singh
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;