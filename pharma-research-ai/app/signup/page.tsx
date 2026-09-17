import { Suspense } from 'react';
import AuthForm from '@/components/auth-form';

export const metadata = {
  title: 'Sign Up | PharmaResearch AI',
  description: 'Create your clinical research account and explore trial datasets.',
};

export default function SignupPage() {
  return (
    <main className="min-h-screen w-full bg-[#f7f8f5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<div className="text-xs text-[#52605a]">Loading registration...</div>}>
        <AuthForm initialMode="signup" />
      </Suspense>
    </main>
  );
}
