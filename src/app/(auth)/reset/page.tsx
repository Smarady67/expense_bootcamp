import { Suspense } from 'react';
import NewPasswordPage from './NewPasswordPage';

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#12141D]" />}>
      <NewPasswordPage />
    </Suspense>
  );
}