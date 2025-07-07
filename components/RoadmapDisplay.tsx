
import React, { useState, useEffect, useMemo } from 'react';
import { Roadmap } from '../types';
import ModuleTimelineNode from './ModuleAccordion';
import { CalendarIcon, SparklesIcon, CheckCircleIcon } from './icons';

interface RoadmapDisplayProps {
  data: Roadmap;
}

const ProgressTracker = ({ progress, completed, total }: { progress: number, completed: number, total: number }) => (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200/50 mb-8 sticky top-24 z-10">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-800">Your Progress</h3>
            <span className="font-bold text-blue-600">{completed} / {total} Topics Completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    </div>
);

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ data }) => {
  const [roadmapState, setRoadmapState] = useState<Roadmap | null>(null);

  useEffect(() => {
    if (data) {
      // Initialize state from props, adding 'completed' field to each topic
      const initialState = {
        ...data,
        modules: data.modules.map(module => ({
          ...module,
          topics: module.topics.map(topic => ({
            ...topic,
            completed: topic.completed || false,
          })),
        })),
      };
      setRoadmapState(initialState);
    }
  }, [data]);

  const handleTopicToggle = (moduleIndex: number, topicIndex: number) => {
    setRoadmapState(prevState => {
      if (!prevState) return null;

      const newModules = [...prevState.modules];
      const topic = newModules[moduleIndex].topics[topicIndex];
      newModules[moduleIndex].topics[topicIndex] = { ...topic, completed: !topic.completed };
      
      return { ...prevState, modules: newModules };
    });
  };

  const { progress, completedCount, totalTopics } = useMemo(() => {
    if (!roadmapState) return { progress: 0, completedCount: 0, totalTopics: 0 };

    const allTopics = roadmapState.modules.flatMap(m => m.topics);
    const completed = allTopics.filter(t => t.completed).length;
    const total = allTopics.length;
    const prog = total > 0 ? (completed / total) * 100 : 0;

    return { progress: prog, completedCount: completed, totalTopics: total };
  }, [roadmapState]);

  const accentColors = ['#3b82f6', '#10b981', '#ec4899', '#f97316', '#8b5cf6', '#d946ef'];

  if (!roadmapState) {
    return null; // Or a loading indicator
  }

  const { courseDetails, modules, studyTimeline } = roadmapState;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-fade-in">
      {/* Course Overview */}
      <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200/50 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-3 shadow-lg">
                  <SparklesIcon className="w-8 h-8" />
              </div>
              <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{courseDetails.courseTitle}</h1>
                  <p className="text-md text-gray-500 font-medium">{courseDetails.courseCode} | {courseDetails.credits} | {courseDetails.duration}</p>
              </div>
          </div>
          <p className="text-gray-700 text-lg">{courseDetails.description}</p>
        </div>
      </section>

      {/* Progress Tracker */}
      {totalTopics > 0 && <ProgressTracker progress={progress} completed={completedCount} total={totalTopics} />}


      {/* Modules Timeline Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Learning Roadmap</h2>
        <div className="relative before:absolute before:top-0 before:left-4 before:h-full before:w-1 before:bg-blue-200 before:rounded">
          {modules.map((module, index) => (
            <ModuleTimelineNode 
                key={index} 
                module={module} 
                index={index}
                isLast={index === modules.length - 1} 
                onTopicToggle={handleTopicToggle}
                accentColor={accentColors[index % accentColors.length]}
            />
          ))}
        </div>
      </section>
      
      {/* Study Timeline Section */}
      <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200/50">
        <div className="flex items-center gap-4 text-gray-800 mb-4">
            <div className="flex-shrink-0 bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-xl p-3 shadow-lg">
              <CalendarIcon className="w-7 h-7"/>
            </div>
            <h2 className="text-2xl font-bold">{studyTimeline.title}</h2>
        </div>
        <ul className="space-y-3 text-gray-700">
          {studyTimeline.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0"/>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default RoadmapDisplay;