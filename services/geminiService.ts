import { GoogleGenAI } from "@google/genai";
import { Roadmap } from '../types';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getTypeDefinition = () => `
  interface Resource {
    title: string;
    searchQuery: string; // IMPORTANT: This must be a concise but specific search query for YouTube or Google.
    type: 'YouTube' | 'Website' | 'Playlist';
    description: string;
    channel?: string; // The name of the YouTube channel if applicable
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

// Helper function to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};


export const generateRoadmapFromSyllabus = async (syllabusFile: File): Promise<Roadmap> => {
  const base64File = await fileToBase64(syllabusFile);

  const filePart = {
    inlineData: {
      mimeType: syllabusFile.type,
      data: base64File,
    },
  };
  
  const prompt = `
    You are an intelligent academic assistant. Your task is to process the content of a college course syllabus PDF and generate a comprehensive, highly relevant learning roadmap.

    **CRITICAL RULE: RELEVANCE IS PARAMOUNT.** Analyze the provided syllabus file to extract the core course information. For every module you generate, you MUST ensure that all of its topics, key concepts, and resource suggestions are **strictly and directly relevant** to the syllabus content. Do not include tangential or overly broad topics. Maintain a tight focus. For example, if the syllabus outlines a module on "Introduction to Sorting Algorithms", all topics must be about specific sorting algorithms mentioned or implied (Bubble Sort, Merge Sort, etc.), and not about general "Data Structures" unless that is the explicit module context.

    Instructions:
    1.  **Analyze Syllabus Content:** Extract the course title, code, credits, duration, and a concise description directly from the provided syllabus file. If some details are not present, make plausible inferences based on the content.
    2.  **Create Focused Modules:** Break the course into a concise set of logical modules (ideally 5-7) based on the syllabus structure (e.g., weekly topics, units). Define clear learning objectives for each that are tightly aligned with the module's content as described in the syllabus.
    3.  **Identify Relevant Topics:** Within each module, list specific topics as outlined in the syllabus. For each topic, identify key concepts and estimate a study time.
    4.  **Curate Highly-Relevant Resources:** For EACH topic, suggest 2-3 educational resources.
        -   **RELEVANCE CHECK:** The \`searchQuery\` for each resource MUST directly address the topic and be highly relevant to the parent module's context.
        -   Instead of a URL, you MUST provide a concise and specific \`searchQuery\` for YouTube or Google.
        -   **YouTube:** Prioritize channels from **India** (e.g., NPTEL, Gate Smasher, CodeWithHarry, Apna College). Example \`searchQuery\`: "Binary Trees in Data Structures by CodeWithHarry". Include the channel name in the \`channel\` field.
        -   **Website:** Prioritize sites like **GeeksForGeeks**, **freeCodeCamp**, **Javatpoint**, and **MDN Web Docs**. Example \`searchQuery\`: "GeeksForGeeks implementation of bubble sort".
    5.  **Develop a Study Timeline:** Suggest a high-level study timeline with weekly recommendations, referencing the module structure from the syllabus.
    6.  **Output Format:** Structure the entire output as a single, valid JSON object that strictly adheres to the following TypeScript interface. Do not include any text, explanations, or markdown fences before or after the JSON object.
zz
    TypeScript Interface for the output JSON:
    ${getTypeDefinition()}

    Begin JSON output now:
  `;
  
  const promptPart = { text: prompt };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [promptPart, filePart],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Lower temperature for more factual, deterministic output from the file
      },
    });
    
    if (!response.text) {
      throw new Error("No text response received from Gemini API.");
    }
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);
    
    // Basic validation to ensure the structure is roughly correct
    if (!parsedData.courseDetails || !parsedData.modules || !parsedData.studyTimeline) {
      throw new Error("Invalid JSON structure received from API.");
    }
    
    return parsedData as Roadmap;

  } catch (error) {
    console.error("Error generating roadmap:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate roadmap from Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the roadmap.");
  }
};