const { useState, useCallback, useEffect, useReducer } = React;
const { auth, db } = window;

// Simple fallback auth for testing if Firebase fails
const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: (email, password) => {
    return Promise.resolve({ user: { uid: 'mock-user', email } });
  },
  createUserWithEmailAndPassword: (email, password) => {
    return Promise.resolve({ user: { uid: 'mock-user', email } });
  },
  signOut: () => {
    return Promise.resolve();
  },
  onAuthStateChanged: (callback) => {
    // Mock implementation - just call callback with null initially
    setTimeout(() => callback(null), 100);
    return () => {}; // unsubscribe function
  }
};

// Use Firebase auth if available, otherwise use mock
const authService = (typeof auth !== 'undefined' && auth) ? auth : mockAuth;

function Loader({ message }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
}

function ErrorDisplay({ message }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
      <p className="font-medium">Error:</p>
      <p>{message}</p>
    </div>
  );
}

function SyllabusUploader({ onGenerate, isLoading }) {
  const [syllabusText, setSyllabusText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return;

    const fileType = uploadedFile.type;
    const fileName = uploadedFile.name.toLowerCase();

    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      // Handle TXT files
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => setSyllabusText(e.target.result);
      reader.readAsText(uploadedFile);
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // Handle PDF files - we'll send them directly to Gemini
      setFile(uploadedFile);
      setSyllabusText(''); // Clear text area when PDF is uploaded
    } else {
      alert('Please upload a valid text file (.txt) or PDF file (.pdf)');
    }
  };

  const handleFileInputChange = (event) => {
    const uploadedFile = event.target.files[0];
    handleFileUpload(uploadedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const uploadedFile = e.dataTransfer.files[0];
    handleFileUpload(uploadedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if we have either text content or a file
    if (!syllabusText.trim() && !file) {
      alert('Please enter syllabus content or upload a file');
      return;
    }

    setLoading(true);
    try {
      if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
        // Handle PDF file - send directly to Gemini
        await handlePDFGeneration(file);
      } else {
        // Handle text content
        await onGenerate(syllabusText);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePDFGeneration = async (pdfFile) => {
    try {
      // Convert PDF to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfFile);
      });

      // Send PDF directly to Gemini via our API
      const response = await fetch(`${window.API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mimeType: 'application/pdf',
          base64: base64,
          prompt: `Extract the syllabus content from this PDF and generate a comprehensive learning roadmap. 
                   Analyze the course structure, topics, and learning objectives to create an interactive roadmap 
                   with modules and topics that students can track their progress through.
                   
                   For each topic, please provide curated resources including:
                   1. Relevant YouTube video tutorials (prefer popular Indian educational channels like CodeWithHarry, Apna College, Chai aur Code, etc.)
                   2. Reading materials, documentation, and tutorial links
                   3. Practice resources and exercises when applicable
                   
                   CRITICAL: For YouTube videos, provide REAL working URLs with actual video IDs. 
                   Do NOT use placeholder URLs like "youtube.com/watch?v=..." 
                   Either provide real educational video URLs or omit the resource if no specific video is known.
                   
                   Return the response in this exact JSON format:
                   {
                     "courseDetails": {
                       "courseTitle": "Course Name",
                       "description": "Course description",
                       "duration": "Duration estimate",
                       "difficulty": "Beginner/Intermediate/Advanced"
                     },
                     "modules": [
                       {
                         "title": "Module Title",
                         "description": "Module description",
                         "topics": [
                           {
                             "title": "Topic Title",
                             "description": "Topic description",
                             "completed": false,
                             "estimatedTime": "3 Hours",
                             "keyConcepts": "List key concepts covered in this topic",
                             "resources": [
                               {
                                 "type": "video",
                                 "title": "Video Title",
                                 "description": "Comprehensive video covering the basics and fundamentals",
                                 "url": "https://youtube.com/watch?v=...",
                                 "channel": "Channel Name (e.g., CodeWithHarry, Apna College)",
                                 "icon": "youtube"
                               },
                               {
                                 "type": "reading",
                                 "title": "Reading Material Title",
                                 "description": "Detailed article explaining fundamental concepts",
                                 "url": "https://example.com/article",
                                 "source": "Source website",
                                 "icon": "link"
                               }
                             ]
                           }
                         ]
                       }
                     ]
                   }`,
          userId: 'mock-user' // We'll use mock user for now since we have fallback auth
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const data = await response.json();
      
      // Parse the roadmap data and call the onGenerate callback with the parsed data
      if (data.text) {
        const roadmapData = JSON.parse(data.text);
        // Show success message for PDF
        const courseName = roadmapData.courseDetails?.courseTitle || 'Course';
        alert(`🎉 "${courseName}" roadmap created successfully from PDF! You can now track your progress.`);
        
        // Call the parent's onGenerate function but pass the roadmap data directly
        onGenerate(null, roadmapData); // Pass null for text, and the roadmap data
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF. Please try again or convert to text format.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Upload Syllabus PDF</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              dragOver 
                ? 'border-blue-400 bg-blue-50/50' 
                : file 
                  ? 'border-green-400 bg-green-50/50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept=".txt,.pdf,text/plain,application/pdf"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-upload"
            />
            
            <div className="space-y-4">
              {/* Upload Icon */}
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              {file ? (
                <div>
                  <p className="text-green-600 font-medium">✓ {file.name}</p>
                  {file.type === 'application/pdf' && (
                    <p className="text-blue-600 text-sm">📄 PDF will be processed directly by AI</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-lg">
                    <span className="text-blue-600 font-medium cursor-pointer hover:underline">Click to upload</span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </p>
                  <p className="text-gray-500 text-sm">Syllabus in PDF format</p>
                </div>
              )}
            </div>
          </div>

          {/* Text Input Alternative */}
          <div className="text-center text-gray-500">
            <span>or</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste syllabus content:
            </label>
            <textarea
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="Paste your syllabus content here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              disabled={file && file.type === 'application/pdf'}
            />
            {syllabusText && (
              <p className="mt-2 text-sm text-gray-600">
                Content length: {syllabusText.length} characters
              </p>
            )}
            {file && file.type === 'application/pdf' && (
              <p className="mt-2 text-sm text-gray-500">
                Text input is disabled when a PDF is uploaded. Remove the PDF to enable text input.
              </p>
            )}
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={loading || (!syllabusText.trim() && !file)}
            className="w-full px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg flex items-center justify-center transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                {file && file.type === 'application/pdf' ? 'Processing PDF...' : 'Generating Roadmap...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Learning Roadmap
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function ResourceCard({ resource }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-2">{resource.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Access Resource
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}

function ModuleNode({ module, index, onToggle, accentColor }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const completedTopics = module.topics?.filter(topic => topic.completed).length || 0;
  const totalTopics = module.topics?.length || 0;
  const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
      {/* Module Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{module.title}</h3>
              <p className="text-gray-600 text-sm">{module.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">
                {completedTopics}/{totalTopics} completed
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <svg 
              className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Module Content */}
      {isExpanded && module.topics && (
        <div className="border-t border-gray-100">
          {/* Learning Objectives */}
          <div className="p-6 bg-blue-50/50">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800">Learning Objectives</h4>
            </div>
            <ul className="space-y-2 ml-8">
              <li className="text-gray-700 text-sm">• Understand the fundamental concepts covered in this module</li>
              <li className="text-gray-700 text-sm">• Apply the learned concepts through practical exercises</li>
              <li className="text-gray-700 text-sm">• Master the key skills and techniques presented</li>
            </ul>
          </div>

          {/* Topics */}
          <div className="p-6 space-y-4">
            {module.topics.map((topic, topicIndex) => (
              <div 
                key={topicIndex}
                className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                  topic.completed 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
                onClick={() => onToggle && onToggle(index, topicIndex)}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-1 ${
                    topic.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    {topic.completed && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Topic Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${topic.completed ? 'text-green-800' : 'text-gray-900'}`}>
                        {topic.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Est. Time: {topic.estimatedTime || '3 Hours'}
                      </div>
                    </div>
                    <p className={`text-sm mb-3 ${topic.completed ? 'text-green-700' : 'text-gray-600'}`}>
                      {topic.description}
                    </p>
                    
                    {/* Key Concepts */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Key Concepts</h5>
                      <p className="text-sm text-gray-600">
                        {topic.keyConcepts || 'Core programming fundamentals, syntax understanding, practical implementation techniques'}
                      </p>
                    </div>

                    {/* Curated Resources */}
                    {topic.resources && topic.resources.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-800 mb-3">Curated Resources</h5>
                        <div className="space-y-3">
                          {topic.resources.map((resource, resourceIndex) => {
                            // Fix common URL issues
                            let cleanUrl = resource.url || '';
                            
                            // Fix YouTube URLs with placeholder IDs
                            if (cleanUrl.includes('youtube.com/watch?v=...') || cleanUrl.includes('youtu.be/...')) {
                              console.warn('Found placeholder YouTube URL, skipping:', cleanUrl);
                              return null; // Skip invalid YouTube URLs
                            }
                            
                            // Ensure URL has protocol
                            if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                              cleanUrl = 'https://' + cleanUrl;
                            }
                            
                            // Skip if no valid URL
                            if (!cleanUrl || cleanUrl === 'https://') {
                              console.warn('Invalid URL found, skipping resource:', resource.title);
                              return null;
                            }
                            
                            return (
                              <a 
                                key={resourceIndex} 
                                href={cleanUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                                onClick={(e) => {
                                  // Additional validation on click
                                  if (cleanUrl.includes('...') || !cleanUrl.startsWith('http')) {
                                    e.preventDefault();
                                    alert('This link appears to be a placeholder. Please search for the actual resource online.');
                                    return false;
                                  }
                                }}
                              >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                resource.type === 'video' || resource.icon === 'youtube'
                                  ? 'bg-red-100' 
                                  : 'bg-blue-100'
                              }`}>
                                {resource.type === 'video' || resource.icon === 'youtube' ? (
                                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {resource.title}
                                </h6>
                                <p className="text-sm text-gray-600 mb-1">{resource.description}</p>
                                <p className="text-xs text-gray-500">
                                  {resource.channel || resource.source || 'Educational Resource'}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </a>
                            );
                          }).filter(Boolean)} {/* Remove null entries */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RoadmapDisplay({ data, onToggle }) {
  if (!data) return null;

  const { courseDetails, modules } = data;
  
  // Calculate overall progress
  const totalTopics = modules?.reduce((acc, module) => acc + (module.topics?.length || 0), 0) || 0;
  const completedTopics = modules?.reduce((acc, module) => 
    acc + (module.topics?.filter(topic => topic.completed).length || 0), 0) || 0;
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
        <div className="flex items-start space-x-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{courseDetails?.courseTitle}</h1>
            <p className="text-lg opacity-90 mb-2">{courseDetails?.description}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {courseDetails?.duration && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {courseDetails.duration} Lecture Hours
                </span>
              )}
              {courseDetails?.difficulty && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {courseDetails.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
          <span className="text-lg font-medium text-blue-600">
            {completedTopics} / {totalTopics} Topics Completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Learning Roadmap */}
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Learning Roadmap</h2>
        
        {modules && modules.length > 0 && (
          <div className="space-y-6">
            {modules.map((module, index) => (
              <ModuleNode
                key={index}
                module={module}
                index={index}
                onToggle={onToggle}
                accentColor="#3B82F6"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('Attempting to login with email:', email);
      const userCredential = await authService.signInWithEmailAndPassword(email, password);
      console.log('Login successful:', userCredential.user.email);
      onLogin(userCredential.user);
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/configuration-not-found':
          errorMessage = 'Firebase authentication is not properly configured. Please contact support.';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-8">Login</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-8">
          <button type="submit" className="w-full px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

const Register = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      console.log('Attempting to register with email:', email);
      const userCredential = await authService.createUserWithEmailAndPassword(email, password);
      console.log('Registration successful:', userCredential.user.email);
      onRegister(userCredential.user);
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/configuration-not-found':
          errorMessage = 'Firebase authentication is not properly configured. Please contact support.';
          break;
        default:
          errorMessage = error.message || 'Registration failed. Please try again.';
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-8">Register</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      <form onSubmit={handleRegister}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-8">
          <button type="submit" className="w-full px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700">
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

const Courses = ({ user, setView }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    console.log('Loading courses for user:', user.uid);
    console.log('Database available:', Boolean(db));
    
    setLoading(true);
    setError(null);

    // Check if database is available
    if (!db) {
      console.log('Database not available, showing empty state');
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = db.collection('users').doc(user.uid).collection('courses')
        .onSnapshot((snapshot) => {
          console.log('Firestore snapshot received, docs:', snapshot.docs.length);
          const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCourses(coursesData);
          setLoading(false);
        }, (error) => {
          console.error('Firestore error:', error);
          setError('Failed to load courses: ' + error.message);
          setLoading(false);
        });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
      setError('Database connection failed: ' + error.message);
      setLoading(false);
    }
  }, [user]);

  const handleToggle = async (courseId, moduleIndex, topicIndex) => {
    if (!db) {
      console.warn('Database not available for toggle operation');
      return;
    }

    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const updatedModules = [...course.modules];
    const updatedTopics = [...updatedModules[moduleIndex].topics];
    updatedTopics[topicIndex] = {
      ...updatedTopics[topicIndex],
      completed: !updatedTopics[topicIndex].completed
    };
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      topics: updatedTopics
    };

    try {
      const courseRef = db.collection('users').doc(user.uid).collection('courses').doc(courseId);
      await courseRef.update({ modules: updatedModules });
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center">
        <Loader message="Loading your courses..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <ErrorDisplay message={error} />
        <div className="text-center mt-4">
          <p className="text-gray-600 mb-4">Database connection failed. You can still generate new roadmaps.</p>
          <button
            onClick={() => setView('generate')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Generate New Roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Courses</h2>
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Refresh
          </button>
          <button
            onClick={() => setView('generate')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Generate New Roadmap
          </button>
        </div>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6">You haven't generated any roadmaps yet. Start by uploading a syllabus!</p>
            <button
              onClick={() => setView('generate')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Your First Roadmap
            </button>
          </div>
        </div>
      ) : (
        courses.map(course => (
          <div key={course.id} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">{course.courseDetails.courseTitle}</h3>
            <RoadmapDisplay data={course} onToggle={(mi, ti) => handleToggle(course.id, mi, ti)} />
          </div>
        ))
      )}
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login');
  const [roadmapData, setRoadmapData] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      
      // Test API connection when user logs in
      if (user && window.API_BASE) {
        fetch(`${window.API_BASE}/api/health`)
          .then(res => res.json())
          .then(data => console.log('API Health Check:', data))
          .catch(err => console.error('API Health Check Failed:', err));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    console.log('Login successful, user:', user);
    console.log('API_BASE:', window.API_BASE);
    setUser(user);
    setView('courses');
  };

  const handleRegister = (user) => {
    setUser(user);
    setView('courses');
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
    setView('login');
    setRoadmapData(null);
  };

  const handleGenerate = async (syllabusText, roadmapData = null) => {
    try {
      let data;
      
      if (roadmapData) {
        // PDF was already processed, use the provided roadmap data
        data = roadmapData;
      } else {
        // Process text content through the Gemini API
        const response = await fetch(`${window.API_BASE}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mimeType: 'text/plain',
            base64: btoa(syllabusText), // Convert text to base64
            prompt: `Generate a comprehensive learning roadmap from this syllabus text. 
                     Analyze the course structure, topics, and learning objectives to create an interactive roadmap 
                     with modules and topics that students can track their progress through.
                     
                     For each topic, please provide curated resources including:
                     1. Relevant YouTube video tutorials (prefer Indian educational channels like CodeWithHarry, Apna College, etc.)
                     2. Reading materials and documentation links
                     3. Practice resources when applicable
                     
                     CRITICAL: For YouTube videos, provide REAL working URLs with actual video IDs. 
                     Do NOT use placeholder URLs like "youtube.com/watch?v=..." 
                     Either provide real educational video URLs or omit the resource if no specific video is known.
                     
                     Return the response in this exact JSON format:
                     {
                       "courseDetails": {
                         "courseTitle": "Course Name",
                         "description": "Course description", 
                         "duration": "Duration estimate",
                         "difficulty": "Beginner/Intermediate/Advanced"
                       },
                       "modules": [
                         {
                           "title": "Module Title",
                           "description": "Module description",
                           "topics": [
                             {
                               "title": "Topic Title",
                               "description": "Topic description", 
                               "completed": false,
                               "estimatedTime": "3 Hours",
                               "keyConcepts": "List key concepts covered in this topic",
                               "resources": [
                                 {
                                   "type": "video",
                                   "title": "Video Title",
                                   "description": "Video description",
                                   "url": "https://youtube.com/watch?v=...",
                                   "channel": "Channel Name (e.g., CodeWithHarry, Apna College)",
                                   "icon": "youtube"
                                 },
                                 {
                                   "type": "reading",
                                   "title": "Reading Material Title",
                                   "description": "Article or documentation description",
                                   "url": "https://example.com/article",
                                   "source": "Source website",
                                   "icon": "link"
                                 }
                               ]
                             }
                           ]
                         }
                       ]
                     }`,
            userId: user ? user.uid : 'mock-user'
          })
        });

        if (!response.ok) throw new Error('Failed to generate roadmap');

        const result = await response.json();
        data = JSON.parse(result.text);
      }
      
      setRoadmapData(data);

      // Show success message
      const courseName = data.courseDetails?.courseTitle || 'Course';
      alert(`🎉 "${courseName}" roadmap created successfully! You can now track your progress.`);

      if (user && db) {
        try {
          await db.collection('users').doc(user.uid).collection('courses').add(data);
          console.log('Course saved to database successfully');
        } catch (dbError) {
          console.log('Could not save to database (using fallback auth):', dbError);
          // Continue without saving to DB when using fallback auth
        }
      }

      // Redirect to roadmap view
      setView('roadmap');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('❌ Failed to generate roadmap. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-cyan-200 flex items-center justify-center">
        <Loader message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-cyan-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Learning Roadmap Generator</h1>
            <p className="text-gray-700">Transform your syllabus into an interactive roadmap</p>
          </div>
          
          <div className="mb-6 flex justify-center space-x-4">
            <button
              onClick={() => setView('login')}
              className={`px-4 py-2 rounded-lg font-medium ${
                view === 'login' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setView('register')}
              className={`px-4 py-2 rounded-lg font-medium ${
                view === 'register' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Register
            </button>
          </div>

          {view === 'login' ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Register onRegister={handleRegister} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-cyan-200">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI Learning Roadmap Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setView('courses')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  view === 'courses' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                My Courses
              </button>
              <button
                onClick={() => setView('generate')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  view === 'generate' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                Generate New
              </button>
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        {view === 'courses' && <Courses user={user} setView={setView} />}
        {view === 'generate' && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Learning Roadmap Generator</h1>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">From Syllabus to Complete Study Plan</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Upload your course syllabus PDF. Our AI will analyze it and generate a detailed learning roadmap with curated resources to guide your studies.
              </p>
            </div>
            <SyllabusUploader onGenerate={handleGenerate} />
            <div className="mt-8 text-center">
              <p className="text-gray-600">Project By: <span className="text-blue-600 font-medium">Shubh Pratap Singh</span></p>
            </div>
          </div>
        )}
        {view === 'roadmap' && roadmapData && (
          <div className="max-w-4xl mx-auto">
            <RoadmapDisplay data={roadmapData} />
          </div>
        )}
      </main>
    </div>
  );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// Add error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: { padding: '20px', backgroundColor: '#fee', border: '1px solid #fcc' }
      }, [
        React.createElement('h2', { key: 'title' }, 'Something went wrong'),
        React.createElement('p', { key: 'message' }, this.state.error?.message || 'Unknown error'),
        React.createElement('button', {
          key: 'reload',
          onClick: () => window.location.reload(),
          style: { padding: '10px', marginTop: '10px' }
        }, 'Reload Page')
      ]);
    }

    return this.props.children;
  }
}

try {
  console.log('Attempting to render React app...');
  root.render(
    React.createElement(React.StrictMode, null, 
      React.createElement(ErrorBoundary, null,
        React.createElement(App)
      )
    )
  );
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to render React app:', error);
  // Fallback rendering
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; background-color: #fee; border: 1px solid #fcc; margin: 20px;">
      <h2>App Failed to Load</h2>
      <p>Error: ${error.message}</p>
      <button onclick="window.location.reload()">Reload Page</button>
    </div>
  `;
}


