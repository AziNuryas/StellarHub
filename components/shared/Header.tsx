'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Rocket, Home, Compass, Satellite, User, LogOut, Settings } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      console.log('Header user:', user?.email);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Header auth change:', _event, session?.user?.email);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Rocket className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">StellarHub</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/feed" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
              <Home className="h-4 w-4" />
              Feed
            </Link>
            <Link href="/nasa" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
              <Satellite className="h-4 w-4" />
              NASA
            </Link>
            <Link href="/explore" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
              <Compass className="h-4 w-4" />
              Explore
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse"></div>
            ) : user ? (
              <>
                <span className="hidden md:inline text-gray-300 text-sm">
                  {user.email}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer border border-gray-700">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                    <DropdownMenuLabel className="text-white">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem 
                      className="text-red-400 hover:text-red-300 hover:bg-gray-800 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="sm" className="text-gray-300 hover:text-white">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}