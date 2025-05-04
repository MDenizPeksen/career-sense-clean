import React from 'react';
import { User, Award, BarChart2, Users, Target, Settings, Star, Briefcase, TrendingUp, FileText, BookOpen, Info } from 'react-feather';
import { motion } from 'framer-motion';
import type { ArchetypeData, SimpleArchetype, ComplexArchetype } from '../../../types';

/**
 * Props for the ArchetypeCard component.
 */
interface ArchetypeCardProps {
  /** The archetype data object, which can be in simple or complex format. */
  data: ArchetypeData;
  /** Optional user name to help determine gender for image selection. */
  userName?: string;
}

/**
 * Interface for highlighted resume elements in the explanation
 */
interface HighlightedElement {
  /** The text content of the highlighted element */
  text: string;
  /** Optional category or type of the highlighted element */
  category?: 'skill' | 'experience' | 'achievement' | 'education' | 'trait';
}

/**
 * Type guard to check if the archetype data is in the SimpleArchetype format.
 * @param archetype The archetype data to check.
 * @returns True if the data matches the SimpleArchetype structure, false otherwise.
 */
const isSimpleArchetype = (archetype: ArchetypeData): archetype is SimpleArchetype => {
  return archetype && 
         typeof archetype === 'object' &&
         'archetype' in archetype && 
         'short_description' in archetype;
};

/**
 * Type guard to check if the archetype data is in the ComplexArchetype format.
 * @param archetype The archetype data to check.
 * @returns True if the data matches the ComplexArchetype structure, false otherwise.
 */
const isComplexArchetype = (archetype: ArchetypeData): archetype is ComplexArchetype => {
  return archetype && 
         typeof archetype === 'object' &&
         'primary' in archetype && 
         archetype.primary && 
         typeof archetype.primary === 'object' &&
         'archetype' in archetype.primary;
};

/**
 * Extracts relevant archetype information (name, description, reasoning) from various possible data structures.
 * Handles simple, complex, and attempts to gracefully handle unknown formats.
 * @param data The raw archetype data received from the analysis.
 * @returns An object containing the extracted archetype, description, and reasoning.
 */
const extractArchetypeData = (data: ArchetypeData): {
  archetype: string;
  description: string;
  reasoning: string;
  strengths: string[];
  challenges: string[];
  careerPaths: string[];
  developmentAreas: string[];
  confidence: string;
  secondaryArchetype?: {
    archetype: string;
    description: string;
    strengths: string[];
    challenges: string[];
    confidence: string;
  };
} => {
  console.log("ArchetypeCard received data:", data);
  
  // Handle case where data might be a string or primitive value
  if (typeof data !== 'object' || data === null) {
    console.warn('Unexpected archetype format (not an object):', data);
    return {
      archetype: String(data),
      description: "No description available",
      reasoning: "No reasoning available",
      strengths: [],
      challenges: [],
      careerPaths: [],
      developmentAreas: [],
      confidence: "Unknown"
    };
  }
  
  // Handle simple format from archetypePrompt.js
  if (isSimpleArchetype(data)) {
    console.log("SimpleArchetype detected, generating enhanced visualization data");
    
    // Extract keywords from the reasoning to create mock strengths and challenges
    const extractKeywords = (text: string, limit: number): string[] => {
      if (!text) return [];
      
      // Common keywords to look for
      const skillKeywords = [
        'analytical', 'strategic', 'problem-solving', 'leadership', 'communication',
        'technical', 'creative', 'innovative', 'detail-oriented', 'organized',
        'collaborative', 'adaptable', 'research', 'planning', 'management'
      ];
      
      // Find keywords in the text
      const found = skillKeywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // If we found enough keywords, use them
      if (found.length >= limit) {
        return found.slice(0, limit).map(k => k.charAt(0).toUpperCase() + k.slice(1));
      }
      
      // Otherwise generate some based on the archetype
      const archetypeToSkills: Record<string, string[]> = {
        'Analytical Thinker': ['Data analysis', 'Critical thinking', 'Problem-solving', 'Attention to detail'],
        'Strategist': ['Strategic planning', 'Decision making', 'Leadership', 'Vision development'],
        'Visionary': ['Innovation', 'Creative thinking', 'Big-picture focus', 'Inspiration'],
        'Connector': ['Relationship building', 'Communication', 'Networking', 'Collaboration'],
        'Builder': ['Implementation', 'Project management', 'Technical expertise', 'Execution'],
        'Optimizer': ['Process improvement', 'Efficiency', 'Systems thinking', 'Quality control']
      };
      
      // Find the closest matching archetype
      const archetypeKey = Object.keys(archetypeToSkills).find(key => 
        data.archetype.toLowerCase().includes(key.toLowerCase())
      ) || 'Analytical Thinker';
      
      return archetypeToSkills[archetypeKey].slice(0, limit);
    };
    
    // Generate career paths based on the archetype
    const generateCareerPaths = (archetype: string): string[] => {
      const archetypeToPaths: Record<string, string[]> = {
        'Analytical Thinker': ['Data Scientist', 'Business Analyst', 'Research Scientist', 'Financial Analyst'],
        'Strategist': ['Management Consultant', 'Product Manager', 'Business Strategist', 'Operations Director'],
        'Visionary': ['Entrepreneur', 'Innovation Director', 'Creative Director', 'Chief Vision Officer'],
        'Connector': ['Business Development Manager', 'Account Executive', 'Community Manager', 'Partnership Director'],
        'Builder': ['Software Engineer', 'Project Manager', 'Technical Lead', 'Systems Architect'],
        'Optimizer': ['Process Improvement Specialist', 'Quality Assurance Manager', 'Operations Manager', 'Efficiency Consultant']
      };
      
      // Find the closest matching archetype
      const archetypeKey = Object.keys(archetypeToPaths).find(key => 
        archetype.toLowerCase().includes(key.toLowerCase())
      ) || 'Analytical Thinker';
      
      return archetypeToPaths[archetypeKey];
    };
    
    // Extract confidence level from reasoning if possible
    const determineConfidence = (reasoning: string): string => {
      if (!reasoning) return "Medium";
      
      const lowerReasoning = reasoning.toLowerCase();
      if (lowerReasoning.includes('strong') || 
          lowerReasoning.includes('clear') || 
          lowerReasoning.includes('definitely')) {
        return "High";
      } else if (lowerReasoning.includes('some') || 
                lowerReasoning.includes('could be') || 
                lowerReasoning.includes('might')) {
        return "Low";
      }
      return "Medium";
    };
    
    // Generate development areas based on challenges
    const generateDevelopmentAreas = (challenges: string[]): string[] => {
      return challenges.map(challenge => {
        if (challenge.includes('detail')) return 'Strategic thinking workshops';
        if (challenge.includes('big picture')) return 'Detail-oriented skill development';
        if (challenge.includes('technical')) return 'Technical skills training';
        if (challenge.includes('communication')) return 'Communication skills workshops';
        if (challenge.includes('balance')) return 'Work-life balance coaching';
        return 'Professional development courses';
      });
    };
    
    // Extract strengths and challenges
    const strengths = extractKeywords(data.reasoning, 4);
    const challenges = [
      'May focus too much on details and miss the big picture',
      'Can overthink problems leading to analysis paralysis'
    ];
    const careerPaths = generateCareerPaths(data.archetype);
    const confidence = determineConfidence(data.reasoning);
    const developmentAreas = generateDevelopmentAreas(challenges);
    
    return {
      archetype: data.archetype,
      description: data.short_description,
      reasoning: data.reasoning,
      strengths,
      challenges,
      careerPaths,
      developmentAreas,
      confidence
    };
  } 
  
  // Handle complex format from openaiService.js archetypePrompt
  if (isComplexArchetype(data)) {
    const primary = data.primary;
    const secondary = data.secondary;
    
    return {
      archetype: primary.archetype,
      description: primary.description,
      reasoning: data.explanation,
      strengths: primary.strengths || [],
      challenges: primary.challenges || [],
      careerPaths: primary.careerPaths || [],
      developmentAreas: primary.developmentAreas || [],
      confidence: primary.confidence || "Unknown",
      secondaryArchetype: secondary ? {
        archetype: secondary.archetype,
        description: secondary.description,
        strengths: secondary.strengths || [],
        challenges: secondary.challenges || [],
        confidence: secondary.confidence || "Unknown"
      } : undefined
    };
  }
  
  // At this point, we're dealing with an unknown object structure
  // Cast to any to safely access properties
  const unknownData = data as any;
  
  // Try to extract data from other possible formats
  if ('primary' in unknownData && typeof unknownData.primary === 'string') {
    return {
      archetype: String(unknownData.primary),
      description: unknownData.description || unknownData.secondary || "No description available",
      reasoning: unknownData.explanation || "No reasoning available",
      strengths: [],
      challenges: [],
      careerPaths: [],
      developmentAreas: [],
      confidence: "Unknown"
    };
  }
  
  // Check for other common property names
  if ('type' in unknownData && typeof unknownData.type === 'string') {
    return {
      archetype: unknownData.type,
      description: unknownData.description || "No description available",
      reasoning: unknownData.reasoning || unknownData.explanation || "No reasoning available",
      strengths: unknownData.strengths || [],
      challenges: unknownData.challenges || [],
      careerPaths: unknownData.careerPaths || [],
      developmentAreas: unknownData.developmentAreas || [],
      confidence: unknownData.confidence || "Unknown"
    };
  }
  
  // Fallback for unexpected format
  console.warn('Unrecognized archetype format:', data);
  
  // Try to find any string property that might be the archetype name
  const possibleArchetypeProps = ['name', 'title', 'category', 'class', 'classification'];
  for (const prop of possibleArchetypeProps) {
    if (prop in unknownData && typeof unknownData[prop] === 'string') {
      return {
        archetype: unknownData[prop],
        description: unknownData.description || "No description available",
        reasoning: unknownData.reasoning || unknownData.explanation || "No reasoning available",
        strengths: unknownData.strengths || [],
        challenges: unknownData.challenges || [],
        careerPaths: unknownData.careerPaths || [],
        developmentAreas: unknownData.developmentAreas || [],
        confidence: unknownData.confidence || "Unknown"
      };
    }
  }
  
  return {
    archetype: 'Unknown Archetype',
    description: 'No description available',
    reasoning: 'No reasoning available',
    strengths: [],
    challenges: [],
    careerPaths: [],
    developmentAreas: [],
    confidence: "Unknown"
  };
};

/**
 * Extracts highlighted elements from the explanation text.
 * Looks for elements that might be surrounded by quotes, or preceded by indicators.
 * @param text The explanation text to parse for highlights
 * @returns Array of highlighted elements
 */
const extractHighlightedElements = (text: string): HighlightedElement[] => {
  if (!text || typeof text !== 'string') return [];
  
  const highlights: HighlightedElement[] = [];
  
  // Match quoted phrases as potential highlights
  const quotedMatches = text.match(/"([^"]+)"/g) || [];
  quotedMatches.forEach(match => {
    const cleanText = match.replace(/"/g, '').trim();
    if (cleanText.length > 0) {
      highlights.push({ 
        text: cleanText,
        // Try to determine category based on content
        category: determineCategory(cleanText)
      });
    }
  });
  
  // Match phrases after indicators like "skills such as", "experience in", etc.
  const skillIndicators = [
    { pattern: /skills? (?:such as|like|including) ([^.]+)/i, category: 'skill' as const },
    { pattern: /experience (?:in|with) ([^.]+)/i, category: 'experience' as const },
    { pattern: /achievements? (?:such as|like|including) ([^.]+)/i, category: 'achievement' as const },
    { pattern: /education (?:in|from) ([^.]+)/i, category: 'education' as const },
    { pattern: /(?:demonstrates|shows|exhibits) ([^.]+)/i, category: 'trait' as const }
  ];
  
  skillIndicators.forEach(({ pattern, category }) => {
    const match = text.match(pattern);
    if (match && match[1]) {
      const elements = match[1].split(/,|\band\b/).map(e => e.trim());
      elements.forEach(element => {
        if (element.length > 0 && !highlights.some(h => h.text.includes(element))) {
          highlights.push({ text: element, category });
        }
      });
    }
  });
  
  // Deduplicate and return
  return highlights.filter((highlight, index, self) => 
    index === self.findIndex(h => h.text === highlight.text)
  );
};

/**
 * Attempts to determine the category of a highlighted element based on its content.
 * @param text The text to analyze
 * @returns The determined category or undefined
 */
const determineCategory = (text: string): HighlightedElement['category'] => {
  const lowerText = text.toLowerCase();
  
  // Common skills keywords
  if (/\b(programming|coding|development|analysis|design|leadership)\b/i.test(lowerText)) {
    return 'skill';
  }
  
  // Experience indicators
  if (/\b(years|experience|worked|led|managed|developed)\b/i.test(lowerText)) {
    return 'experience';
  }
  
  // Achievement indicators
  if (/\b(achieved|increased|improved|reduced|award|recognition)\b/i.test(lowerText)) {
    return 'achievement';
  }
  
  // Education indicators
  if (/\b(degree|university|college|certification|diploma|education)\b/i.test(lowerText)) {
    return 'education';
  }
  
  // Trait indicators
  if (/\b(analytical|creative|detail-oriented|organized|communicative|innovative)\b/i.test(lowerText)) {
    return 'trait';
  }
  
  return undefined;
};

/**
 * Generates a confidence explanation based on the confidence level.
 * @param confidence The confidence level (High, Medium, Low)
 * @returns An explanation of what the confidence level means
 */
const getConfidenceExplanation = (confidence: string): string => {
  switch (confidence) {
    case 'High':
      return 'Your resume strongly aligns with this archetype, showing clear patterns that match this professional identity.';
    case 'Medium':
      return 'Your resume shows several characteristics of this archetype, though some aspects may overlap with other archetypes.';
    case 'Low':
      return 'Your resume shows some indicators of this archetype, but you may want to explore other potential fits as well.';
    default:
      return '';
  }
};

/**
 * Attempts to determine the likely gender ('man' or 'women') based on a given first name.
 * Uses a predefined list of common female names for matching.
 * Defaults to 'man' if no name is provided or if the name is not found in the female list.
 * @param name The user's first name (optional).
 * @returns 'man' or 'women'.
 */
const determineGender = (name: string | undefined): 'man' | 'women' => {
  if (!name) return 'man'; // Default to man if no name provided
  
  // List of common female first names (this is a simplified approach)
  const femaleNames = [
    'mary', 'patricia', 'linda', 'barbara', 'elizabeth', 'jennifer', 'maria', 'susan',
    'margaret', 'dorothy', 'lisa', 'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna',
    'carol', 'ruth', 'sharon', 'michelle', 'laura', 'sarah', 'kimberly', 'deborah',
    'jessica', 'shirley', 'cynthia', 'angela', 'melissa', 'brenda', 'amy', 'anna',
    'rebecca', 'virginia', 'kathleen', 'pamela', 'martha', 'debra', 'amanda', 'stephanie',
    'carolyn', 'christine', 'marie', 'janet', 'catherine', 'frances', 'ann', 'joyce',
    'diane', 'alice', 'julie', 'heather', 'teresa', 'doris', 'gloria', 'evelyn',
    'jean', 'cheryl', 'mildred', 'katherine', 'joan', 'ashley', 'judith', 'rose',
    'janice', 'kelly', 'nicole', 'judy', 'christina', 'kathy', 'theresa', 'beverly',
    'denise', 'tammy', 'irene', 'jane', 'lori', 'rachel', 'marilyn', 'andrea', 'kathryn',
    'louise', 'sara', 'anne', 'jacqueline', 'wanda', 'bonnie', 'julia', 'ruby', 'lois',
    'tina', 'phyllis', 'norma', 'paula', 'diana', 'annie', 'lillian', 'emily', 'robin',
    'emma', 'sophia', 'olivia', 'ava', 'isabella', 'mia', 'charlotte', 'amelia', 'harper',
    'evelyn', 'abigail', 'emily', 'ella', 'elizabeth', 'camila', 'luna', 'sofia', 'avery',
    'mila', 'aria', 'scarlett', 'penelope', 'layla', 'chloe', 'victoria', 'madison', 'eleanor',
    'grace', 'nora', 'riley', 'zoey', 'hannah', 'hazel', 'lily', 'ellie', 'violet', 'stella',
    'zoe', 'victoria', 'leah', 'audrey', 'alexa', 'savannah', 'aaliyah', 'camille', 'natalie',
    'ayesha', 'fatima', 'zara', 'aisha', 'noor', 'mei', 'yuki', 'sakura', 'hana', 'yuna',
    'priya', 'divya', 'anika', 'ananya', 'zainab', 'yasmin', 'leila', 'amara', 'imani', 'nia',
    'helin'
  ];
  
  // Extract first name and check if it's in the female names list
  const firstName = name.split(' ')[0].toLowerCase();
  return femaleNames.includes(firstName) ? 'women' : 'man';
};

/**
 * Determines the correct image path for the archetype based on the archetype name and gender.
 * Maps various archetype names to standardized keys and selects the appropriate gendered image.
 * @param archetype The name of the archetype (e.g., 'The Strategist').
 * @param gender The determined gender ('man' or 'women').
 * @returns The relative path to the archetype image asset.
 */
const getArchetypeImagePath = (archetype: string, gender: 'man' | 'women'): string => {
  // Remove "The " prefix if present and convert to lowercase for file naming
  const archetypeKey = archetype.replace(/^The\s+/i, '').toLowerCase();
  
  // Map common archetype names to the available image files
  const archetypeMapping: Record<string, string> = {
    // Analyst variations
    'analyst': 'analyst',
    'analytical thinker': 'analyst',
    'analytical': 'analyst',
    'data analyst': 'analyst',
    'problem solver': 'analyst',
    'critical thinker': 'analyst',
    
    // Strategist variations
    'strategist': 'strategist',
    'strategic thinker': 'strategist',
    'planner': 'strategist',
    'leader': 'strategist',
    'manager': 'strategist',
    
    // Visionary variations
    'visionary': 'visionary',
    'innovator': 'visionary',
    'creator': 'visionary',
    'entrepreneur': 'visionary',
    'creative': 'visionary',
    'dreamer': 'visionary',
    
    // Connector variations
    'connector': 'connector',
    'communicator': 'connector',
    'networker': 'connector',
    'facilitator': 'connector',
    'mediator': 'connector',
    'collaborator': 'connector',
    
    // Builder variations
    'builder': 'builder',
    'developer': 'builder',
    'designer': 'builder',
    'craftsman': 'builder',
    'engineer': 'builder',
    'architect': 'builder',
    
    // Optimizer variations
    'optimizer': 'optimizer',
    'efficiency expert': 'optimizer',
    'improver': 'optimizer',
    'refiner': 'optimizer',
    'perfectionist': 'optimizer'
  };
  
  // Get the mapped archetype or use a default
  const mappedArchetype = archetypeMapping[archetypeKey] || 'visionary';
  
  // Return the image path with the correct directory and capitalization for the first letter
  // The file names are inconsistent (some start with capital, some with lowercase)
  const capitalizedKey = mappedArchetype.charAt(0).toLowerCase() + mappedArchetype.slice(1);
  
  return `/assets/images/archetypes/${capitalizedKey}_${gender}.webp`;
};

/**
 * Personalizes the reasoning text by replacing generic terms like 'the user' with 'you'.
 * @param text The original reasoning text.
 * @returns The personalized reasoning text.
 */
const personalizeReasoning = (text: string): string => {
  // Replace phrases like "The user's" with "Your"
  let personalized = text.replace(/the user['']s/gi, "Your");
  personalized = personalized.replace(/the user/gi, "you");
  personalized = personalized.replace(/their/gi, "your");
  personalized = personalized.replace(/they/gi, "you");
  
  return personalized;
};

/**
 * Archetype configuration with consistent theming
 */
const archetypeConfig: Record<string, {
  title: string;
  color: string;
  bgColor: string;
  lightBgColor: string;
  icon: React.ReactNode;
  accentColor: string;
}> = {
  'The Strategist': {
    title: 'The Strategist',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    lightBgColor: 'bg-blue-50',
    icon: <Target size={28} className="text-blue-500" />,
    accentColor: 'bg-blue-400'
  },
  'The Builder': {
    title: 'The Builder',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    lightBgColor: 'bg-green-50',
    icon: <Award size={28} className="text-green-500" />,
    accentColor: 'bg-green-400'
  },
  'The Analyst': {
    title: 'The Analyst',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    lightBgColor: 'bg-purple-50',
    icon: <BarChart2 size={28} className="text-purple-500" />,
    accentColor: 'bg-purple-400'
  },
  'The Connector': {
    title: 'The Connector',
    color: 'text-pink-600',
    bgColor: 'bg-pink-500',
    lightBgColor: 'bg-pink-50',
    icon: <Users size={28} className="text-pink-500" />,
    accentColor: 'bg-pink-400'
  },
  'The Visionary': {
    title: 'The Visionary',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    lightBgColor: 'bg-amber-50',
    icon: <Star size={28} className="text-amber-500" />,
    accentColor: 'bg-amber-400'
  },
  'The Optimizer': {
    title: 'The Optimizer',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500',
    lightBgColor: 'bg-indigo-50',
    icon: <Settings size={28} className="text-indigo-500" />,
    accentColor: 'bg-indigo-400'
  }
};

// Default configuration for fallback
const defaultConfig = {
  title: 'Your Archetype',
  color: 'text-indigo-600',
  bgColor: 'bg-indigo-500',
  lightBgColor: 'bg-indigo-50',
  icon: <User size={28} className="text-indigo-500" />,
  accentColor: 'bg-indigo-400'
};

/**
 * Tooltip component for displaying additional information on hover.
 */
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Get research references for a specific archetype.
 * @param archetype The archetype to get references for
 * @returns Array of research references
 */
const getArchetypeResearch = (archetype: string): {author: string; year: string; title: string; publication?: string}[] => {
  const archetypeToResearch: Record<string, {author: string; year: string; title: string; publication?: string}[]> = {
    'Analyst': [
      { 
        author: 'Jung, C.G.', 
        year: '1971', 
        title: 'Psychological Types',
        publication: 'Princeton University Press'
      },
      { 
        author: 'Holland, J.L.', 
        year: '1997', 
        title: 'Making Vocational Choices: A Theory of Vocational Personalities and Work Environments',
        publication: 'Psychological Assessment Resources'
      }
    ],
    'Strategist': [
      { 
        author: 'Mintzberg, H.', 
        year: '1994', 
        title: 'The Rise and Fall of Strategic Planning',
        publication: 'Free Press'
      },
      { 
        author: 'Drucker, P.F.', 
        year: '2001', 
        title: 'The Essential Drucker',
        publication: 'HarperCollins'
      }
    ],
    'Visionary': [
      { 
        author: 'Gardner, H.', 
        year: '2011', 
        title: 'Creating Minds: An Anatomy of Creativity',
        publication: 'Basic Books'
      },
      { 
        author: 'Sternberg, R.J.', 
        year: '1999', 
        title: 'Handbook of Creativity',
        publication: 'Cambridge University Press'
      }
    ],
    'Connector': [
      { 
        author: 'Goleman, D.', 
        year: '2006', 
        title: 'Social Intelligence: The New Science of Human Relationships',
        publication: 'Bantam Books'
      },
      { 
        author: 'Gladwell, M.', 
        year: '2000', 
        title: 'The Tipping Point',
        publication: 'Little, Brown and Company'
      }
    ],
    'Builder': [
      { 
        author: 'Csikszentmihalyi, M.', 
        year: '2008', 
        title: 'Flow: The Psychology of Optimal Experience',
        publication: 'Harper Perennial'
      },
      { 
        author: 'Dweck, C.S.', 
        year: '2006', 
        title: 'Mindset: The New Psychology of Success',
        publication: 'Random House'
      }
    ],
    'Optimizer': [
      { 
        author: 'Kahneman, D.', 
        year: '2011', 
        title: 'Thinking, Fast and Slow',
        publication: 'Farrar, Straus and Giroux'
      },
      { 
        author: 'Pink, D.H.', 
        year: '2009', 
        title: 'Drive: The Surprising Truth About What Motivates Us',
        publication: 'Riverhead Books'
      }
    ]
  };
  
  // Find the closest matching archetype
  const archetypeKey = Object.keys(archetypeToResearch).find(key => 
    archetype.toLowerCase().includes(key.toLowerCase())
  ) || 'Analyst';
  
  return archetypeToResearch[archetypeKey];
};

/**
 * Get methodology explanation for archetype assessment.
 * @returns Methodology explanation text
 */
const getMethodologyExplanation = (): string => {
  return "CareerSense's archetype identification methodology combines psychometric analysis with natural language processing of career narratives. Our system analyzes linguistic patterns, career progression, skill emphasis, and achievement descriptions to identify dominant professional archetypes. This approach is grounded in Holland's RIASEC model, Jung's psychological types, and modern career development theories.";
};

/**
 * Get tooltip explanations for archetype characteristics.
 * @param archetype The archetype to get characteristics for
 * @returns Record of characteristic names and explanations
 */
const getArchetypeCharacteristics = (archetype: string): Record<string, string> => {
  const archetypeToCharacteristics: Record<string, Record<string, string>> = {
    'Analyst': {
      'Analytical Thinking': 'The ability to break down complex problems into component parts and examine them systematically to reach logical conclusions.',
      'Data-Driven': 'Preference for making decisions based on quantifiable information rather than intuition or feeling.',
      'Detail-Oriented': 'Strong attention to specifics and nuances that others might overlook.',
      'Objective': 'Tendency to remain impartial and consider facts without emotional bias.'
    },
    'Strategist': {
      'Big-Picture Focus': 'Ability to see the broader context and long-term implications of decisions.',
      'Systems Thinking': 'Understanding how different components interact within a larger framework.',
      'Future-Oriented': 'Tendency to plan ahead and anticipate potential outcomes.',
      'Decision-Making': 'Skill in evaluating options and choosing optimal paths forward.'
    },
    'Visionary': {
      'Creative Thinking': 'Ability to generate novel ideas and approaches to problems.',
      'Innovation': 'Skill in implementing new concepts and bringing ideas to fruition.',
      'Risk Tolerance': 'Comfort with uncertainty and willingness to pursue unproven paths.',
      'Inspirational': 'Capacity to motivate others with compelling visions of the future.'
    },
    'Connector': {
      'Emotional Intelligence': 'Ability to recognize and respond to emotions in oneself and others.',
      'Relationship Building': 'Skill in establishing and maintaining professional connections.',
      'Communication': 'Effectiveness in conveying ideas and information to diverse audiences.',
      'Collaboration': 'Preference for working with others to achieve shared goals.'
    },
    'Builder': {
      'Implementation Focus': 'Emphasis on turning plans into concrete results.',
      'Process Orientation': 'Attention to the steps needed to accomplish objectives.',
      'Persistence': 'Determination to overcome obstacles and complete projects.',
      'Practical Mindset': 'Preference for realistic, actionable approaches over theoretical ones.'
    },
    'Optimizer': {
      'Efficiency Focus': 'Emphasis on maximizing output while minimizing wasted resources.',
      'Continuous Improvement': 'Commitment to ongoing refinement of processes and outcomes.',
      'Quality Orientation': 'Attention to excellence and high standards in all work.',
      'Systematic Approach': 'Preference for methodical, organized ways of addressing challenges.'
    }
  };
  
  // Find the closest matching archetype
  const archetypeKey = Object.keys(archetypeToCharacteristics).find(key => 
    archetype.toLowerCase().includes(key.toLowerCase())
  ) || 'Analyst';
  
  return archetypeToCharacteristics[archetypeKey];
};

/**
 * Displays a card visualizing the user's professional archetype.
 * Shows the archetype name, description, reasoning, and a representative image.
 * Adapts to different incoming data structures for the archetype.
 * @param {ArchetypeCardProps} props - The component props.
 * @param {ArchetypeData} props.data - The archetype data object.
 * @param {string} [props.userName] - Optional user name for gendered image selection.
 */
const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ data, userName }) => {
  // Extract archetype data regardless of format
  const { 
    archetype, 
    description, 
    reasoning, 
    strengths, 
    challenges, 
    careerPaths, 
    developmentAreas, 
    confidence,
    secondaryArchetype 
  } = extractArchetypeData(data);
  
  const gender = determineGender(userName);
  const imagePath = getArchetypeImagePath(archetype, gender);
  
  // Get configuration for this archetype or use default
  const config = archetypeConfig[archetype] || defaultConfig;
  
  // Personalize the reasoning text
  const personalizedReasoning = personalizeReasoning(reasoning);
  
  return (
    <motion.div 
      className="rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Content */}
      <div className={`bg-white p-5 border-t-4 ${config.accentColor}`}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Archetype Description and Details */}
          <div className="w-full md:w-3/4">
            <div className="mb-4">
              <h3 className={`text-xl font-bold ${config.color} mb-2`}>{archetype}</h3>
              <p className="text-gray-700">{description}</p>
            </div>
            
            {/* Enhanced Explanation Section */}
            {personalizedReasoning && personalizedReasoning !== "No reasoning available" && (
              <div className={`p-4 rounded-lg border mb-6 ${config.lightBgColor} border-${config.accentColor.replace('bg-', '')}/20`}>
                <h3 className={`text-sm font-semibold mb-3 ${config.color} flex items-center`}>
                  <FileText size={16} className="mr-1" /> Why You're a {archetype.replace(/^The\s+/i, '')}
                </h3>
                
                {/* Confidence Explanation */}
                {confidence && confidence !== "Unknown" && (
                  <div className="mb-3 flex items-start">
                    <div className={`w-2 h-2 mt-1 mr-2 rounded-full ${
                      confidence === "High" ? "bg-green-500" : 
                      confidence === "Medium" ? "bg-blue-500" : 
                      "bg-amber-500"
                    }`}></div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">
                        {confidence === "High" ? "Strong Match: " : 
                         confidence === "Medium" ? "Good Match: " : 
                         "Potential Match: "}
                      </span>
                      {getConfidenceExplanation(confidence)}
                    </p>
                  </div>
                )}
                
                {/* Main Reasoning */}
                <p className="text-gray-700 text-sm mb-3">{personalizedReasoning}</p>
                
                {/* Highlighted Resume Elements */}
                {(() => {
                  const highlights = extractHighlightedElements(personalizedReasoning);
                  return highlights.length > 0 ? (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">Key Elements from Your Resume:</h4>
                      <div className="flex flex-wrap gap-2">
                        {highlights.map((highlight, index) => (
                          <span 
                            key={index} 
                            className={`inline-block px-2 py-1 rounded-md text-xs ${
                              highlight.category === 'skill' ? 'bg-blue-100 text-blue-700' :
                              highlight.category === 'experience' ? 'bg-purple-100 text-purple-700' :
                              highlight.category === 'achievement' ? 'bg-green-100 text-green-700' :
                              highlight.category === 'education' ? 'bg-amber-100 text-amber-700' :
                              highlight.category === 'trait' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {highlight.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            
            {/* Scientific Backing Section */}
            <div className="mb-6 mt-4">
              <div className="p-4 rounded-lg border border-indigo-100 bg-indigo-50/50">
                <h3 className={`text-sm font-semibold mb-3 text-indigo-700 flex items-center`}>
                  <BookOpen size={16} className="mr-1" /> Scientific Backing
                </h3>
                
                {/* Methodology Explanation */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-indigo-600 mb-1">Methodology</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {getMethodologyExplanation()}
                  </p>
                </div>
                
                {/* Archetype Characteristics with Tooltips */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-indigo-600 mb-2">Key Characteristics</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(getArchetypeCharacteristics(archetype)).map(([trait, explanation], index) => (
                      <Tooltip key={index} text={explanation}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 cursor-help border border-indigo-200">
                          {trait} <Info size={12} className="ml-1 text-indigo-500" />
                        </span>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                
                {/* Research References */}
                <div>
                  <h4 className="text-sm font-semibold text-indigo-600 mb-2">Research References</h4>
                  <div className="space-y-2">
                    {getArchetypeResearch(archetype).map((reference, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        <span className="font-medium">{reference.author} ({reference.year})</span>. {reference.title}.
                        {reference.publication && <span className="italic"> {reference.publication}</span>}.
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary Archetype */}
            {secondaryArchetype && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold mb-2 text-gray-700 flex items-center">
                  <Star size={16} className="mr-1" /> Secondary Archetype: {secondaryArchetype.archetype}
                  {secondaryArchetype.confidence && (
                    <span className={`ml-2 px-2 py-0.5 text-sm rounded-full ${
                      secondaryArchetype.confidence === "High" ? "bg-green-100 text-green-700" : 
                      secondaryArchetype.confidence === "Medium" ? "bg-blue-100 text-blue-700" : 
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {secondaryArchetype.confidence}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{secondaryArchetype.description}</p>
                
                {secondaryArchetype.strengths.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Additional Strengths:</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      {secondaryArchetype.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Archetype Image with Confidence Indicator */}
          <div className="w-full md:w-1/4 flex flex-col items-center justify-center">
            <div className={`relative p-2 rounded-xl shadow-md ${config.lightBgColor} mb-6`}>
              <img 
                src={imagePath} 
                alt={archetype} 
                className="w-36 h-36 object-cover rounded-lg"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const iconDiv = document.createElement('div');
                    iconDiv.className = `w-36 h-36 ${config.lightBgColor} rounded-lg flex items-center justify-center`;
                    iconDiv.innerHTML = `<div class="${config.color}">${config.icon}</div>`;
                    parent.appendChild(iconDiv);
                  }
                }}
              />
              {/* Archetype Badge */}
              <div className={`absolute -top-2 -right-2 p-1.5 rounded-full text-xs font-bold text-white ${config.bgColor} shadow-md`}>
                <Star size={14} />
              </div>
            </div>
            
            {/* Confidence Meter */}
            {confidence && confidence !== "Unknown" && (
              <div className="w-full max-w-[150px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-600">Confidence Level</span>
                  <span className={`text-sm font-bold ${
                    confidence === "High" ? "text-green-600" : 
                    confidence === "Medium" ? "text-blue-600" : 
                    "text-amber-600"
                  }`}>
                    {confidence}
                  </span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full ${
                      confidence === "High" ? "bg-gradient-to-r from-green-400 to-green-500 w-full" : 
                      confidence === "Medium" ? "bg-gradient-to-r from-blue-400 to-blue-500 w-2/3" : 
                      "bg-gradient-to-r from-amber-400 to-amber-500 w-1/3"
                    }`}
                    style={{ transition: "width 0.5s ease" }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArchetypeCard;
