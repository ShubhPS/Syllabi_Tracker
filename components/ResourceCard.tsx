import React from 'react';
import { Resource } from '../types';
import { YoutubeIcon, LinkIcon, SearchIcon } from './icons';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const isYouTube = resource.type === 'YouTube' || resource.type === 'Playlist';
  const Icon = isYouTube ? YoutubeIcon : LinkIcon;
  const iconColor = isYouTube ? 'text-red-600' : 'text-sky-600';

  const searchUrl = isYouTube
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(resource.searchQuery)}`
    : `https://www.google.com/search?q=${encodeURIComponent(resource.searchQuery)}`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-400 transition-all group duration-300"
      title={`Search for: ${resource.title}`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-1 ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-5 h-5 flex-shrink-0" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {resource.title}
              </p>
              {resource.channel && (
                <p className="text-xs text-gray-500 font-medium">{resource.channel}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                <span>Search</span>
                <SearchIcon className="w-3 h-3" />
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
        </div>
      </div>
    </a>
  );
};

export default ResourceCard;