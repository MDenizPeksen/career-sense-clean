import { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import SubNav from '../../components/layout/SubNav';
import { useUserData } from '../../hooks/useUserData';

/**
 * UserProfile component that displays user information and preferences
 * This component demonstrates how to access and use Clerk's user data
 * Implements [ComponentSplitting] and [AccessibilityCore] rules
 */
const UserProfile = () => {
  const { openUserProfile } = useClerk();
  const { 
    user, 
    isLoaded, 
    preferences, 
    updatePreferences, 
    getUserDisplayName,
    isLoading,
    error 
  } = useUserData();
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Handle theme toggle
  const handleThemeToggle = async () => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    await updatePreferences({ theme: newTheme });
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };
  
  // Handle notification toggle
  const handleNotificationToggle = async () => {
    await updatePreferences({ notifications: !preferences.notifications });
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <SubNav currentPath="/profile" />
      <div className="page-content">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          {/* Success message */}
          {showSuccessMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              Preferences updated successfully!
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              Error: {error}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img 
                  src={user?.imageUrl || '/default-avatar.png'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold">
                {getUserDisplayName()}
              </h2>
              <p className="text-gray-600 mt-1">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
              
              <button 
                onClick={() => openUserProfile()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full"
              >
                Manage Account
              </button>
            </div>
            
            <div className="w-full md:w-2/3">
              <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user?.fullName || 'Not provided'}</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.primaryEmailAddress?.emailAddress || 'Not provided'}</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium text-sm truncate">{user?.id}</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-gray-500">
                      Current: {preferences.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </p>
                  </div>
                  <button 
                    onClick={handleThemeToggle}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded transition-colors ${
                      isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {isLoading ? 'Saving...' : 'Toggle'}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Notifications</h4>
                    <p className="text-sm text-gray-500">
                      {preferences.notifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <button 
                    onClick={handleNotificationToggle}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded transition-colors ${
                      isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {isLoading ? 'Saving...' : 'Toggle'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
