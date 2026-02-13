'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  Rocket, Mail, Lock, Eye, EyeOff, User, LogIn,
  Sparkle, Satellite, ChevronRight, Star, Circle
} from 'lucide-react';

export default function RegisterPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username || formData.email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Create profile in database
      if (data.user) {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: formData.username || formData.email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
            bio: 'Space Explorer',
            verified: false
          });
      }

      toast.success('🎉 Account created successfully! Please check your email for verification');
      
      // Auto login after register
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (!loginError) {
        setTimeout(() => {
          window.location.href = '/feed';
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stellar-black via-stellar-dark to-stellar-black overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-block mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4 group relative">
                  <Circle className="h-8 w-8 text-white" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                </div>
              </Link>
              
              <h1 className="text-4xl font-bold text-white mb-3">
                Begin Your{' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Cosmic Journey
                </span>
              </h1>
              <p className="text-gray-400">
                Join our community of space explorers
              </p>
            </div>

            {/* Card */}
            <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-800/50 shadow-2xl shadow-blue-500/10">
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    Username
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="cosmic_explorer"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="email"
                      placeholder="astro@explorer.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 group shadow-lg shadow-purple-500/20"
                >
                  {loading ? (
                    <>
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating your account...</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-5 w-5" />
                      <span>Launch Your Journey</span>
                      <Sparkle className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>Sign in here</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>
            </div>

            {/* Back to home */}
            <div className="text-center mt-8">
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors inline-flex items-center gap-1 group"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}