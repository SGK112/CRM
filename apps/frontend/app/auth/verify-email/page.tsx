'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, Mail, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'success' | 'error' | null
  >(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setVerificationStatus('pending');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        toast.success('Email verified! Redirecting to login...');

        // Redirect to login page after 2 seconds (shorter wait time)
        setTimeout(() => {
          router.push('/auth/login?verified=true');
        }, 2000);
      } else {
        setVerificationStatus('error');
        setMessage(data.message || 'Email verification failed.');
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('An error occurred during verification.');
      toast.error('Verification failed');
    }
  }, [router]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      verifyEmail(token);
    }
  }, [token, emailParam, verifyEmail]);

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error('Email address is required');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox.');
        setMessage('A new verification email has been sent to your inbox.');
      } else {
        toast.error(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      toast.error('Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTitle = () => {
    if (token) {
      switch (verificationStatus) {
        case 'success':
          return 'Email Verified Successfully!';
        case 'error':
          return 'Verification Failed';
        case 'pending':
          return 'Verifying Your Email...';
        default:
          return 'Verifying Your Email...';
      }
    }
    return 'Verify Your Email Address';
  };

  const getDescription = () => {
    if (token) {
      switch (verificationStatus) {
        case 'success':
          return 'Your email has been verified successfully! You will be redirected to the login page in 2 seconds.';
        case 'error':
          return "We couldn't verify your email. The link may be expired or invalid.";
        case 'pending':
          return 'Please wait while we verify your email address...';
        default:
          return 'Processing your verification request...';
      }
    }
    return 'Check your email for a verification link, or request a new one below.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Remodely CRM</h1>
          <p className="text-gray-600">Email Verification</p>
        </div>

        <Card className={`${getStatusColor()} border-2`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl flex items-center justify-center gap-2 mb-3">
              {verificationStatus !== 'pending' &&
                verificationStatus !== 'success' &&
                verificationStatus !== 'error' && <Mail className="h-5 w-5 text-blue-500" />}
              {verificationStatus === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {verificationStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
              {verificationStatus === 'pending' && (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              )}
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-sm">{getDescription()}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {message && (
              <div
                className={`p-3 rounded-md border ${verificationStatus === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}
              >
                {message}
              </div>
            )}

            {!token && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <Button
                  onClick={resendVerificationEmail}
                  disabled={isResending || !email}
                  className="w-full"
                  iconLeft={
                    isResending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )
                  }
                >
                  {isResending ? 'Sending...' : 'Send Verification Email'}
                </Button>
              </div>
            )}

            {verificationStatus === 'error' && token && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <Button
                  onClick={resendVerificationEmail}
                  disabled={isResending || !email}
                  className="w-full"
                  intent="secondary"
                  iconLeft={
                    isResending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )
                  }
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}

            {verificationStatus === 'success' && token && (
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/login?verified=true')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  iconLeft={<CheckCircle className="h-4 w-4" />}
                >
                  Continue to Login
                </Button>
                <p className="text-center text-sm text-gray-500">
                  Or wait to be redirected automatically...
                </p>
              </div>
            )}

            {verificationStatus !== 'success' && (
              <div className="text-center">
                <Button
                  intent="neutral"
                  onClick={() => router.push('/auth/login')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>
            Need help?{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
