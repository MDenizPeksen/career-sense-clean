import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

// Define interface for user preferences
interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

/**
 * Custom hook for accessing and managing user data
 * Follows the CleanHooks rule from our project guidelines
 * 
 * @returns User data and functions to update user metadata
 */
export const useUserData = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User preferences with defaults
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications: true,
    language: 'en',
  });

  // Load user preferences from Clerk metadata when user is loaded
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Use type assertion to access publicMetadata
      const metadata = user.unsafeMetadata as Record<string, any> || {};
      const userPrefs = metadata.preferences as Partial<UserPreferences> || {};
      
      setPreferences(prev => ({
        ...prev,
        ...userPrefs,
      }));
    }
  }, [isLoaded, isSignedIn, user]);

  /**
   * Update user preferences
   * @param newPreferences - New preferences to merge with existing ones
   */
  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedPreferences = {
        ...preferences,
        ...newPreferences,
      };
      
      // Use Clerk's setMetadata method instead of update
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          preferences: updatedPreferences,
        },
      });
      
      setPreferences(updatedPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      console.error('Error updating user preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get user's full name or email if name is not available
   */
  const getUserDisplayName = () => {
    if (!user) return '';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.firstName) {
      return user.firstName;
    }
    
    return user.primaryEmailAddress?.emailAddress || '';
  };

  return {
    user,
    isLoaded,
    isSignedIn,
    preferences,
    updatePreferences,
    getUserDisplayName,
    isLoading,
    error,
  };
};
