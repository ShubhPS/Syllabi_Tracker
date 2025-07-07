export interface Resource {
  title: string;
  searchQuery: string; // Changed from url
  type: 'YouTube' | 'Website' | 'Playlist';
  description: string;
  channel?: string; // For YouTube videos
}

export interface Topic {
  title: string;
  keyConcepts: string[];
  estimatedTime: string;
  resources: Resource[];
  completed?: boolean;
}

export interface Module {
  title: string;
  topics: Topic[];
  learningObjectives: string[];
}

export interface CourseDetails {
  courseTitle: string;
  courseCode: string;
  credits: string;
  duration: string;
  description: string;
}

export interface Roadmap {
  courseDetails: CourseDetails;
  modules: Module[];
  studyTimeline: {
    title: string;
    recommendations: string[];
  };
}