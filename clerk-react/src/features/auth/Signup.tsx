import { SignUp } from '@clerk/clerk-react';

/**
 * Signup component that renders the Clerk SignUp UI
 * This component displays the registration form provided by Clerk
 */
const Signup = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Join CareerSense</h1>
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/login"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default Signup;
