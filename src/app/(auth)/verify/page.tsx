'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { handleVerifyCode } from '@/src/lib/actions/auth';

export default function VerifyCodePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'signup';

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const code = formData.get("code") as string;
    
    const result = await handleVerifyCode(email, code, type);
    
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
          <div className="w-6 h-6 bg-teal-400 rounded-md shadow-[0_0_15px_rgba(45,212,191,0.5)] "></div>
          <span className="text-lg text-white font-bold tracking-[0.4em] uppercase ">Spendly</span>
        </div>
        
        <div className="max-w-md">
          <h1 className="text-5xl font-bold leading-tight mb-10">
            Secure your <br /> financial future.
          </h1>
          <p className="text-lg font-medium leading-relaxed opacity-90">
            We’ve sent a 6-digit verification code to <span className="text-teal-400">{email}</span>. 
            Enter it on the right to verify your identity.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Verify Input */}
      <div className="md:w-1/2 bg-[#313B56] p-10 md:p-24 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Verify Code</h2>
            <p className="text-[#8B95B3] text-sm font-semibold">
              {type === 'reset' ? 'Check your inbox for the reset code' : 'Check your inbox for the signup code'}
            </p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-center">
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">6-Digit Code</label>
              <input 
                name="code"
                type="text" 
                maxLength={6}
                required
                className="w-full bg-white rounded-lg p-4 text-slate-900 outline-none text-center tracking-[0.5em] text-2xl font-bold placeholder:text-slate-300" 
                placeholder="000000"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-[#313B56] py-3 rounded-lg font-bold text-sm tracking-widest mt-4 uppercase hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "VERIFY"}
            </button>

            <div className="text-center mt-6">
              <button type="button" className="text-white text-sm font-semibold opacity-90 hover:underline">
                Didn't receive a code? Resend
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}