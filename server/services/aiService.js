import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client safely
let ai = null;
const API_KEY = process.env.AI_API_KEY;

if (API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log('Gemini AI Client successfully configured.');
    } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err.message);
    }
} else {
    console.warn('WARNING: AI_API_KEY environment variable is not defined. The app will run using high-fidelity local AI simulation backups.');
}

// Helper to run LLM requests or fallback
const runPrompt = async (systemInstruction, promptText) => {
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: promptText,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7
                }
            });
            return response.text;
        } catch (error) {
            console.error('Gemini error:', error.message);
            // Fall through to fallback simulation logic under error
        }
    }
    return null;
};

// 1. Analyze diagnostic test
export const analyzeAssessmentResults = async (assessmentLogs) => {
    const prompt = `Student has completed a diagnostic quiz with following results:
${JSON.stringify(assessmentLogs, null, 2)}
Provide a short, supportive summary (1-2 sentences) of their current strengths and primary weak spots. Be encouraging.`;

    const system = "You are an expert technical placement mentor. Summarize performance simply, focusing on strengths and weaknesses.";

    const res = await runPrompt(system, prompt);
    if (res) return res;

    // Fallback Simulation logic:
    const corrects = assessmentLogs.filter(q => q.isCorrect).length;
    const incorrects = assessmentLogs.length - corrects;

    if (corrects >= 8) {
        return "You have an excellent grasp of these topics! Your foundational coding structures look solid. A bit more practice on advanced Graph models will push you to high readiness.";
    } else if (corrects >= 5) {
        return "Nice effort. You have a solid foundation in basic Arrays and Strings, but traversal logic in Trees and Dynamic Programming require targeted focus next.";
    } else {
        return "You're off to a good start. Set your foundation first by practicing basic search, sorting, and Arrays before moving to complex Trees or Dynamic Programming.";
    }
};

// 2. Analyze user coding file
export const analyzeSolutionCode = async (code, problemTitle, language) => {
    const prompt = `Review this solution code for problem "${problemTitle}" in "${language}":
\`\`\`${language}
${code}
\`\`\`
Provide a concise structured review. Address: Correctness, Time/Space Complexity, and a clean tip for optimization. Keep it short.`;

    const system = "You are a senior technical interviewer. Provide clean, concise reviews without conversational fluff.";

    const res = await runPrompt(system, prompt);
    if (res) return res;

    // Fallback Simulation logic:
    const hasBigO = code.includes('for') || code.includes('while') ? 'O(N)' : 'O(1)';
    return `### AI Solution Review: "${problemTitle}" (${language})

- **Time Complexity:** Projected at ${hasBigO} based on loop traversals.
- **Space Complexity:** Projected at O(1) auxiliary space.
- **Code Quality:** Structure looks straightforward. Variable names are readable.
- **Tip:** Consider checking empty boundary checks or corner null cases if the problem involves Linked Lists or Array bounds.`;
};

// 3. Escalating Hint system (1 to 6)
export const generateHint = async (code, problemTitle, language, hintLevel) => {
    const prompt = `Student is stuck on "${problemTitle}" using "${language}".
Their code so far:
\`\`\`${language}
${code}
\`\`\`
Generate hint level ${hintLevel} according to this scale:
Level 1: Gentle conceptual clue.
Level 2: Stronger hint pointing out logical flaws.
Level 3: Algorithm approach explanation.
Level 4: High-level pseudocode.
Level 5: Line-by-line breakdown explanation.
Level 6: Full complete solution code with comments.`;

    const system = "You are a helpful software tutor. Provide ONLY the specific requested level of hint, without giving away more than necessary.";

    const res = await runPrompt(system, prompt);
    if (res) return res;

    // Fallback Simulation logic:
    switch (Number(hintLevel)) {
        case 1:
            return "Hint 1: Think about how you are storing visited nodes. Can a Hash Set or tracking array prevent infinite loops?";
        case 2:
            return "Hint 2: Review your loop boundaries. Are you updating your index pointers inside your helper loop condition?";
        case 3:
            return "Hint 3: Consider using a two-pointer sliding window strategy. Grow the window when sum is below target, and shrink it when sum is above target.";
        case 4:
            return "Hint 4 (Pseudocode):\n```\ninitialize left = 0, current_sum = 0, min_len = infinity\nfor right from 0 to array.length:\n  current_sum += array[right]\n  while current_sum >= target:\n    min_len = min(min_len, right - left + 1)\n    current_sum -= array[left]\n    left++\nreturn min_len\n```";
        case 5:
            return "Hint 5 (Explanation): We use a sliding window of variable width. The right pointer expands the window adding values, and the left pointer contracts it once constraints are met to minimize length.";
        case 6:
        default:
            return `Hint 6 (Full Solution in ${language}):\n\`\`\`${language}\n// Standard sliding window solution\nint minSubArrayLen(int target, vector<int>& nums) {\n    int n = nums.size();\n    int ans = INT_MAX;\n    int left = 0;\n    int sum = 0;\n    for (int i = 0; i < n; i++) {\n        sum += nums[i];\n        while (sum >= target) {\n            ans = min(ans, i + 1 - left);\n            sum -= nums[left++];\n        }\n    }\n    return (ans == INT_MAX) ? 0 : ans;\n}\n\`\`\``;
    }
};

// 4. Grounded Chat Assistant
export const explainConceptMessage = async (conceptQuery, studentName, skillHistory) => {
    const prompt = `Student "${studentName}" asks: "${conceptQuery}".
Their skill background profile:
${JSON.stringify(skillHistory, null, 2)}
Explain the concept simply. Address how it applies to their weak skills if relevant. Keep it under 150 words.`;

    const system = "You are a friendly, encouraging personal placement mentor. Give single-sentence answers when possible to keep it readable, and use Markdown.";

    const res = await runPrompt(system, prompt);
    if (res) return res;

    // Fallback Simulation logic:
    if (conceptQuery.toLowerCase().includes('sliding window')) {
        return `Hi ${studentName}! A sliding window is a subsegment model. Think of it like a subset scanner moving over an array. Instead of starting nested loops over again from scratch, you just 'slide' the window by adding the new element at the right, and dropping the trailing element at the left. It turns O(N^2) problems into O(N) instantly!`;
    }
    return `Hi ${studentName}. Good question. Regarding your query: let's organize this step-by-step. Focus on testing small edge-cases, using clean variables, and running tracing loops. Let me know if you would like me to show a simple pseudo-code block for context.`;
};

// 5. Analyze Resume PDF extraction
export const evaluateResumeDetails = async (resumeText) => {
    const prompt = `Assess this resume text:
"${resumeText}"
Evaluate the resume on: Technical Skills, Projects, Experience, Formatting, and Relevance.
Output a JSON string containing structure matching:
{
  "overallScore": 75,
  "technicalSkillsScore": 80,
  "projectsScore": 70,
  "experienceScore": 60,
  "formattingScore": 90,
  "strengths": ["string"],
  "missingSkills": ["string"],
  "weakDescriptions": ["string"],
  "improvementSuggestions": ["string"]
}`;

    const system = "You are an ATS parser and resume reviewer. Return ONLY a valid JSON string fitting the requested fields.";

    const res = await runPrompt(system, prompt);
    if (res) {
        try {
            return JSON.parse(res.trim().replace(/^```json/, '').replace(/```$/, ''));
        } catch (e) {
            console.warn('Failed to parse Gemini output into JSON. Falling back to default simulation.');
        }
    }

    // Fallback Simulation logic:
    const skillsDetected = [];
    if (resumeText.toLowerCase().includes('react')) skillsDetected.push('React');
    if (resumeText.toLowerCase().includes('node')) skillsDetected.push('Node.js');
    if (resumeText.toLowerCase().includes('mongodb')) skillsDetected.push('MongoDB');

    return {
        overallScore: 68,
        technicalSkillsScore: 70,
        projectsScore: 65,
        experienceScore: 60,
        formattingScore: 80,
        strengths: [
            "Resume has a clear, contact-friendly section.",
            "Good list of technologies: Docker, Node, Javascript."
        ],
        missingSkills: [
            "SQL / Relational databases listing is absent.",
            "System Design elements (Scalability, caching) not mentioned."
        ],
        weakDescriptions: [
            "Project descriptions lack numeric business impact (e.g. 'improved speed 10%').",
            "Experience bullets are too brief or simple."
        ],
        improvementSuggestions: [
            "Include key metrics (e.g., Active users, time saved, database optimization percentages).",
            "Re-format skills list to put target role keywords first."
        ],
        extractedData: {
            name: "Student Candidate",
            email: "candidate@college.edu",
            phone: "+91 99999 88888",
            education: ["B.Tech Computer Science, Graduation 2027"],
            skills: skillsDetected.length ? skillsDetected : ["JavaScript", "HTML/CSS", "Python"],
            projects: ["Placement Platform Project", "E-commerce platform mockup"],
            experience: ["Software Engineering Intern at ABC Labs"],
            certifications: ["AWS Certified Developer"],
            technologies: ["Node.js", "Express", "React", "Git"]
        }
    };
};

// 6. Job Description matching
export const calculateJobDescriptionMatch = async (resumeText, jdText) => {
    const prompt = `Compare this resume:
"${resumeText}"
with this job description:
"${jdText}"
Output a JSON string matching:
{
  "matchScore": 72,
  "matchingSkills": ["string"],
  "missingSkills": ["string"],
  "partialMatches": [{"resumeSkill": "React", "jobRequiredSkill": "Vue", "explanation": "Flexible UI library overlap"}],
  "resumeImprovementSuggestions": ["string"]
}`;

    const system = "You are a professional HR assistant matching profiles. Return ONLY valid JSON fitting the required keys.";

    const res = await runPrompt(system, prompt);
    if (res) {
        try {
            return JSON.parse(res.trim().replace(/^```json/, '').replace(/```$/, ''));
        } catch (e) {
            console.warn('Failed to parse Gemini output to JSON for matched JD. Falling back.');
        }
    }

    // Fallback Simulation logic:
    return {
        matchScore: 62,
        matchingSkills: ["JavaScript", "React", "Node.js"],
        missingSkills: ["Tailwind CSS", "Redis", "TypeScript"],
        partialMatches: [
            {
                resumeSkill: "MongoDB",
                jobRequiredSkill: "PostgreSQL",
                explanation: "Good NoSQL understanding, but job requires relational database experiences."
            }
        ],
        resumeImprovementSuggestions: [
            "Address your missing PostgreSQL and TypeScript skills directly on the project cards.",
            "Rewrite your backend highlights to emphasize microservices architectures."
        ]
    };
};

// 7. Mock Interview follow-ups and rating
export const evaluateInterviewTurn = async (type, questionText, studentAnswer) => {
    const prompt = `Interview Category: ${type}
Question asked: "${questionText}"
Student reply: "${studentAnswer}"

Evaluate their response. Output a JSON string matching:
{
  "isCorrect": true,
  "score": 8, // 1 to 10 scale
  "analysis": "Provide a brief 1-sentence analysis on content accuracy and verbal clarity.",
  "followUpQuestion": "Next technical follow-up question related to their answer."
}`;

    const system = "You are a technical interviewer conducting a mock session. Evaluate the turn and design a natural follow-up question. Return ONLY valid JSON.";

    const res = await runPrompt(system, prompt);
    if (res) {
        try {
            return JSON.parse(res.trim().replace(/^```json/, '').replace(/```$/, ''));
        } catch (e) {
            console.warn('Failed to parse Gemini output to JSON for interview. Falling back.');
        }
    }

    // Fallback Simulation logic:
    const isSQL = type.toLowerCase().includes('sql') || questionText.toLowerCase().includes('database');
    return {
        isCorrect: studentAnswer.length > 10,
        score: studentAnswer.length > 25 ? 8 : 4,
        analysis: studentAnswer.length > 15
            ? "You structure your answer correctly, but could elaborate details on indexing or secondary checks."
            : "Your answer is too short and lacks depth on core principles.",
        followUpQuestion: isSQL
            ? "Good. Can you explain the difference between a CLUSTERED index and a NON-CLUSTERED index in SQL?"
            : "Okay. Can you explain how you would detect a cycle in a Directed Graph?"
    };
};
