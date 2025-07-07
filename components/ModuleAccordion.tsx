
import React, { useState } from 'react';
import { Module } from '../types';
import { CheckCircleIcon, ChevronDownIcon, ClockIcon, TargetIcon, CheckIcon } from './icons';
import ResourceCard from './ResourceCard';

interface ModuleTimelineNodeProps {
  module: Module;
  index: number;
  isLast: boolean;
  onTopicToggle: (moduleIndex: number, topicIndex: number) => void;
  accentColor: string;
}

const ModuleTimelineNode: React.FC<ModuleTimelineNodeProps> = ({ module, index, onTopicToggle, accentColor }) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <div className="relative pl-12 pb-8">
      {/* Timeline Dot */}
      <div className="absolute left-[3px] top-1 h-8 w-8 bg-white flex items-center justify-center rounded-full z-10">
          <CheckCircleIcon className="w-8 h-8 transition-colors duration-300" style={{ color: accentColor }}/>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 text-left">
            <h3 className="text-xl font-bold text-gray-800">{`Module ${index + 1}: ${module.title}`}</h3>
          </div>
          <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <div className="p-4 md:p-6 bg-white border-l border-r border-b border-gray-200 rounded-b-lg mt-[-1px]">
                    <div className="mb-6 pl-4 border-l-4" style={{ borderColor: accentColor }}>
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                            <TargetIcon className="w-5 h-5" style={{ color: accentColor }}/>
                            <h4 className="font-semibold">Learning Objectives</h4>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {module.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        {module.topics.map((topic, topicIndex) => {
                            const isCompleted = topic.completed;
                            return (
                                <div key={topicIndex} className={`p-4 rounded-xl border transition-all duration-300 ${isCompleted ? 'bg-green-50/70 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-start gap-4">
                                        {/* Custom Checkbox */}
                                        <button 
                                            onClick={() => onTopicToggle(index, topicIndex)}
                                            className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${isCompleted ? 'border-transparent' : 'border-gray-400 hover:border-gray-600'}`}
                                            style={{ backgroundColor: isCompleted ? accentColor : 'transparent' }}
                                            aria-label={`Mark ${topic.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                                        >
                                            {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
                                        </button>

                                        {/* Topic Details */}
                                        <div className="flex-1">
                                            <h5 className={`font-bold text-gray-900 transition-all ${isCompleted ? 'line-through text-gray-500' : ''}`}>{topic.title}</h5>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>Est. Time: {topic.estimatedTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={`pl-10 mt-4`}>
                                        <div className="pl-4 border-l-2 border-gray-300 mb-4">
                                            <h6 className="font-semibold text-gray-700 text-sm mb-1">Key Concepts</h6>
                                            <p className="text-sm text-gray-600">{topic.keyConcepts.join(', ')}</p>
                                        </div>

                                        <div>
                                            <h6 className="font-semibold text-gray-700 text-sm mb-2">Curated Resources</h6>
                                            <div className="space-y-3">
                                                {topic.resources.map((resource, resIndex) => (
                                                    <ResourceCard key={resIndex} resource={resource} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleTimelineNode;
