'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  Rocket, Mail, Lock, Eye, EyeOff, Github, Globe,
  ChevronRight
} from 'lucide-react';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast.success('🚀 Welcome to the Cosmos!');
      
      // Create profile if doesn't exist
      const { data: profileExists } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (!profileExists) {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: data.user.email?.split('@')[0] || 'CosmicExplorer',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
            bio: 'Space Explorer',
            verified: false
          });
      }
      
      // ✅ Redirect ke feed
      router.push('/feed');
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error('Failed to login with Google');
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error('Failed to login with GitHub');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stellar-black via-stellar-dark to-stellar-black overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-block mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4 group relative">
                  <Rocket className="h-8 w-8 text-white animate-bounce" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                </div>
              </Link>
              
              <h1 className="text-4xl font-bold text-white mb-3">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Cosmos
                </span>
              </h1>
              <p className="text-gray-400">
                Sign in to continue your space exploration
              </p>
            </div>

            {/* Card */}
            <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-800/50 shadow-2xl shadow-purple-500/10">
              {/* OAuth Buttons */}
              <div className="space-y-4 mb-8">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                    <Globe className="h-5 w-5 text-gray-900" />
                  </div>
                  <span className="text-white">Continue with Google</span>
                </button>
                
                <button 
                  onClick={handleGithubLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center">
                    <Github className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white">Continue with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-900/40 px-4 text-sm text-gray-500">Or continue with email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
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
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-gray-300 text-sm font-medium">
                      Password
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 group shadow-lg shadow-purple-500/20"
                >
                  {loading ? (
                    <>
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch into Cosmos</span>
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-400">
                  New to Cosmos?{' '}
                  <Link 
                    href="/register" 
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>Create account</span>
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