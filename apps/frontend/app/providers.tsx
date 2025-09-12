'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
            minWidth: '300px',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(22, 101, 52, 0.95) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#dcfce7',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: '#dcfce7',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.95) 0%, rgba(153, 27, 27, 0.95) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fecaca',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fecaca',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#dbeafe',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#dbeafe',
            },
          },
        }}
        containerStyle={{
          top: '80px',
          right: '20px',
        }}
      />
    </QueryClientProvider>
  );
}
