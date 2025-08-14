import { Suspense } from 'react';
import GoogleAuthSuccessInner from './successClient';

export default function GoogleAuthSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Preparing...</h2>
          </div>
        </div>
      }
    >
      <GoogleAuthSuccessInner />
    </Suspense>
  );
}
