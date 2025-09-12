import { ConditionalFooter, ConditionalTopBar } from '@/components/ConditionalLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SubscriptionProvider } from '@/components/subscription-context';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Remodely - AI-Driven CRM for Remodeling Professionals',
  description:
    'AI-powered CRM designed for remodeling contractors. Smart project insights, automated client follow-ups, and intelligent workflow management for renovation professionals.',
  keywords:
    'remodeling CRM, AI construction software, renovation management, contractor app, smart project management, remodeling business automation',
  authors: [{ name: 'Remodely' }],
  creator: 'Remodely',
  publisher: 'Remodely',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Remodely CRM',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Remodely - AI-Driven CRM for Remodeling Professionals',
    description:
      'AI-powered CRM designed for remodeling contractors. Smart project insights, automated client follow-ups, and intelligent workflow management for renovation professionals.',
    siteName: 'Remodely',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remodely - AI-Driven CRM for Remodeling Professionals',
    description:
      'AI-powered CRM designed for remodeling contractors. Smart project insights, automated client follow-ups, and intelligent workflow management for renovation professionals.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  userScalable: false,
  themeColor: '#d97706',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className={`${inter.className} antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <SubscriptionProvider>
            <Providers>
              <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
                <ConditionalTopBar />

                {/* Mobile-first container: stacked content, full-width on small devices */}
                <main className="flex-1 w-full">{children}</main>

                {/* Mobile bottom navigation (stacked) */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)] border-t border-[var(--border)] md:hidden">
                  <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
                    <a href="/dashboard" className="flex flex-col items-center text-xs text-secondary hover:text-amber-600">
                      <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"/></svg>
                      Dashboard
                    </a>
                    <a href="/dashboard/contacts" className="flex flex-col items-center text-xs text-secondary hover:text-amber-600">
                      <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A6 6 0 1118.879 6.196 6 6 0 015.121 17.804z"/></svg>
                      Contacts
                    </a>
                    <a href="/dashboard/projects" className="flex flex-col items-center text-xs text-secondary hover:text-amber-600">
                      <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18"/></svg>
                      Projects
                    </a>
                    <a href="/dashboard/quick-actions" className="flex flex-col items-center text-xs text-secondary hover:text-amber-600">
                      <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                      Quick
                    </a>
                  </div>
                </nav>

                <ConditionalFooter>
                  {/* Minimal Professional Footer */}
                  <footer className="border-t border-[var(--border)] mt-auto">
                    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
                      {/* Main Footer Content - Simplified */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                        {/* Brand Section */}
                        <div className="flex flex-col md:flex-row items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-lg border border-amber-400/20 relative overflow-hidden">
                              {/* Professional Remodeling Logo */}
                              <div className="relative z-10">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                                  {/* Hammer handle */}
                                  <rect x="14" y="12" width="2" height="10" fill="currentColor" opacity="0.9" rx="1"/>
                                  {/* Hammer head */}
                                  <rect x="11" y="10" width="8" height="4" fill="currentColor" rx="1"/>
                                  {/* Wrench */}
                                  <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8"/>
                                  <rect x="5" y="7" width="6" height="2" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
                                  {/* Blueprint lines */}
                                  <line x1="2" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeDasharray="2,1"/>
                                  <line x1="2" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeDasharray="2,1"/>
                                  {/* Accent dots */}
                                  <circle cx="4" cy="20" r="1" fill="currentColor" opacity="0.7"/>
                                  <circle cx="20" cy="4" r="1" fill="currentColor" opacity="0.7"/>
                                </svg>
                              </div>
                              {/* Subtle shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-bold">Remodely</span>
                              <span className="text-xs text-[var(--text-dim)] -mt-1 tracking-wider">AI-DRIVEN CRM</span>
                            </div>
                          </div>
                          <p className="text-[var(--text-dim)] text-sm text-center md:text-left max-w-md">
                            The AI-powered construction CRM that grows with your remodeling business.
                          </p>
                        </div>

                        {/* Essential Links Only */}
                        <div className="flex items-center gap-4 sm:gap-6 text-sm">
                          <a
                            href="/contact"
                            className="text-[var(--text-dim)] hover:text-amber-600 transition-colors"
                          >
                            Contact
                          </a>
                          <a
                            href="/auth/login"
                            className="text-[var(--text-dim)] hover:text-amber-600 transition-colors"
                          >
                            Sign In
                          </a>
                          <a href="/auth/register" className="btn btn-amber px-4 py-2 text-sm">
                            Get Started
                          </a>
                        </div>
                      </div>

                      {/* Bottom Bar - Legal & Social */}
                      <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-[var(--text-dim)] text-center sm:text-left">
                          © 2025 Remodely CRM. All rights reserved.
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <a
                            href="/privacy"
                            className="text-[var(--text-dim)] hover:text-amber-600 transition-colors"
                          >
                            Privacy
                          </a>
                          <a
                            href="/terms"
                            className="text-[var(--text-dim)] hover:text-amber-600 transition-colors"
                          >
                            Terms
                          </a>
                          <div className="flex gap-3 ml-2">
                            <a
                              href="#"
                              className="text-[var(--text-dim)] hover:text-amber-600 transition-colors"
                              aria-label="LinkedIn"
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                            </a>
                            <a
                              href="#"
                              className="text-[var(--text-dim)] hover:text-amber-600 transition-colors"
                              aria-label="Twitter"
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </footer>
                </ConditionalFooter>
              </div>
            </Providers>
          </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
