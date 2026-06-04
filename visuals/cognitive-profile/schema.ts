import { z } from 'zod';

export const CognitiveProfileSchema = z.object({
  subjectName: z.string(),

  // 1. Executive Summary
  executiveSummary: z.object({
    summary: z.string(),
    overallScore: z.number().min(0).max(100),
    aiConfidence: z.number().min(0).max(100),
  }),

  // 2. Core Traits (Radar Chart)
  coreTraits: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(100),
  })),

  // 3. Big Five Approximation
  bigFive: z.object({
    traits: z.array(z.object({
      trait: z.string(),
      score: z.number().min(0).max(100),
    })),
    commentary: z.string().optional(),
  }),

  // 4. Decision Making Style
  decisionMaking: z.array(z.object({
    label: z.string(),
    score: z.number().min(0).max(100),
    icon: z.string().optional(),
  })),

  // 5. Communication Style
  communicationStyle: z.array(z.object({
    left: z.string(),
    right: z.string(),
    position: z.number().min(0).max(100),
  })),

  // 6. Learning Preferences
  learningPreferences: z.object({
    methods: z.array(z.object({
      label: z.string(),
      percentage: z.number().min(0).max(100),
    })),
    learnsBestThrough: z.array(z.string()),
    strugglesWith: z.array(z.string()),
  }),

  // 7. Strengths
  strengths: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string().optional(),
  })),

  // 8. Potential Blind Spots
  blindSpots: z.array(z.string()),

  // 9. Interest Map (Bubble Chart)
  interestMap: z.array(z.object({
    topic: z.string(),
    size: z.number().min(1).max(10),
  })),

  // 10. Conversation Statistics
  conversationStats: z.object({
    totalConversations: z.number(),
    averageMessageLength: z.string(),
    mostActiveHours: z.string(),
    mostDiscussedTopics: z.array(z.string()),
    languageDistribution: z.array(z.object({
      language: z.string(),
      percentage: z.number().min(0).max(100),
    })).optional(),
    questionStatementRatio: z.string().optional(),
  }),

  // 11. AI Generated Motto
  motto: z.string(),

  // 12. Personal Operating Guide
  operatingGuide: z.object({
    worksBestWhen: z.array(z.string()),
    mayStruggleWhen: z.array(z.string()),
    bestFeedbackStyle: z.array(z.string()),
  }),

  // 13. Archetype
  archetype: z.object({
    archetypes: z.array(z.object({
      name: z.string(),
      confidence: z.number().min(0).max(100),
    })),
    description: z.string(),
  }),

  // 14. Confidence Meter
  confidenceMeter: z.array(z.object({
    section: z.string(),
    confidence: z.number().min(0).max(100),
  })),
});

export type CognitiveProfileData = z.infer<typeof CognitiveProfileSchema>;

export default CognitiveProfileSchema;
