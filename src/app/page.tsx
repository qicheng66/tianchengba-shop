'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F4EC' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse" style={{ backgroundColor: '#B9975B' }} />
        <p className="text-sm" style={{ color: '#6B6B6B' }}>加载中...</p>
      </div>
    </div>
  );
}
