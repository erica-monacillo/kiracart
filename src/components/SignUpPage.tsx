import React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import logo from '../assets/new logo.png';


interface SignUpPageProps {
  onSignUp: (
    username: string,
    email: string,
    password: string,
    role: 'admin' | 'cashier',
    name: string
  ) => Promise<void>;
  onBackToLogin: () => void;
}

type UserRole = 'admin' | 'cashier';

export function SignUpPage({ onSignUp, onBackToLogin }: SignUpPageProps) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Call the sign-up handler
      await onSignUp(username, email, password, selectedRole, name);
      setSuccess(true);
      
      // Clear form
      setUsername('');
      setEmail('');
      setPassword('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAFBF8] via-[#F5F9F2] to-[#E8F5D4]">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#C8E6A0]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#4A7C3A]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="relative">
              <img 
                src={logo} 
                alt="POSCart Logo" 
                className="w-40 h-40 mx-auto drop-shadow-lg object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>
          <h1 className="text-[#2D5016] mb-2">Create Account</h1>
          <p className="text-[#5B7A4A]">
            Already have an account?{' '}
            <button 
              onClick={onBackToLogin} 
              className="text-[#4A7C3A] hover:text-[#2D5016] transition-colors"
            >
              Log in
            </button>
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#D4E7C5] overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-[#4A7C3A] via-[#5B8A47] to-[#C8E6A0]"></div>
          
          <div className="p-8">
            {/* Role Toggle Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex-1 py-3 px-6 rounded-xl transition-all border-2 ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-[#4A7C3A] to-[#5B8A47] text-white border-[#4A7C3A] shadow-lg shadow-[#4A7C3A]/20'
                    : 'bg-white text-[#2D5016] border-[#D4E7C5] hover:bg-[#E8F5D4] hover:border-[#4A7C3A]'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('cashier')}
                className={`flex-1 py-3 px-6 rounded-xl transition-all border-2 ${
                  selectedRole === 'cashier'
                    ? 'bg-gradient-to-r from-[#4A7C3A] to-[#5B8A47] text-white border-[#4A7C3A] shadow-lg shadow-[#4A7C3A]/20'
                    : 'bg-white text-[#2D5016] border-[#D4E7C5] hover:bg-[#E8F5D4] hover:border-[#4A7C3A]'
                }`}
              >
                Cashier
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-[#E8F5D4] border-[#C8E6A0]">
                  <CheckCircle className="size-4 text-[#4A7C3A]" />
                  <AlertDescription className="text-[#2D5016]">
                    Account created successfully! Redirecting to login...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-[#2D5016]">Full Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#D4E7C5] bg-[#FAFBF8] text-[#2D5016] placeholder:text-[#5B7A4A]/50 focus:border-[#4A7C3A] focus:ring-2 focus:ring-[#4A7C3A]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-[#2D5016]">Username</label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#D4E7C5] bg-[#FAFBF8] text-[#2D5016] placeholder:text-[#5B7A4A]/50 focus:border-[#4A7C3A] focus:ring-2 focus:ring-[#4A7C3A]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-[#2D5016]">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#D4E7C5] bg-[#FAFBF8] text-[#2D5016] placeholder:text-[#5B7A4A]/50 focus:border-[#4A7C3A] focus:ring-2 focus:ring-[#4A7C3A]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-[#2D5016]">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#D4E7C5] bg-[#FAFBF8] text-[#2D5016] placeholder:text-[#5B7A4A]/50 focus:border-[#4A7C3A] focus:ring-2 focus:ring-[#4A7C3A]/20 transition-all"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#4A7C3A] to-[#5B8A47] hover:from-[#3D6B2F] hover:to-[#4A7C3A] text-white rounded-xl shadow-lg shadow-[#4A7C3A]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}