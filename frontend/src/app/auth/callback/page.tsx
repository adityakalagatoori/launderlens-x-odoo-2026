"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const id = params.get('id');
    const error = params.get('error');

    if (error || !token) {
      router.push('/login?error=oauth_failed');
      return;
    }

    // Store auth
    setAuth({ id: id || '', email: email || '', name: name || '' }, token);
    router.push('/dashboard');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-travel-gradient">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#63D5DF] mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Signing you in...</p>
      </div>
    </div>
  );
}
