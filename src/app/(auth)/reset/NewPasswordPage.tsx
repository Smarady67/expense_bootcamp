'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { handleResetPassword } from '@/src/lib/actions/auth';

export default function NewPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await handleResetPassword(email, password);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* LEFT PANEL: Identity */}
      <div className="md:w-1/2 bg-[#12141D] p-10 md:p-24 flex flex-col justify-start text-white">
        <div className="flex items-center gap-3 mb-32">
          <div className="w-6 h-6 bg-teal-400 rounded-md shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
          <span className="text-lg text-white font-bold tracking-[0.4em] uppercase">Spendly</span>
        </div>
        
        <div className="max-w-md">
          <h1 className="text-5xl font-bold leading-tight mb-10">
            Your security <br /> is our priority.
          </h1>
          <p className="text-lg font-medium leading-relaxed opacity-90">
            Choose a strong password that you haven't used before. Once updated, 
            you'll be able to sign back into your Spendly dashboard.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: New Password Input */}
      <div className="md:w-1/2 bg-[#313B56] p-10 md:p-24 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">New Password</h2>
            <p className="text-[#8B95B3] text-sm font-semibold">Create a new, strong password</p>
          </div>

          <form action={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-center">
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">New Password</label>
              <input 
                name="password"
                type="password" 
                required
                className="w-full bg-white rounded-lg p-4 text-slate-900 outline-none focus:ring-2 ring-teal-400/50 transition-all" 
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Confirm New Password</label>
              <input 
                name="confirmPassword"
                type="password" 
                required
                className="w-full bg-white rounded-lg p-4 text-slate-900 outline-none focus:ring-2 ring-teal-400/50 transition-all" 
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-[#313B56] py-3 rounded-lg font-bold text-sm tracking-widest mt-4 uppercase hover:bg-slate-200 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}