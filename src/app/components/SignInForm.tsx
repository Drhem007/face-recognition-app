"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface SignInFormProps {
  onSubmit?: (email: string, password: string) => void;
  showLogo?: boolean;
}

const SignInForm = ({ onSubmit, showLogo = true }: SignInFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    
    // Clear any previous errors
    setError('');
    setIsLoading(true);
    
    try {
      // Use Supabase auth
      const { error: authError } = await signIn(email, password);
      
      if (authError) {
        setError(authError.message);
        toast.error('Sign in failed. Please check your credentials.');
      } else {
        toast.success('Signed in successfully!');
        // Call the onSubmit handler from parent if provided (for backwards compatibility)
        if (onSubmit) {
          onSubmit(email, password);
        }
      }
    } catch {
      setError('An unexpected error occurred');
      toast.error('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg transition-all duration-500 animate-fadeIn">
      {/* Logo at the top - only show if showLogo is true */}
      {showLogo && (
        <div className="flex items-center mb-8">
          {/* U Logo container - exact match to the image */}
          <svg width="50" height="50" viewBox="0 0 60 60" className="flex-shrink-0">
            <rect x="0" y="0" width="60" height="60" fill="#F39C12" />
            <rect x="22" y="0" width="16" height="30" fill="white" />
          </svg>
          
          <div className="w-0.5 h-14 mx-2 bg-[#F39C12]"></div>
          <div className="flex flex-col text-[#005694] font-bold">
            <span className="text-sm tracking-wide">ECOLE</span>
            <span className="text-sm tracking-wide">POLYTECHNIQUE</span>
            <span className="text-sm tracking-wide">D&apos;AGADIR</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
        <p className="text-gray-500 mt-1">Welcome back to the admin portal</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005694] focus:border-transparent"
            placeholder="name@example.com"
            disabled={isLoading}
            suppressHydrationWarning
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005694] focus:border-transparent"
            placeholder="••••••••"
            disabled={isLoading}
            suppressHydrationWarning
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_me"
              type="checkbox"
              className="h-4 w-4 text-[#005694] border-gray-300 rounded"
              suppressHydrationWarning
            />
            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-[#005694] hover:text-[#F39C12]">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#005694] hover:bg-[#004a80] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005694] transition-colors"
          disabled={isLoading}
          suppressHydrationWarning
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default SignInForm; 