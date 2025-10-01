/**
 * AI Service for generating questions and judging answers
 * Uses Google Gemini API (free tier available)
 * 
 * To use: Get API key from https://makersuite.google.com/app/apikey
 * Set in .env: REACT_APP_GEMINI_API_KEY=your_key_here
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Generate interview questions using AI
 */
export const generateAIQuestions = async (
  role: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 2
): Promise<any[]> => {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using fallback questions.');
    return [];
  }

  const prompt = `Generate ${count} ${difficulty} level technical interview questions for a ${role} position.

Requirements:
- Questions should be specific to ${role} responsibilities
- ${difficulty} difficulty level
- Focus on practical knowledge and problem-solving
- Each question should be clear and concise

Return ONLY a JSON array of objects with this format:
[
  {
    "text": "question text here",
    "category": "category name"
  }
]

Do not include any markdown formatting or explanations, just the JSON array.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || '[]';
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating AI questions:', error);
    return [];
  }
};

/**
 * Judge an answer using AI
 */
export const judgeAnswerWithAI = async (
  question: string,
  answer: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<{ score: number; feedback: string }> => {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using fallback scoring.');
    // Enhanced fallback scoring
    const wordCount = answer.trim().split(/\s+/).length;
    let score = 0;
    
    if (wordCount === 0) return { score: 0, feedback: 'No answer provided' };
    
    // Base score for attempting
    score += 30;
    
    // Length-based scoring
    if (wordCount > 100) score += 25;
    else if (wordCount > 50) score += 20;
    else if (wordCount > 20) score += 15;
    else if (wordCount > 10) score += 10;
    
    // Technical keywords
    const keywords = ['function', 'component', 'api', 'database', 'performance', 'security'];
    const keywordCount = keywords.filter(k => answer.toLowerCase().includes(k)).length;
    score += keywordCount * 5;
    
    // Difficulty adjustment
    if (difficulty === 'hard') score = Math.min(score * 0.8, 85);
    else if (difficulty === 'medium') score = Math.min(score * 0.9, 90);
    
    return { 
      score: Math.min(Math.round(score), 100), 
      feedback: `Fallback scoring based on answer length (${wordCount} words) and content analysis` 
    };
  }

  const prompt = `You are an expert technical interviewer and evaluator.

Task:
- Evaluate the candidate's answer to an interview question.
- Provide a score between 1 and 10.
- Give a short, clear explanation of the score.

Format your response as JSON with these fields:
{
  "score": <number from 1 to 10>,
  "feedback": "<2–4 sentences explaining strengths and weaknesses>"
}

Context:
Question: ${question}
Candidate Answer: ${answer}

Note: This is a ${difficulty} difficulty question. Adjust expectations accordingly.`;


  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || '{}';
    
    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      // Convert 1-10 score to 0-100 scale
      const score1to10 = Math.min(Math.max(result.score || 0, 1), 10);
      const score0to100 = Math.round((score1to10 / 10) * 100);
      
      return {
        score: score0to100,
        feedback: result.feedback || 'No feedback provided'
      };
    }
    
    return { score: 0, feedback: 'Unable to parse AI response' };
  } catch (error) {
    console.error('Error judging answer with AI:', error);
    return { score: 0, feedback: 'AI judging unavailable' };
  }
};

/**
 * Generate comprehensive interview summary using AI
 */
export const generateAISummary = async (
  answers: any[],
  role: string
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using fallback summary.');
    return 'AI summary unavailable. Please configure Gemini API key.';
  }

  const answersText = answers.map((a, i) => 
    `Q${i + 1} (${a.difficulty || 'unknown'}): ${a.question}\nAnswer: ${a.answer}\nScore: ${a.score}/100\n`
  ).join('\n');

  const prompt = `You are an expert technical interviewer. Generate a comprehensive interview evaluation summary.

Position: ${role}
Number of Questions: ${answers.length}

Interview Transcript:
${answersText}

Provide a detailed evaluation including:
1. Overall performance assessment
2. Strengths demonstrated
3. Areas for improvement
4. Hiring recommendation (Strong Yes / Yes / Maybe / No)
5. Specific feedback on technical knowledge

Keep it professional and constructive. Format with clear sections.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'Unable to generate summary';
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'AI summary generation failed. Please try again.';
  }
};
