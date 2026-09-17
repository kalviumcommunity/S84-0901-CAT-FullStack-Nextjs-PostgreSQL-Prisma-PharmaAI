import { Suspense } from 'react';
import AuthForm from '@/components/auth-form';

export const metadata = {
  title: 'Sign In | PharmaResearch AI',
  description: 'Access the evidence workspace and clinical intelligence dashboard.',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-[#f7f8f5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<div className="text-xs text-[#52605a]">Loading sign in...</div>}>
        <AuthForm initialMode="login" />
      </Suspense>
    </main>
  );
}