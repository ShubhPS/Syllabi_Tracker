// Pure browser ESM version (no bundler)
// Requires: <script>window.GEMINI_API_KEY = '...'</script> in index.html
// Usage: window.generateRoadmapFromSyllabus(file)

// Browser now calls your backend; no key in the client.

function getTypeDefinition() {
  return `
  interface Resource {
    title: string;
    searchQuery: string;
    type: 'YouTube' | 'Website' | 'Playlist';
    description: string;
    channel?: string;
    url?: string;
  }

  interface Topic {
    title: string;
    keyConcepts: string[];
    estimatedTime: string;
    resources: Resource[];
  }

  interface Module {
    title: string;
    topics: Topic[];
    learningObjectives: string[];
  }

  interface CourseDetails {
    courseTitle: string;
    courseCode: string;
    credits: string;
    duration: string;
    description: string;
  }
  
  interface StudyTimeline {
    title: string;
    recommendations: string[];
  }

  interface Roadmap {
    courseDetails: CourseDetails;
    modules: Module[];
    studyTimeline: StudyTimeline;
  }
`;
}

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = (e) => reject(e);
});

export async function generateRoadmapFromSyllabus(syllabusFile) {
  const base64File = await fileToBase64(syllabusFile);
  const prompt = `
    You are an intelligent academic assistant. Your task is to process the content of a college course syllabus PDF and generate a comprehensive, highly relevant learning roadmap.

    **CRITICAL RULE: RELEVANCE IS PARAMOUNT.** Analyze the provided syllabus file to extract the core course information. Keep topics tightly scoped to the syllabus.

    Instructions:
    1. Analyze Syllabus Content and extract details.
    2. Create Focused Modules with learning objectives.
    3. Identify Relevant Topics with key concepts and estimated time.
    4. Curate Highly-Relevant Resources: provide 2-3 resources per topic.
       - Provide a direct url when available; otherwise provide a searchQuery.
       - YouTube: prefer Indian channels (NPTEL, Gate Smasher, CodeWithHarry, Apna College). Include channel.
       - Website: prefer GeeksForGeeks, freeCodeCamp, Javatpoint, MDN.
    5. Develop a Study Timeline with weekly recommendations.
    6. Output strictly as a single JSON object conforming to the types below.

    TypeScript Interface for the output JSON:
    ${getTypeDefinition()}

    Begin JSON output now:
  `;

  // Auto-detect API base URL
  const API_BASE = window.API_BASE || 
    (window.location.hostname === 'localhost' ? 'http://localhost:5179' : window.location.origin);
  
  const resp = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mimeType: syllabusFile.type, base64: base64File, prompt })
  });
  if (!resp.ok) throw new Error('Server generation failed');
  const { text } = await resp.json();
  if (!text) throw new Error('No text response from server');
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) jsonStr = match[2].trim();
  const parsed = JSON.parse(jsonStr);
  if (!parsed.courseDetails || !parsed.modules || !parsed.studyTimeline) throw new Error('Invalid JSON structure');
  return parsed;
}

// Expose globally for the JSX app
window.generateRoadmapFromSyllabus = generateRoadmapFromSyllabus;


