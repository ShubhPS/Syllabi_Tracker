const { useState, useCallback, useEffect, useReducer } = React;

function Loader({ message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-lg shadow-md">
      <svg className="w-12 h-12 text-blue-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.5 3L9 7.5l-3 1.5L3 12l1.5 3L6 18l3 1.5L12 21l3-1.5 1.5-3 3-1.5 1.5-3-1.5-3L18 6l-3-1.5Z"/></svg>
      <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>
      <p className="text-sm text-gray-500">Please wait a moment...</p>
    </div>
  );
}

function ErrorDisplay({ message }) {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
      <p className="font-bold">An Error Occurred</p>
      <p>{message}</p>
      <p className="mt-2 text-sm">Please check your network connection or API key and try again.</p>
    </div>
  );
}

function SyllabusUploader({ onGenerate, isLoading }) {
  const [fileName, setFileName] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = React.useRef(null);
  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFileName(f.name); }
  };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === 'application/pdf') {
      fileRef.current.files = e.dataTransfer.files;
      setFileName(f.name);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const f = fileRef.current?.files?.[0];
    if (f) onGenerate(f);
  };
  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Syllabus PDF</label>
            <div
              onDrop={onDrop}
              onDragOver={(e)=>{e.preventDefault(); setIsDragOver(true);}}
              onDragEnter={(e)=>{e.preventDefault(); setIsDragOver(true);}}
              onDragLeave={(e)=>{e.preventDefault(); setIsDragOver(false);}}
              onClick={()=>fileRef.current?.click()}
              className={`flex justify-center w-full px-6 pt-5 pb-6 border-2 ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} border-dashed rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100`}
            >
              <div className="space-y-1 text-center">
                {fileName ? (
                  <>
                    <p className="text-sm text-gray-700 font-medium">{fileName}</p>
                    <p className="text-xs text-gray-500">Click or drag to replace</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">Syllabus in PDF format</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" className="sr-only" accept=".pdf" onChange={onChange}/>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <button type="submit" disabled={!fileName || isLoading} className="w-full px-6 py-3 rounded-lg text-white bg-blue-600 disabled:bg-gray-400">{isLoading ? 'Generating...' : 'Generate Learning Roadmap'}</button>
        </div>
      </form>
    </div>
  );
}

function ResourceCard({ resource }) {
  const isYouTube = resource.type === 'YouTube' || resource.type === 'Playlist';
  const href = resource.url && resource.url.trim() ? resource.url : (isYouTube
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(resource.searchQuery)}`
    : `https://www.google.com/search?q=${encodeURIComponent(resource.searchQuery)}`);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e)=>e.stopPropagation()} className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-400 transition-all group duration-300">
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{resource.title}</p>
            {resource.channel && <p className="text-xs text-gray-500 font-medium">{resource.channel}</p>}
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
            <span>Open</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
      </div>
    </a>
  );
}

function ModuleNode({ module, index, onToggle, accentColor }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  return (
    <div className="relative pl-12 pb-8">
      <div className="absolute left-[3px] top-1 h-8 w-8 bg-white flex items-center justify-center rounded-full z-10">
        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: accentColor }} />
      </div>
      <div className="relative">
        <button onClick={()=>setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 text-left">
            <h3 className="text-xl font-bold text-gray-800">{`Module ${index + 1}: ${module.title}`}</h3>
          </div>
          <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
        </button>
        <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="p-4 md:p-6 bg-white border-l border-r border-b border-gray-200 rounded-b-lg mt-[-1px]">
              <div className="mb-6 pl-4 border-l-4" style={{ borderColor: accentColor }}>
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <h4 className="font-semibold">Learning Objectives</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {module.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
              </div>
              <div className="space-y-4">
                {module.topics.map((topic, topicIndex) => {
                  const isCompleted = !!topic.completed;
                  return (
                    <div key={topicIndex} className={`p-4 rounded-xl border transition-all duration-300 ${isCompleted ? 'bg-green-50/70 border-green-200' : 'bg-gray-50 border-gray-200'} cursor-pointer`} onClick={()=>onToggle(index, topicIndex)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); onToggle(index, topicIndex);}}}>
                      <div className="flex items-start gap-4">
                        <input type="checkbox" checked={isCompleted} onChange={(e)=>{ e.stopPropagation(); onToggle(index, topicIndex); }} className="relative z-10 mt-1 w-5 h-5 rounded border-gray-400 accent-blue-600 cursor-pointer" onClick={(e)=>e.stopPropagation()} />
                        <div className="flex-1">
                          <h5 className={`font-bold text-gray-900 transition-all ${isCompleted ? 'line-through text-gray-500' : ''}`}>{topic.title}</h5>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>Est. Time: {topic.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pl-10 mt-4">
                        <div className="pl-4 border-l-2 border-gray-300 mb-4">
                          <h6 className="font-semibold text-gray-700 text-sm mb-1">Key Concepts</h6>
                          <p className="text-sm text-gray-600">{topic.keyConcepts.join(', ')}</p>
                        </div>
                        <div>
                          <h6 className="font-semibold text-gray-700 text-sm mb-2">Curated Resources</h6>
                          <div className="space-y-3">
                            {topic.resources.map((r, i) => <ResourceCard key={i} resource={r} />)}
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
}

function RoadmapDisplay({ data }) {
  function reducer(state, action) {
    switch(action.type){
      case 'SET': return action.payload;
      case 'TOGGLE': {
        const { mi, ti } = action;
        return {
          ...state,
          modules: state.modules.map((m, i)=> i!==mi ? m : ({ ...m, topics: m.topics.map((t, j)=> j!==ti ? t : ({ ...t, completed: !t.completed })) }))
        };
      }
      default: return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, null);
  useEffect(()=>{
    if (data){
      const normalized = { ...data, modules: data.modules.map(m=>({ ...m, topics: m.topics.map(t=>({ ...t, completed: !!t.completed })) })) };
      dispatch({ type: 'SET', payload: normalized });
    }
  }, [data]);
  const onToggle = (mi, ti) => dispatch({ type: 'TOGGLE', mi, ti });
  if (!state) return null;
  const allTopics = state.modules.flatMap(m=>m.topics);
  const completed = allTopics.filter(t=>t.completed).length;
  const total = allTopics.length;
  const progress = total ? (completed/total)*100 : 0;
  const accent = ['#3b82f6','#10b981','#ec4899','#f97316','#8b5cf6','#d946ef'];
  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-fade-in">
      <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200/50 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-3 shadow-lg"></div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{state.courseDetails.courseTitle}</h1>
              <p className="text-md text-gray-500 font-medium">{state.courseDetails.courseCode} | {state.courseDetails.credits} | {state.courseDetails.duration}</p>
            </div>
          </div>
          <p className="text-gray-700 text-lg">{state.courseDetails.description}</p>
        </div>
      </section>
      {total>0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-gray-800">Your Progress</h3>
            <span className="font-bold text-blue-600 text-lg">{completed} / {total} Topics Completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-6 rounded-full transition-all duration-700 ease-out relative" style={{ width: `${progress}%` }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">{progress>0 ? `${progress.toFixed(1)}% Complete` : 'Start checking off topics to track your progress!'}</div>
        </div>
      )}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Learning Roadmap</h2>
        <div className="relative before:absolute before:top-0 before:left-4 before:h-full before:w-1 before:bg-blue-200 before:rounded before:pointer-events-none">
          {state.modules.map((m,i)=> (
            <ModuleNode key={i} module={m} index={i} onToggle={onToggle} accentColor={accent[i % accent.length]} />
          ))}
        </div>
      </section>
      <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200/50">
        <div className="flex items-center gap-4 text-gray-800 mb-4"><h2 className="text-2xl font-bold">{state.studyTimeline.title}</h2></div>
        <ul className="space-y-3 text-gray-700">
          {state.studyTimeline.recommendations.map((rec,i)=>(
            <li key={i} className="flex items-start gap-3"><span className="w-5 h-5 text-green-500 mt-1">✔</span><span>{rec}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function App(){
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const generate = useCallback(async (file)=>{
    setIsLoading(true); setError(null); setData(null);
    try{
      const d = await window.generateRoadmapFromSyllabus(file);
      setData(d);
    }catch(e){ setError(e.message || 'Failed'); }
    finally{ setIsLoading(false); }
  },[]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 font-sans text-gray-900">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">AI Learning Roadmap Generator</h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">From Syllabus to Complete Study Plan</h2>
          <p className="mt-4 text-xl text-gray-600">Upload your course syllabus PDF. Our AI will analyze it and generate a detailed learning roadmap with curated resources to guide your studies.</p>
        </div>
        {!data && <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}><SyllabusUploader onGenerate={generate} isLoading={isLoading}/></div>}
        <div className="mt-12">
          {isLoading && <Loader message="Analyzing syllabus and building your custom roadmap..."/>}
          {error && <ErrorDisplay message={error}/>} 
          {data && <RoadmapDisplay data={data}/>} 
        </div>
      </main>
      <footer className="text-center py-8 border-t border-gray-200/80 mt-16">
        <div className="flex items-center justify-center space-x-2">
          <p className="text-sm text-gray-500">Project By:</p>
          <a href="https://github.com/ShubhPS" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">Shubh Pratap Singh</a>
        </div>
      </footer>
    </div>
  );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(React.StrictMode, null, React.createElement(App)));


