import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User } from '../App';
import { AlertCircle, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import logo from '../assets/new logo.png';


interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onGoToSignUp: () => void;
}

export function LoginPage({ onLogin, onGoToSignUp }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
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
          <p className="text-[#5B7A4A]">
            Welcome back! Please login to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#D4E7C5] overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-[#4A7C3A] via-[#5B8A47] to-[#C8E6A0]"></div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                <label htmlFor="password" className="text-[#2D5016]">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#D4E7C5] bg-[#FAFBF8] text-[#2D5016] placeholder:text-[#5B7A4A]/50 focus:border-[#4A7C3A] focus:ring-2 focus:ring-[#4A7C3A]/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Don't have an account?</span>
                <button 
                  type="button"
                  onClick={onGoToSignUp} 
                  className="text-[#4A7C3A] hover:text-[#2D5016] transition-colors font-medium text-sm"
                > 
                  Sign up here
                </button>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#4A7C3A] to-[#5B8A47] hover:from-[#3D6B2F] hover:to-[#4A7C3A] text-white rounded-xl shadow-lg shadow-[#4A7C3A]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}