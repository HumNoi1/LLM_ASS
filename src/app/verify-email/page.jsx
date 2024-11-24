"use client";

import Link from 'next/link';

const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-lg p-8 shadow-lg text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
        
        <p className="text-slate-400 mb-6">
          We've sent you an email with a verification link. Please click the link to verify your account.
        </p>
        
        <p className="text-slate-400">
          Didn't receive the email?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-400">
            Try logging in again
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;