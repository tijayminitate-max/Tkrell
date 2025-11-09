/**
 * Automated Question Generation from Past Papers
 * Uses LLM to generate variations and new questions based on past paper content
 */

import { invokeLLM } from "./_core/llm";
import { ALL_PAST_PAPERS } from "./past_papers_data";

export interface GeneratedQuestion {
  id: string;
  originalPaperId: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'mcq' | 'shortanswer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  keywords: string[];
  generatedAt: Date;
}

/**
 * Generate multiple question variations from a single past paper question
 */
export async function generateQuestionVariations(
  paperId: string,
  originalQuestion: string,
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 3
): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `You are an expert KCSE/KCPE exam question generator. 
    
Given this original question from a past paper:
"${originalQuestion}"

Topic: ${topic}
Difficulty: ${difficulty}

Generate ${count} NEW but similar questions that test the same concept. 
The questions should:
1. Test the same learning outcome
2. Use different wording and context
3. Have the same difficulty level
4. Be appropriate for Kenyan students

For each question, provide:
- Question text
- Correct answer
- Detailed explanation (2-3 sentences)
- Key learning points

Format as JSON array with objects containing: question, correctAnswer, explanation, keywords (array of 3-5 key terms)`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert educational content generator specializing in Kenyan KCSE/KCPE exams. Generate high-quality, contextually relevant questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "generated_questions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    correctAnswer: { type: "string" },
                    explanation: { type: "string" },
                    keywords: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["question", "correctAnswer", "explanation", "keywords"],
                  additionalProperties: false
                }
              }
            },
            required: ["questions"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') return [];

    const parsed = JSON.parse(content);
    const generatedQuestions: GeneratedQuestion[] = parsed.questions.map((q: any, index: number) => ({
      id: `${paperId}-gen-${Date.now()}-${index}`,
      originalPaperId: paperId,
      topic,
      difficulty,
      type: 'shortanswer' as const,
      question: q.question,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      marks: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15,
      keywords: q.keywords,
      generatedAt: new Date()
    }));

    return generatedQuestions;
  } catch (error) {
    console.error("Question generation failed:", error);
    return [];
  }
}

/**
 * Generate MCQ questions with options from past paper content
 */
export async function generateMCQQuestions(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 5
): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `Generate ${count} multiple choice questions for KCSE/KCPE students.

Topic: ${topic}
Difficulty: ${difficulty}
Exam Type: KCSE/KCPE

For each question:
1. Create a clear, unambiguous question
2. Provide 4 plausible options (A, B, C, D)
3. Mark the correct answer
4. Provide a brief explanation (1-2 sentences)
5. Include 3-5 key learning concepts

The questions should:
- Test conceptual understanding, not just memorization
- Use Kenyan context where appropriate
- Follow KCSE/KCPE exam format
- Be appropriate for the difficulty level

Format as JSON array with: question, options (array of 4), correctAnswer (A/B/C/D), explanation, keywords`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert KCSE/KCPE exam question writer. Create high-quality multiple choice questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "mcq_questions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 4,
                      maxItems: 4
                    },
                    correctAnswer: { type: "string" },
                    explanation: { type: "string" },
                    keywords: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["question", "options", "correctAnswer", "explanation", "keywords"],
                  additionalProperties: false
                }
              }
            },
            required: ["questions"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') return [];

    const parsed = JSON.parse(content);
    const generatedQuestions: GeneratedQuestion[] = parsed.questions.map((q: any, index: number) => ({
      id: `mcq-${topic}-${Date.now()}-${index}`,
      originalPaperId: `mcq-${topic}`,
      topic,
      difficulty,
      type: 'mcq' as const,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      marks: 1,
      keywords: q.keywords,
      generatedAt: new Date()
    }));

    return generatedQuestions;
  } catch (error) {
    console.error("MCQ generation failed:", error);
    return [];
  }
}

/**
 * Generate essay questions with model answers
 */
export async function generateEssayQuestions(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 3
): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `Generate ${count} essay questions for KCSE/KCPE students.

Topic: ${topic}
Difficulty: ${difficulty}
Exam Type: KCSE/KCPE

For each question:
1. Create a thought-provoking essay question
2. Provide a comprehensive model answer (150-300 words)
3. List key points to cover
4. Provide marking scheme guidance
5. Include 5-7 key concepts

The questions should:
- Encourage critical thinking and analysis
- Allow for multiple valid approaches
- Test deep understanding of the topic
- Be appropriate for the difficulty level
- Include Kenyan context where relevant

Format as JSON with: question, modelAnswer, keyPoints (array), markingGuidance, keywords`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert KCSE/KCPE exam question writer specializing in essay questions. Create thought-provoking questions with comprehensive model answers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "essay_questions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    modelAnswer: { type: "string" },
                    keyPoints: {
                      type: "array",
                      items: { type: "string" }
                    },
                    markingGuidance: { type: "string" },
                    keywords: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["question", "modelAnswer", "keyPoints", "markingGuidance", "keywords"],
                  additionalProperties: false
                }
              }
            },
            required: ["questions"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') return [];

    const parsed = JSON.parse(content);
    const generatedQuestions: GeneratedQuestion[] = parsed.questions.map((q: any, index: number) => ({
      id: `essay-${topic}-${Date.now()}-${index}`,
      originalPaperId: `essay-${topic}`,
      topic,
      difficulty,
      type: 'essay' as const,
      question: q.question,
      correctAnswer: q.modelAnswer,
      explanation: q.markingGuidance,
      marks: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 20 : 25,
      keywords: q.keywords,
      generatedAt: new Date()
    }));

    return generatedQuestions;
  } catch (error) {
    console.error("Essay question generation failed:", error);
    return [];
  }
}

/**
 * Bulk generate questions for all past papers
 */
export async function generateQuestionsForAllPastPapers(): Promise<GeneratedQuestion[]> {
  const allGeneratedQuestions: GeneratedQuestion[] = [];

  // For each past paper, generate 3 variations
  for (const paper of ALL_PAST_PAPERS) {
    try {
      const variations = await generateQuestionVariations(
        paper.id,
        `Sample question from ${paper.title}`,
        paper.subject,
        'medium',
        3
      );
      allGeneratedQuestions.push(...variations);
    } catch (error) {
      console.error(`Failed to generate questions for ${paper.id}:`, error);
    }
  }

  return allGeneratedQuestions;
}

/**
 * Generate questions for a specific subject across all years
 */
export async function generateQuestionsBySubject(
  subject: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<GeneratedQuestion[]> {
  const subjectPapers = ALL_PAST_PAPERS.filter(p => p.subject === subject);
  const allQuestions: GeneratedQuestion[] = [];

  // Generate MCQ questions
  const mcqQuestions = await generateMCQQuestions(subject, difficulty, 10);
  allQuestions.push(...mcqQuestions);

  // Generate essay questions
  const essayQuestions = await generateEssayQuestions(subject, difficulty, 5);
  allQuestions.push(...essayQuestions);

  return allQuestions;
}

/**
 * Get question generation statistics
 */
export function getQuestionGenerationStats() {
  const subjectsSet = new Set(ALL_PAST_PAPERS.map(p => p.subject));
  return {
    totalPastPapers: ALL_PAST_PAPERS.length,
    potentialGeneratedQuestions: ALL_PAST_PAPERS.length * 3, // 3 variations per paper
    subjects: subjectsSet.size,
    estimatedTotalQuestions: (ALL_PAST_PAPERS.length * 3) + (ALL_PAST_PAPERS.length * 10) + (ALL_PAST_PAPERS.length * 5),
    message: "Tkrell can generate 1000+ unique questions from 40+ past papers using AI"
  };
}
