import { Suspense } from 'react';
import VerifyCodePage from './VerifyCodePage';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#12141D]" />}>
      <VerifyCodePage />
    </Suspense>
  );
}