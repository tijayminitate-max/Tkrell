/**
 * Comprehensive Kenyan Curriculum Database
 * Includes KCPE (Primary), KCSE (Secondary), and IGCSE materials
 * All in KSH currency
 */

export const KENYAN_CURRICULUM = {
  // KCPE - Class 4-8 (Primary School)
  kcpe: {
    levels: [
      { id: 'class4', name: 'Class 4', ageRange: '9-10' },
      { id: 'class5', name: 'Class 5', ageRange: '10-11' },
      { id: 'class6', name: 'Class 6', ageRange: '11-12' },
      { id: 'class7', name: 'Class 7', ageRange: '12-13' },
      { id: 'class8', name: 'Class 8 (KCPE)', ageRange: '13-14' },
    ],
    subjects: {
      english: {
        name: 'English',
        topics: [
          { id: 'grammar', name: 'Grammar', subtopics: ['Nouns', 'Verbs', 'Adjectives', 'Tenses', 'Sentence Structure', 'Punctuation'] },
          { id: 'comprehension', name: 'Reading Comprehension', subtopics: ['Main Idea', 'Details', 'Inference', 'Vocabulary', 'Context Clues'] },
          { id: 'writing', name: 'Writing Skills', subtopics: ['Essays', 'Stories', 'Letters', 'Descriptive Writing', 'Narrative Writing'] },
          { id: 'literature', name: 'Literature', subtopics: ['Poetry', 'Prose', 'Drama', 'Character Analysis', 'Theme Identification'] },
          { id: 'oral', name: 'Oral Skills', subtopics: ['Speaking', 'Listening', 'Pronunciation', 'Dialogue', 'Public Speaking'] },
        ],
        estimatedMaterials: 500,
      },
      kiswahili: {
        name: 'Kiswahili',
        topics: [
          { id: 'grammar', name: 'Sarufi (Grammar)', subtopics: ['Nomino', 'Kitenzi', 'Sifa', 'Wakati', 'Muundo wa Sentensi'] },
          { id: 'reading', name: 'Kusoma na Kuelewa', subtopics: ['Maelezo', 'Habari', 'Hadithi', 'Mashairi', 'Fasihi'] },
          { id: 'writing', name: 'Kuandika', subtopics: ['Insha', 'Barua', 'Habari', 'Hadithi', 'Mashairi'] },
          { id: 'oral', name: 'Ujumbe na Mazungumzo', subtopics: ['Hotuba', 'Mazungumzo', 'Kusikiliza', 'Kusema'] },
        ],
        estimatedMaterials: 400,
      },
      mathematics: {
        name: 'Mathematics',
        topics: [
          { id: 'arithmetic', name: 'Arithmetic', subtopics: ['Whole Numbers', 'Fractions', 'Decimals', 'Percentages', 'Ratios'] },
          { id: 'algebra', name: 'Algebra', subtopics: ['Expressions', 'Equations', 'Inequalities', 'Functions', 'Sequences'] },
          { id: 'geometry', name: 'Geometry', subtopics: ['Shapes', 'Angles', 'Area', 'Perimeter', 'Volume', 'Symmetry'] },
          { id: 'statistics', name: 'Statistics & Probability', subtopics: ['Data Collection', 'Mean/Median/Mode', 'Probability', 'Graphs', 'Charts'] },
          { id: 'measurement', name: 'Measurement', subtopics: ['Length', 'Mass', 'Time', 'Temperature', 'Currency'] },
        ],
        estimatedMaterials: 600,
      },
      science: {
        name: 'Science',
        topics: [
          { id: 'biology', name: 'Biology', subtopics: ['Living Things', 'Human Body', 'Plants', 'Animals', 'Ecosystems', 'Health'] },
          { id: 'chemistry', name: 'Chemistry', subtopics: ['Matter', 'Elements', 'Compounds', 'Reactions', 'Acids & Bases'] },
          { id: 'physics', name: 'Physics', subtopics: ['Forces', 'Motion', 'Energy', 'Light', 'Sound', 'Electricity'] },
          { id: 'earth', name: 'Earth Science', subtopics: ['Weather', 'Climate', 'Rocks', 'Soil', 'Water Cycle', 'Space'] },
        ],
        estimatedMaterials: 700,
      },
      socialstudies: {
        name: 'Social Studies',
        topics: [
          { id: 'geography', name: 'Geography', subtopics: ['Maps', 'Continents', 'Countries', 'Landmarks', 'Climate Zones', 'Resources'] },
          { id: 'history', name: 'History', subtopics: ['Ancient Civilizations', 'Medieval Period', 'Colonial Era', 'Independence', 'Modern Kenya'] },
          { id: 'civics', name: 'Civics', subtopics: ['Government', 'Rights & Responsibilities', 'Democracy', 'Constitution', 'Community'] },
          { id: 'economics', name: 'Economics', subtopics: ['Trade', 'Money', 'Jobs', 'Production', 'Consumer Skills'] },
        ],
        estimatedMaterials: 500,
      },
    },
  },

  // KCSE - Form 1-4 (Secondary School)
  kcse: {
    levels: [
      { id: 'form1', name: 'Form 1', ageRange: '14-15' },
      { id: 'form2', name: 'Form 2', ageRange: '15-16' },
      { id: 'form3', name: 'Form 3', ageRange: '16-17' },
      { id: 'form4', name: 'Form 4 (KCSE)', ageRange: '17-18' },
    ],
    coreSubjects: {
      english: {
        name: 'English',
        topics: [
          { id: 'literature', name: 'Literature in English', subtopics: ['Set Books', 'Poetry', 'Drama', 'Prose', 'Character Analysis', 'Themes'] },
          { id: 'writing', name: 'Writing Skills', subtopics: ['Essays', 'Creative Writing', 'Formal Writing', 'Reports', 'Speeches'] },
          { id: 'grammar', name: 'Grammar & Language', subtopics: ['Sentence Structure', 'Tenses', 'Voice', 'Mood', 'Figures of Speech'] },
          { id: 'comprehension', name: 'Comprehension', subtopics: ['Unseen Passages', 'Inference', 'Vocabulary', 'Summary Writing'] },
        ],
        estimatedMaterials: 800,
      },
      kiswahili: {
        name: 'Kiswahili',
        topics: [
          { id: 'fasihi', name: 'Fasihi ya Kiswahili', subtopics: ['Riwaya', 'Mashairi', 'Tamthilia', 'Hadithi', 'Utendi'] },
          { id: 'sarufi', name: 'Sarufi', subtopics: ['Nomino', 'Kitenzi', 'Sifa', 'Wakati', 'Muundo'] },
          { id: 'insha', name: 'Insha na Kuandika', subtopics: ['Insha', 'Barua', 'Ripoti', 'Hotuba', 'Habari'] },
          { id: 'kusikiliza', name: 'Kusikiliza na Kusoma', subtopics: ['Ujumbe', 'Mazungumzo', 'Maelezo', 'Hadithi'] },
        ],
        estimatedMaterials: 700,
      },
      mathematics: {
        name: 'Mathematics',
        topics: [
          { id: 'algebra', name: 'Algebra', subtopics: ['Expressions', 'Equations', 'Quadratics', 'Sequences', 'Series', 'Logarithms'] },
          { id: 'geometry', name: 'Geometry & Trigonometry', subtopics: ['Angles', 'Triangles', 'Circles', 'Trigonometric Ratios', 'Sine Rule', 'Cosine Rule'] },
          { id: 'calculus', name: 'Calculus', subtopics: ['Limits', 'Differentiation', 'Integration', 'Applications'] },
          { id: 'statistics', name: 'Statistics & Probability', subtopics: ['Measures of Central Tendency', 'Dispersion', 'Probability', 'Distributions'] },
        ],
        estimatedMaterials: 1000,
      },
      science: {
        name: 'Integrated Science',
        topics: [
          { id: 'biology', name: 'Biology', subtopics: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Physiology', 'Photosynthesis'] },
          { id: 'chemistry', name: 'Chemistry', subtopics: ['Atomic Structure', 'Bonding', 'Reactions', 'Organic Chemistry', 'Equilibrium', 'Thermochemistry'] },
          { id: 'physics', name: 'Physics', subtopics: ['Mechanics', 'Waves', 'Electricity', 'Magnetism', 'Optics', 'Modern Physics'] },
        ],
        estimatedMaterials: 1200,
      },
    },
    electiveSubjects: {
      history: {
        name: 'History & Government',
        topics: [
          { id: 'kenya', name: 'Kenya History', subtopics: ['Pre-Colonial', 'Colonial Era', 'Independence', 'Post-Independence', 'Modern Kenya'] },
          { id: 'africa', name: 'African History', subtopics: ['Kingdoms', 'Colonialism', 'Independence Movements', 'Modern Africa'] },
          { id: 'world', name: 'World History', subtopics: ['Industrial Revolution', 'World Wars', 'Cold War', 'Modern World'] },
          { id: 'government', name: 'Government', subtopics: ['Constitution', 'Parliament', 'Judiciary', 'Executive', 'Rights'] },
        ],
        estimatedMaterials: 600,
      },
      geography: {
        name: 'Geography',
        topics: [
          { id: 'physical', name: 'Physical Geography', subtopics: ['Geomorphology', 'Climate', 'Vegetation', 'Soils', 'Water Systems'] },
          { id: 'human', name: 'Human Geography', subtopics: ['Population', 'Settlement', 'Economic Activities', 'Development', 'Urbanization'] },
          { id: 'kenya', name: 'Kenya Geography', subtopics: ['Regions', 'Resources', 'Development', 'Environmental Issues'] },
        ],
        estimatedMaterials: 500,
      },
      businessstudies: {
        name: 'Business Studies',
        topics: [
          { id: 'management', name: 'Management', subtopics: ['Planning', 'Organization', 'Leadership', 'Control', 'Decision Making'] },
          { id: 'accounting', name: 'Accounting', subtopics: ['Double Entry', 'Trial Balance', 'Financial Statements', 'Analysis'] },
          { id: 'economics', name: 'Economics', subtopics: ['Microeconomics', 'Macroeconomics', 'Trade', 'Development'] },
          { id: 'commerce', name: 'Commerce', subtopics: ['Trade', 'Marketing', 'Retail', 'Wholesale', 'E-commerce'] },
        ],
        estimatedMaterials: 600,
      },
      cre: {
        name: 'Christian Religious Education',
        topics: [
          { id: 'bible', name: 'Bible', subtopics: ['Old Testament', 'New Testament', 'Gospels', 'Epistles', 'Revelation'] },
          { id: 'theology', name: 'Theology', subtopics: ['God', 'Jesus', 'Holy Spirit', 'Salvation', 'Church'] },
          { id: 'ethics', name: 'Christian Ethics', subtopics: ['Morality', 'Relationships', 'Society', 'Justice', 'Peace'] },
        ],
        estimatedMaterials: 400,
      },
    },
  },

  // IGCSE - International General Certificate of Secondary Education
  igcse: {
    levels: [
      { id: 'igcse', name: 'IGCSE', ageRange: '16-18' },
    ],
    subjects: {
      english: {
        name: 'English Language (0500)',
        topics: [
          { id: 'reading', name: 'Reading', subtopics: ['Unseen Texts', 'Comprehension', 'Analysis', 'Evaluation'] },
          { id: 'writing', name: 'Writing', subtopics: ['Formal Writing', 'Creative Writing', 'Transactional Writing'] },
          { id: 'speaking', name: 'Speaking & Listening', subtopics: ['Discussions', 'Presentations', 'Interviews'] },
        ],
        estimatedMaterials: 600,
      },
      englishlit: {
        name: 'English Literature (0486)',
        topics: [
          { id: 'prose', name: 'Prose', subtopics: ['Set Texts', 'Character', 'Plot', 'Theme', 'Style'] },
          { id: 'poetry', name: 'Poetry', subtopics: ['Set Poems', 'Techniques', 'Imagery', 'Rhythm', 'Meaning'] },
          { id: 'drama', name: 'Drama', subtopics: ['Set Plays', 'Characters', 'Conflict', 'Dialogue', 'Staging'] },
        ],
        estimatedMaterials: 500,
      },
      mathematics: {
        name: 'Mathematics (0580)',
        topics: [
          { id: 'core', name: 'Core Mathematics', subtopics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics'] },
          { id: 'extended', name: 'Extended Mathematics', subtopics: ['Advanced Algebra', 'Complex Numbers', 'Matrices', 'Vectors'] },
        ],
        estimatedMaterials: 800,
      },
      sciences: {
        name: 'Sciences',
        topics: [
          { id: 'biology', name: 'Biology (0610)', subtopics: ['Cell Biology', 'Genetics', 'Ecology', 'Physiology', 'Evolution'] },
          { id: 'chemistry', name: 'Chemistry (0620)', subtopics: ['Atomic Structure', 'Bonding', 'Reactions', 'Organic Chemistry', 'Thermochemistry'] },
          { id: 'physics', name: 'Physics (0625)', subtopics: ['Mechanics', 'Waves', 'Electricity', 'Magnetism', 'Optics'] },
        ],
        estimatedMaterials: 1000,
      },
    },
  },
};

// Sample content structure for each material
export interface KenyanMaterial {
  id: string;
  title: string;
  subject: string;
  topic: string;
  subtopic: string;
  level: string; // 'kcpe', 'kcse', 'igcse'
  grade: string; // 'class4', 'form1', etc.
  type: 'note' | 'pastpaper' | 'question' | 'summary' | 'video';
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  language: 'english' | 'kiswahili';
  createdAt: Date;
  updatedAt: Date;
}

// Pricing in KSH
export const KENYAN_PRICING = {
  freeTier: {
    name: 'Free',
    price: 0,
    currency: 'KSH',
    features: {
      dailyQuizzes: 3,
      aiTutorMinutes: 5,
      offlineQuestions: 50,
      adFree: false,
      streakFreezeTokens: 0,
      advancedAnalytics: false,
    },
  },
  premiumTier: {
    name: 'Premium',
    price: 499, // ~$3.99 USD
    currency: 'KSH',
    billingPeriod: 'monthly',
    features: {
      dailyQuizzes: -1, // unlimited
      aiTutorMinutes: -1, // unlimited
      offlineQuestions: 500,
      adFree: true,
      streakFreezeTokens: 2,
      advancedAnalytics: true,
      prioritySupport: true,
    },
  },
  vipTier: {
    name: 'VIP',
    price: 999, // ~$7.99 USD
    currency: 'KSH',
    billingPeriod: 'monthly',
    features: {
      dailyQuizzes: -1,
      aiTutorMinutes: -1,
      offlineQuestions: -1, // all
      adFree: true,
      streakFreezeTokens: 5,
      advancedAnalytics: true,
      prioritySupport: true,
      customStudyPlans: true,
      teacherAccess: true,
    },
  },
  teacherSubscription: {
    name: 'Teacher',
    price: 999, // KSH per month
    currency: 'KSH',
    billingPeriod: 'monthly',
    features: {
      classManagement: true,
      studentAnalytics: true,
      bulkQuizAssignment: true,
      performanceReports: true,
      classroomLeaderboards: true,
      studentLimit: 100,
    },
  },
  schoolLicense: {
    name: 'School License',
    price: 50, // KSH per student per month
    currency: 'KSH',
    billingPeriod: 'monthly',
    features: {
      unlimitedTeachers: true,
      fullClassroomManagement: true,
      apiAccess: true,
      dedicatedSupport: true,
      customBranding: true,
      studentLimit: -1, // unlimited
    },
  },
};

// XP and reward system in KSH
export const REWARD_SYSTEM = {
  xpRewards: {
    correctAnswer: 10,
    quizCompletion: 50,
    dailyStreak: 100,
    levelUp: 500,
    achievementUnlock: 250,
  },
  coinRewards: {
    correctAnswer: 1,
    quizCompletion: 5,
    dailyStreak: 10,
    levelUp: 50,
    achievementUnlock: 25,
    referralBonus: 100,
  },
  premiumCosts: {
    streakFreezeToken: 99, // KSH
    avatarCosmetic: 199, // KSH
    achievementBadge: 49, // KSH
    xpMultiplier24h: 299, // KSH
  },
};

// Exam board information
export const EXAM_BOARDS = {
  kcpe: {
    name: 'Kenya Certificate of Primary Education',
    year: 'Class 8',
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies'],
    duration: '2 hours per subject',
    totalMarks: 500,
  },
  kcse: {
    name: 'Kenya Certificate of Secondary Education',
    year: 'Form 4',
    coreSubjects: ['English', 'Kiswahili', 'Mathematics', 'Science'],
    electiveSubjects: ['History & Government', 'Geography', 'Business Studies', 'CRE', 'Computer Studies'],
    duration: '3 hours per subject',
    totalMarks: 500,
  },
  igcse: {
    name: 'International General Certificate of Secondary Education',
    examBoard: 'Cambridge International',
    year: 'Year 11',
    subjects: ['English', 'Mathematics', 'Sciences', 'Humanities', 'Languages'],
    duration: 'Varies by subject',
    totalMarks: 'Varies by subject',
  },
};
