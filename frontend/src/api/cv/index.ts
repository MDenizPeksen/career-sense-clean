import API from '../index';
import { CvAnalysis } from '../../types';

/**
 * Uploads and analyzes a CV file
 * @param file The CV file to analyze
 * @returns Processed CV analysis data
 */
export const uploadCV = async (file: File): Promise<CvAnalysis> => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await API.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Transform the result to ensure consistent structure
    const result = response.data;
    console.log("Original API response:", result);
    
    // Extract user profile data from all possible locations in the response
    // The backend might return data in different formats or nested structures
    const extractUserProfile = () => {
      // Check all possible locations for user profile data
      const userProfileData = result.user_profile || result.userProfile || {};
      
      // Extract name with fallbacks
      const name = userProfileData.name || result.name || "";
      
      // Extract role/title with fallbacks - backend might use different field names
      const current_role = userProfileData.current_role || 
                          userProfileData.title || 
                          userProfileData.role || 
                          result.current_role || 
                          result.title || 
                          result.role || 
                          "";
      
      // Extract sector/industry with fallbacks
      const sector = userProfileData.sector || 
                    userProfileData.industry || 
                    userProfileData.field ||
                    userProfileData.domain ||
                    result.sector || 
                    result.industry ||
                    result.field ||
                    result.domain ||
                    // Check if there's a sector in the title
                    (current_role && current_role.includes('–') ? current_role.split('–')[1].trim() : "") ||
                    (current_role && current_role.includes('-') ? current_role.split('-')[1].trim() : "") ||
                    (current_role && current_role.includes('|') ? current_role.split('|')[1].trim() : "") ||
                    "";
      
      // Extract location with fallbacks
      const location = userProfileData.location || 
                      userProfileData.city ||
                      userProfileData.region ||
                      userProfileData.area ||
                      userProfileData.address ||
                      result.location || 
                      result.city ||
                      result.region ||
                      result.area ||
                      result.address ||
                      "";
      
      // Extract experience with fallbacks - backend might use different field names
      const years_experience = userProfileData.years_experience || 
                              userProfileData.yearsOfExperience || 
                              userProfileData.experience || 
                              result.years_experience || 
                              result.yearsOfExperience || 
                              result.experience || 
                              0;
      
      // Extract education information correctly
      let education: string[] = [];
      if (Array.isArray(userProfileData.education)) {
        education = userProfileData.education;
      } else if (Array.isArray(result.education)) {
        education = result.education;
      } else if (typeof userProfileData.education === 'string') {
        education = [userProfileData.education];
      } else if (typeof result.education === 'string') {
        education = [result.education];
      }
      
      // Extract email with fallbacks
      const email = userProfileData.email || 
                   result.email || 
                   "";
      
      // Extract LinkedIn with fallbacks
      const linkedin = userProfileData.linkedin || 
                      userProfileData.linkedIn || 
                      result.linkedin || 
                      result.linkedIn || 
                      "";
      
      // Extract portfolio URL with fallbacks
      const portfolio_url = userProfileData.portfolio_url || 
                           userProfileData.portfolio || 
                           userProfileData.portfolioUrl || 
                           result.portfolio_url || 
                           result.portfolio || 
                           result.portfolioUrl || 
                           "";
      
      // Extract industries information correctly
      let industries: string[] = [];
      if (Array.isArray(userProfileData.industries)) {
        industries = userProfileData.industries;
      } else if (Array.isArray(result.industries)) {
        industries = result.industries;
      } else if (typeof userProfileData.industries === 'string') {
        industries = userProfileData.industries.split(',').map((i: string) => i.trim());
      } else if (typeof result.industries === 'string') {
        industries = result.industries.split(',').map((i: string) => i.trim());
      }
      
      // Check if industries are nested in careerInsights
      if ((!industries || industries.length === 0) && result.careerInsights && Array.isArray(result.careerInsights.industryFit)) {
        industries = result.careerInsights.industryFit;
      }
      
      return {
        name,
        current_role,
        sector,
        location,
        years_experience,
        education,
        email,
        linkedin,
        portfolio_url,
        industries
      };
    };
    
    // Extract profile strengths data from all possible locations
    const extractProfileStrengths = () => {
      const strengthsData = result.profile_strengths || {};
      
      // Extract skills information correctly from all possible locations
      let skills: string[] = [];
      
      // Try to get skills from profile_strengths
      if (Array.isArray(strengthsData.skills)) {
        skills = strengthsData.skills;
      } else if (typeof strengthsData.skills === 'string') {
        skills = strengthsData.skills.split(',').map((s: string) => s.trim());
      }
      
      // If not found, try to get from userProfile
      if (skills.length === 0) {
        const userProfileData = result.user_profile || result.userProfile || {};
        if (Array.isArray(userProfileData.skills)) {
          skills = userProfileData.skills;
        } else if (typeof userProfileData.skills === 'string') {
          skills = userProfileData.skills.split(',').map((s: string) => s.trim());
        }
      }
      
      // If still not found, try to get from root
      if (skills.length === 0) {
        if (Array.isArray(result.skills)) {
          skills = result.skills;
        } else if (typeof result.skills === 'string') {
          skills = result.skills.split(',').map((s: string) => s.trim());
        }
      }
      
      // Extract core competencies from all possible locations
      let coreCompetencies: string[] = [];
      if (Array.isArray(strengthsData.core_competencies)) {
        coreCompetencies = strengthsData.core_competencies;
      } else if (Array.isArray(result.core_competencies)) {
        coreCompetencies = result.core_competencies;
      } else if (typeof strengthsData.core_competencies === 'string') {
        coreCompetencies = strengthsData.core_competencies.split(',').map((c: string) => c.trim());
      } else if (typeof result.core_competencies === 'string') {
        coreCompetencies = result.core_competencies.split(',').map((c: string) => c.trim());
      }
      
      // If core competencies are empty, use strengths from analysis
      if (coreCompetencies.length === 0 && result.analysis && Array.isArray(result.analysis.strengths)) {
        coreCompetencies = result.analysis.strengths;
      }
      
      // Extract achievements from all possible locations
      let achievements: string[] = [];
      if (Array.isArray(strengthsData.achievements)) {
        achievements = strengthsData.achievements;
      } else if (Array.isArray(result.achievements)) {
        achievements = result.achievements;
      }
      
      return {
        skills,
        core_competencies: coreCompetencies,
        achievements
      };
    };
    
    // Extract analysis data from all possible locations
    const extractAnalysis = () => {
      const analysisData = result.analysis || {};
      
      // Extract strengths
      let strengths: string[] = [];
      if (Array.isArray(analysisData.strengths)) {
        strengths = analysisData.strengths;
      } else if (Array.isArray(result.strengths)) {
        strengths = result.strengths;
      }
      
      // Extract improvement areas
      let improvement_areas: string[] = [];
      if (Array.isArray(analysisData.improvement_areas)) {
        improvement_areas = analysisData.improvement_areas;
      } else if (Array.isArray(analysisData.improvementAreas)) {
        improvement_areas = analysisData.improvementAreas;
      } else if (Array.isArray(result.improvement_areas)) {
        improvement_areas = result.improvement_areas;
      } else if (Array.isArray(result.improvementAreas)) {
        improvement_areas = result.improvementAreas;
      }
      
      // Extract missing elements
      let missing_elements: string[] = [];
      if (Array.isArray(analysisData.missing_elements)) {
        missing_elements = analysisData.missing_elements;
      } else if (Array.isArray(analysisData.missingElements)) {
        missing_elements = analysisData.missingElements;
      } else if (Array.isArray(result.missing_elements)) {
        missing_elements = result.missing_elements;
      } else if (Array.isArray(result.missingElements)) {
        missing_elements = result.missingElements;
      }
      
      // Extract keyword optimization
      let keyword_optimization: string[] = [];
      if (Array.isArray(analysisData.keyword_optimization)) {
        keyword_optimization = analysisData.keyword_optimization;
      } else if (Array.isArray(analysisData.keywordOptimization)) {
        keyword_optimization = analysisData.keywordOptimization;
      } else if (Array.isArray(result.keyword_optimization)) {
        keyword_optimization = result.keyword_optimization;
      } else if (Array.isArray(result.keywordOptimization)) {
        keyword_optimization = result.keywordOptimization;
      }
      
      return {
        strengths,
        improvement_areas,
        missing_elements,
        keyword_optimization,
        ...analysisData
      };
    };
    
    // Extract role matching data from all possible locations
    const extractRoleMatching = () => {
      // Check for role_matching in the main result (snake_case or camelCase)
      if (Array.isArray(result.role_matching) && result.role_matching.length > 0) {
        return result.role_matching;
      }
      
      if (Array.isArray(result.roleMatching) && result.roleMatching.length > 0) {
        return result.roleMatching;
      }
      
      // Check if response has a data property (common API pattern)
      if (result.data && Array.isArray(result.data.role_matching) && result.data.role_matching.length > 0) {
        return result.data.role_matching;
      }
      
      // Check if recommended_roles in analysis can be converted to role_matching format
      if (result.analysis && Array.isArray(result.analysis.recommended_roles) && result.analysis.recommended_roles.length > 0) {
        // Convert simple role names to full role objects with default values
        return result.analysis.recommended_roles.map((role: string, index: number) => ({
          role: role,
          match_percentage: 85 - (index * 10), // Decreasing match percentage for each role
          transition_difficulty: index === 0 ? "Easy" : index === 1 ? "Moderate" : "Challenging",
          required_skills: ["Data Analysis", "Communication", "Problem Solving", "Critical Thinking", "Teamwork"],
          role_description: `${role} is a professional who helps organizations achieve their business objectives.`,
          salary_range: "50,000 - 80,000"
        }));
      }
      
      // If no role matching data found, return empty array
      return [];
    };
    
    // Create the normalized result
    const normalizedUserProfile = extractUserProfile();
    const normalizedStrengths = extractProfileStrengths();
    const normalizedAnalysis = extractAnalysis();
    const normalizedRoleMatching = extractRoleMatching();
    
    // Create the final normalized result
    const normalizedResult: CvAnalysis = {
      user_profile: normalizedUserProfile,
      profile_strengths: normalizedStrengths,
      analysis: normalizedAnalysis,
      role_matching: normalizedRoleMatching,
      archetype: result.archetype || null,
      ...result
    };
    
    console.log("Normalized API response:", normalizedResult);
    return normalizedResult;
  } catch (error: any) {
    console.error('Error uploading CV:', error);
    
    // Enhance error message with more details if available
    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         error.message || 
                         'Failed to analyze CV';
                         
    throw new Error(errorMessage);
  }
};

/**
 * Checks if the CV analysis backend is available
 * @returns True if the backend is online, false otherwise
 */
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await API.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};
