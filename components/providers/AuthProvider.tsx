'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in, refreshing router...');
        router.refresh();
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        router.push('/login');
        router.refresh();
      }
      
      setLoading(false);
    });

    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session:', session?.user?.email);
      setLoading(false);
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}