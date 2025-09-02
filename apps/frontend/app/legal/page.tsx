import { Metadata } from 'next';
import {
  DocumentTextIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { MarketingPage, MarketingHero } from '@/components/marketing/MarketingPage';

export const metadata: Metadata = {
  title: 'Legal | Remodely CRM',
  description:
    'Legal information, terms of service, privacy policy, and compliance documentation for Remodely CRM.',
};

const legalDocuments = [
  {
    title: 'Terms of Service',
    description: 'Our terms and conditions for using Remodely CRM services.',
    icon: DocumentTextIcon,
    lastUpdated: 'January 15, 2024',
    href: '/legal/terms',
  },
  {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    icon: ShieldCheckIcon,
    lastUpdated: 'January 15, 2024',
    href: '/legal/privacy',
  },
  {
    title: 'Data Processing Agreement',
    description: 'GDPR-compliant data processing terms for enterprise customers.',
    icon: ScaleIcon,
    lastUpdated: 'December 1, 2023',
    href: '/legal/dpa',
  },
  {
    title: 'Cookie Policy',
    description: 'Information about how we use cookies and similar technologies.',
    icon: UserIcon,
    lastUpdated: 'November 10, 2023',
    href: '/legal/cookies',
  },
];

const complianceInfo = [
  {
    title: 'GDPR Compliance',
    description:
      'We comply with the European General Data Protection Regulation (GDPR) for all users.',
    details: [
      'Right to access your personal data',
      'Right to rectification and erasure',
      'Right to data portability',
      'Right to object to processing',
      'Data breach notification within 72 hours',
    ],
  },
  {
    title: 'CCPA Compliance',
    description: 'California Consumer Privacy Act compliance for California residents.',
    details: [
      'Right to know what personal information is collected',
      'Right to delete personal information',
      'Right to opt-out of sale of personal information',
      'Right to non-discrimination',
      'Right to request specific pieces of information',
    ],
  },
  {
    title: 'SOC 2 Type II',
    description:
      'Audited annually for security, availability, processing integrity, confidentiality, and privacy.',
    details: [
      'Independent third-party audits',
      'Comprehensive security controls',
      'Continuous monitoring and improvement',
      'Annual audit reports available',
      'Enterprise-grade security standards',
    ],
  },
];

const contactInfo = [
  {
    title: 'Legal Inquiries',
    email: 'legal@remodely.com',
    description: 'For legal questions, contract terms, or compliance matters.',
  },
  {
    title: 'Privacy Concerns',
    email: 'privacy@remodely.com',
    description: 'For privacy-related questions or data subject requests.',
  },
  {
    title: 'Data Protection Officer',
    email: 'dpo@remodely.com',
    description: 'For GDPR-related inquiries and data protection matters.',
  },
];

export default function LegalPage() {
  return (
    <MarketingPage>
      <MarketingHero
        title="Legal & Compliance"
        subtitle="Documents, policies & regulatory standards in one place."
      />

      {/* Mobile-first Legal Documents */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Legal Documents</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Important legal documents and policies governing your use of Remodely CRM.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {legalDocuments.map((doc, index) => (
              <a
                key={index}
                href={doc.href}
                className="block rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 hover:border-indigo-500/40 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-600/15 ring-1 ring-indigo-500/30">
                    <doc.icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-indigo-300 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-400 mb-3 leading-relaxed">
                      {doc.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Last updated: {doc.lastUpdated}
                      </span>
                      <span className="text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                        View Document →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Compliance */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Compliance & Standards</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              We maintain compliance with international privacy laws and security standards.
            </p>
          </div>

          <div className="space-y-8">
            {complianceInfo.map((compliance, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8"
              >
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-indigo-300">
                  {compliance.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-400 mb-6 leading-relaxed">
                  {compliance.description}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {compliance.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Data Rights */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Your Data Rights</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-slate-200">What You Can Do</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-300">Access:</strong> Request a copy of all
                      personal data we have about you
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-300">Correct:</strong> Update or correct any
                      inaccurate information
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-300">Delete:</strong> Request deletion of your
                      personal data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-300">Export:</strong> Download your data in a
                      portable format
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-300">Object:</strong> Object to certain types of
                      data processing
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-slate-200">How to Exercise Your Rights</h3>
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">In-App Requests</div>
                    <div className="text-sm text-slate-400">
                      Use the privacy controls in your account settings to manage your data
                      directly.
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Email Requests</div>
                    <div className="text-sm text-slate-400">
                      Contact our privacy team at privacy@remodely.com with your request.
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Response Time</div>
                    <div className="text-sm text-slate-400">
                      We respond to all requests within 30 days of receipt.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-first Contact Information */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Legal Contacts</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Get in touch with the right team for your legal or privacy questions.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {contactInfo.map((contact, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl border border-slate-800 bg-slate-900/40"
              >
                <h3 className="font-semibold mb-3 text-slate-200">{contact.title}</h3>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-block text-indigo-400 hover:text-indigo-300 font-medium mb-3 transition-colors"
                >
                  {contact.email}
                </a>
                <p className="text-sm text-slate-400 leading-relaxed">{contact.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Company Information */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
              Company Information
            </h2>

            <div className="space-y-4 text-sm text-slate-400">
              <div>
                <strong className="text-slate-300">Company Name:</strong> Remodely, Inc.
              </div>
              <div>
                <strong className="text-slate-300">Address:</strong>
                <br />
                123 Innovation Drive
                <br />
                San Francisco, CA 94105
                <br />
                United States
              </div>
              <div>
                <strong className="text-slate-300">Registered Agent:</strong> Corporation Service
                Company
              </div>
              <div>
                <strong className="text-slate-300">Incorporation:</strong> Delaware, USA
              </div>
              <div>
                <strong className="text-slate-300">EU Representative:</strong> Available upon
                request for GDPR matters
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 mt-6 text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                This page was last updated on January 15, 2024. We may update our legal documents
                from time to time. Material changes will be communicated to users via email or
                in-app notification.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
