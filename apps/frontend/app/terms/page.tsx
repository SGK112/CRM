'use client';

import { useState } from 'react';
import { MarketingPage, MarketingHero } from '@/components/marketing/MarketingPage';
import { EnvelopeIcon, DocumentTextIcon, ScaleIcon } from '@heroicons/react/24/outline';

export default function TermsPage() {
  const [showLegalInquiry, setShowLegalInquiry] = useState(false);
  const [legalFormData, setLegalFormData] = useState({
    name: '',
    email: '',
    company: '',
    inquiryType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleLegalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLegalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLegalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: legalFormData.name.split(' ')[0] || legalFormData.name,
          lastName: legalFormData.name.split(' ').slice(1).join(' ') || '',
          email: legalFormData.email,
          company: legalFormData.company,
          inquiryType: 'legal',
          message: `Legal Inquiry Type: ${legalFormData.inquiryType}\n\nMessage: ${legalFormData.message}`,
          source: 'terms_page',
          page: 'terms',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setLegalFormData({
          name: '',
          email: '',
          company: '',
          inquiryType: '',
          message: '',
        });
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowLegalInquiry(false);
        }, 3000);
      } else {
        setSubmitError(result.message || 'Failed to send inquiry. Please try again.');
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <MarketingPage>
      <MarketingHero
        title="Terms of Service"
        subtitle="Plain‑language summary of your agreement using Remodely."
      />
      <div className="max-w-3xl mx-auto px-6 pb-24 text-sm leading-relaxed space-y-7 text-slate-300">
        <p className="text-slate-400 text-xs uppercase tracking-wide">Last Updated: Jan 15, 2025</p>
        <p>
          Using Remodely means you agree to operate within these baseline terms while we continue
          preparing the final extended legal version.
        </p>
        <div className="space-y-5">
          {[
            [
              'Account & Seats',
              'You control who you invite. You are responsible for seat usage & permission accuracy.',
            ],
            [
              'Acceptable Use',
              'No abusive, infringing, or illegal project content. We may suspend for risk or abuse.',
            ],
            [
              'Data Portability',
              'You can export critical records (clients, estimates, invoices). More export formats rolling out.',
            ],
            [
              'Payment',
              'Usage (AI tokens) + subscription billing must stay current to avoid read‑only mode.',
            ],
            ['Service Levels', 'We target 99.9% monthly uptime excluding scheduled maintenance.'],
            [
              'Liability Cap',
              'Limited to fees paid in the prior 12 months. No consequential damages.',
            ],
          ].map(([h, b]) => (
            <div key={h} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="font-semibold mb-2 text-amber-300 text-sm">{h}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-slate-100 pt-4">Your Responsibilities</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Maintain accurate billing & company info.</li>
          <li>Respect IP ownership of uploaded plans & media.</li>
          <li>Ensure proper consent for data you store.</li>
          <li>Notify us promptly of suspected security issues.</li>
        </ul>
        <p className="text-slate-400">
          Need signed enterprise agreements? Contact{' '}
          <a href="mailto:legal@remodely.com" className="text-amber-400 hover:text-amber-300">
            legal@remodely.com
          </a>
          .
        </p>

        {/* Legal Contact Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">Legal Inquiries & Support</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-600/15 ring-1 ring-amber-500/30 flex items-center justify-center">
                  <ScaleIcon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Legal Department</h3>
                  <p className="text-sm text-slate-400">General legal inquiries</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                  <a
                    href="mailto:legal@remodely.com"
                    className="text-amber-400 hover:text-amber-300"
                  >
                    legal@remodely.com
                  </a>
                </div>
                <p className="text-slate-400">Response within 2-3 business days</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600/15 ring-1 ring-blue-500/30 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Enterprise Contracts</h3>
                  <p className="text-sm text-slate-400">Custom agreements & MSAs</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                  <a
                    href="mailto:enterprise@remodely.com"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    enterprise@remodely.com
                  </a>
                </div>
                <p className="text-slate-400">Response within 1 business day</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowLegalInquiry(!showLegalInquiry)}
              className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30"
            >
              Submit Legal Inquiry
            </button>
          </div>

          {/* Legal Inquiry Form */}
          {showLegalInquiry && (
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Legal Inquiry Form</h3>

              {submitSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-md text-sm mb-6">
                  Your legal inquiry has been submitted successfully. Our legal team will review and
                  respond within 2-3 business days.
                </div>
              )}

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm mb-6">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleLegalSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={legalFormData.name}
                      onChange={handleLegalInputChange}
                      required
                      className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={legalFormData.email}
                      onChange={handleLegalInputChange}
                      required
                      className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={legalFormData.company}
                    onChange={handleLegalInputChange}
                    className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Inquiry Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="inquiryType"
                    value={legalFormData.inquiryType}
                    onChange={handleLegalInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm"
                  >
                    <option value="">Select inquiry type</option>
                    <option value="enterprise-agreement">Enterprise Agreement</option>
                    <option value="msa">Master Service Agreement</option>
                    <option value="data-processing">Data Processing Agreement</option>
                    <option value="compliance">Compliance & Certifications</option>
                    <option value="intellectual-property">Intellectual Property</option>
                    <option value="privacy">Privacy & Data Protection</option>
                    <option value="terms-clarification">Terms Clarification</option>
                    <option value="other">Other Legal Matter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={legalFormData.message}
                    onChange={handleLegalInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm resize-none"
                    placeholder="Please describe your legal inquiry in detail..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLegalInquiry(false)}
                    className="px-6 py-3 rounded-md border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition shadow shadow-amber-600/30 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Inquiry'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Additional Legal Resources */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border border-slate-800 bg-slate-900/40">
              <h4 className="font-semibold text-slate-100 mb-2">Privacy Policy</h4>
              <p className="text-sm text-slate-400 mb-3">
                How we collect, use, and protect your data
              </p>
              <a
                href="/privacy"
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
              >
                View Policy →
              </a>
            </div>
            <div className="text-center p-4 rounded-lg border border-slate-800 bg-slate-900/40">
              <h4 className="font-semibold text-slate-100 mb-2">Security</h4>
              <p className="text-sm text-slate-400 mb-3">
                Our security practices and certifications
              </p>
              <a
                href="/security"
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
              >
                Learn More →
              </a>
            </div>
            <div className="text-center p-4 rounded-lg border border-slate-800 bg-slate-900/40">
              <h4 className="font-semibold text-slate-100 mb-2">Compliance</h4>
              <p className="text-sm text-slate-400 mb-3">GDPR, CCPA, and industry standards</p>
              <a
                href="/compliance"
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
              >
                View Details →
              </a>
            </div>
          </div>
        </div>
      </div>
    </MarketingPage>
  );
}
