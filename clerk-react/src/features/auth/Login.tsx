import { SignIn } from '@clerk/clerk-react';

/**
 * Login component that renders the Clerk SignIn UI
 * This component displays the login form provided by Clerk
 */
const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to CareerSense</h1>
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/signup"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default Login;
