import React from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, MapPin, Clock, Mail, Linkedin, Globe, BookOpen, Award, FileText } from 'react-feather';
import { CvAnalysis } from '../../../../types';

/**
 * Props for the UserProfile component.
 */
interface UserProfileProps {
  /**
   * The user's profile information extracted from the CV analysis.
   * Optional, as it might not be available.
   */
  userProfile?: CvAnalysis['user_profile'];
  /**
   * Strengths identified from the user's profile, such as skills and competencies.
   * Optional, as it might not be available.
   */
  profileStrengths?: CvAnalysis['profile_strengths'];
  /**
   * High-level professional summary for recruiters.
   * Optional, as it might not be available.
   */
  recruiterSummary?: string;
}

/**
 * UserProfile component displays user information from CV analysis
 * Follows AtomicDesign and ComponentSplitting guidelines
 */
const UserProfile: React.FC<UserProfileProps> = ({ userProfile, profileStrengths, recruiterSummary }) => {
  // For debugging
  console.log("UserProfile received data:", userProfile);
  console.log("Education data received:", userProfile?.education);
  
  // Create fallback profile with empty strings instead of default values
  // This will allow us to show "No X specified" messages consistently
  const emptyProfile = {
    name: '',
    current_role: '',
    sector: '',
    location: '',
    years_experience: 0,
    education: [],
    email: '',
    linkedin: '',
    portfolio_url: '',
    industries: []
  };
  
  // Merge the provided profile with empty profile to ensure all fields exist
  const displayProfile = { ...emptyProfile, ...(userProfile || {}) };
  
  // Default profile strengths if none provided
  const emptyStrengths = {
    skills: [],
    core_competencies: [],
    achievements: []
  };
  
  // Merge the provided strengths with empty strengths
  const displayStrengths = { ...emptyStrengths, ...(profileStrengths || {}) };

  /**
   * Format education items for better display
   * Ensures all education entries are displayed
   */
  const formatEducation = (education: any[]): Array<{degree: string, major: string, university: string}> => {
    if (!education || !Array.isArray(education) || education.length === 0) return [];
    
    console.log("Raw education data:", education);
    
    // Handle nested arrays format (multiple degrees)
    // This is the format we're now requesting from the OpenAI API
    const formattedEntries: Array<{degree: string, major: string, university: string}> = [];
    
    // First, check if we have a nested array structure
    const hasNestedArrays = education.some(item => Array.isArray(item));
    
    if (hasNestedArrays) {
      // Process each education entry (which is an array of degree details)
      education.forEach(entry => {
        if (Array.isArray(entry)) {
          const validItems = entry.filter(item => 
            item && typeof item === 'string' && item.trim() !== ''
          );
          
          if (validItems.length > 0) {
            // Extract degree, major, and university
            const degree = validItems[0] || '';
            const major = validItems.length > 1 ? validItems[1] : '';
            const university = validItems.length > 2 ? validItems[2] : '';
            
            formattedEntries.push({ degree, major, university });
          }
        } else if (entry && typeof entry === 'string' && entry.trim() !== '') {
          // Handle single string entries by parsing them
          const parts = entry.split(' - ').map(part => part.trim());
          const degree = parts[0] || '';
          const major = parts.length > 1 ? parts[1] : '';
          const university = parts.length > 2 ? parts[2] : '';
          
          formattedEntries.push({ degree, major, university });
        }
      });
    } else {
      // Handle flat array (single degree with multiple components)
      // Group items into logical chunks of 2-3 items
      for (let i = 0; i < education.length; i += 3) {
        const chunk = education.slice(i, Math.min(i + 3, education.length));
        const validItems = chunk.filter(item => 
          item && typeof item === 'string' && item.trim() !== ''
        );
        
        if (validItems.length > 0) {
          // Extract degree, major, and university
          const degree = validItems[0] || '';
          const major = validItems.length > 1 ? validItems[1] : '';
          const university = validItems.length > 2 ? validItems[2] : '';
          
          formattedEntries.push({ degree, major, university });
        }
      }
    }
    
    return formattedEntries;
  };
  
  const formattedEducation = formatEducation(displayProfile.education);

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="user-profile"
    >
      {/* Header with user info - Following AccessibilityCore guidelines */}
      <div className="bg-indigo-500 p-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4 shadow-md">
            <User size={28} className="text-indigo-500" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{displayProfile.name || 'Unknown Name'}</h2>
            <div className="flex flex-wrap items-center mt-2 gap-x-4 gap-y-2">
              {/* Always show role with fallback */}
              <div className="flex items-center text-white text-base">
                <Briefcase size={16} className="mr-1" aria-hidden="true" />
                <span>{displayProfile.current_role || 'No role specified'}</span>
              </div>
              
              {/* Always show sector with fallback */}
              <div className="flex items-center text-white text-base">
                <Globe size={16} className="mr-1" aria-hidden="true" />
                <span>{displayProfile.sector || 'No sector specified'}</span>
              </div>
              
              {/* Always show location with fallback */}
              <div className="flex items-center text-white text-base">
                <MapPin size={16} className="mr-1" aria-hidden="true" />
                <span>{displayProfile.location || 'No location specified'}</span>
              </div>
              
              {/* Always show experience with fallback */}
              <div className="flex items-center text-white text-base">
                <Clock size={16} className="mr-1" aria-hidden="true" />
                <span>{displayProfile.years_experience ? `${displayProfile.years_experience} years experience` : 'Experience not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Professional Summary Section - Following AtomicDesign guidelines */}
      {recruiterSummary && (
        <div className="bg-white p-4 border-t border-indigo-100">
          <h3 className="text-base font-medium text-indigo-700 mb-2 flex items-center">
            <FileText size={16} className="mr-1 text-indigo-500" aria-hidden="true" />
            <span>Professional Summary</span>
          </h3>
          <p className="text-sm text-gray-700 italic">
            {recruiterSummary}
          </p>
        </div>
      )}
      
      {/* Main content grid - Following ResponsiveFirst guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Left column */}
        <div>
          {/* Education section */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-500 mb-2 flex items-center">
              <BookOpen size={16} className="mr-1 text-indigo-400" aria-hidden="true" />
              <span>Education</span>
            </h3>
            {formattedEducation && formattedEducation.length > 0 ? (
              <div className="space-y-2">
                {formattedEducation.map((edu, index) => (
                  <div 
                    key={index} 
                    className="text-sm bg-indigo-50 p-3 rounded"
                  >
                    <span className="font-medium text-indigo-700">{edu.degree}</span>
                    {edu.major && (
                      <>
                        <span className="mx-1">-</span>
                        <span className="text-blue-600">{edu.major}</span>
                      </>
                    )}
                    {edu.university && (
                      <>
                        <span className="mx-1">-</span>
                        <span className="text-gray-700">{edu.university}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No education information available</div>
            )}
          </div>
        </div>
        
        {/* Right column */}
        <div>
          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-500 mb-2 flex items-center">
              <Mail size={16} className="mr-1 text-indigo-400" aria-hidden="true" />
              <span>Contact Information</span>
            </h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                <Mail size={12} className="inline mr-1 text-indigo-400" aria-hidden="true" />
                {displayProfile.email ? (
                  <a href={`mailto:${displayProfile.email}`} className="text-indigo-600 hover:underline">
                    {displayProfile.email}
                  </a>
                ) : (
                  <span className="text-gray-500 italic">No email provided</span>
                )}
              </div>
              <div className="text-sm text-gray-700">
                <Linkedin size={12} className="inline mr-1 text-indigo-400" aria-hidden="true" />
                {displayProfile.linkedin ? (
                  <a 
                    href={displayProfile.linkedin.startsWith('http') ? displayProfile.linkedin : `https://${displayProfile.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {displayProfile.linkedin}
                  </a>
                ) : (
                  <span className="text-gray-500 italic">No LinkedIn profile</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Industries */}
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-500 mb-2 flex items-center">
              <Globe size={16} className="mr-1 text-indigo-400" aria-hidden="true" />
              <span>Industries</span>
            </h3>
            {displayProfile.industries && displayProfile.industries.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {displayProfile.industries.map((industry: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No industries specified</div>
            )}
          </div>
          
          {/* Skills */}
          <div>
            <h3 className="text-base font-medium text-gray-500 mb-2 flex items-center">
              <Award size={16} className="mr-1 text-indigo-400" aria-hidden="true" />
              <span>Skills</span>
            </h3>
            {displayStrengths.skills && displayStrengths.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {displayStrengths.skills.map((skill: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No skills information available</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
