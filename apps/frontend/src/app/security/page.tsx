import { Metadata } from 'next'
import { ShieldCheckIcon, LockClosedIcon, ServerIcon, DocumentCheckIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Security | Remodely CRM',
  description: 'Learn about Remodely CRM\'s security practices, data protection, and compliance standards.'
}

const securityFeatures = [
  {
    title: 'Data Encryption',
    description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.',
    icon: LockClosedIcon,
    details: [
      'TLS 1.3 for data in transit',
      'AES-256 encryption at rest',
      'Encrypted database backups',
      'End-to-end encryption for sensitive data'
    ]
  },
  {
    title: 'Infrastructure Security',
    description: 'Our cloud infrastructure follows enterprise-grade security best practices.',
    icon: ServerIcon,
    details: [
      'AWS enterprise security controls',
      'Multi-factor authentication required',
      'Network segmentation and firewalls',
      'Regular security audits and penetration testing'
    ]
  },
  {
    title: 'Access Controls',
    description: 'Granular permissions and role-based access control protect your business data.',
    icon: ShieldCheckIcon,
    details: [
      'Role-based access control (RBAC)',
      'Single Sign-On (SSO) integration',
      'Session management and timeouts',
      'API rate limiting and monitoring'
    ]
  },
  {
    title: 'Compliance',
    description: 'We maintain compliance with industry standards and regulations.',
    icon: DocumentCheckIcon,
    details: [
      'SOC 2 Type II certified',
      'GDPR compliant data handling',
      'Regular compliance audits',
      'Data processing agreements available'
    ]
  }
]

const certifications = [
  {
    name: 'SOC 2 Type II',
    description: 'Audited for security, availability, processing integrity, confidentiality, and privacy.',
    year: '2024'
  },
  {
    name: 'ISO 27001',
    description: 'Information security management system certification.',
    year: '2024'
  },
  {
    name: 'GDPR Compliant',
    description: 'Full compliance with European data protection regulations.',
    year: 'Ongoing'
  },
  {
    name: 'CCPA Compliant',
    description: 'California Consumer Privacy Act compliance for data rights.',
    year: 'Ongoing'
  }
]

const dataHandling = [
  {
    title: 'Data Collection',
    description: 'We only collect data necessary for providing our CRM services and improving user experience.'
  },
  {
    title: 'Data Storage',
    description: 'All data is stored in secure, enterprise-grade cloud infrastructure with geographic redundancy.'
  },
  {
    title: 'Data Processing',
    description: 'Data processing is performed only for legitimate business purposes with appropriate safeguards.'
  },
  {
    title: 'Data Retention',
    description: 'We retain data only as long as necessary for business purposes or as required by law.'
  },
  {
    title: 'Data Deletion',
    description: 'Customers can request data deletion at any time, and we provide secure data destruction.'
  },
  {
    title: 'Data Portability',
    description: 'Export your data in standard formats whenever you need it, maintaining full data ownership.'
  }
]

const incidentResponse = [
  {
    step: '1',
    title: 'Detection & Assessment',
    description: 'Automated monitoring systems detect potential security incidents within minutes.',
    timeframe: '< 15 minutes'
  },
  {
    step: '2',
    title: 'Containment',
    description: 'Immediate isolation and containment procedures to prevent incident escalation.',
    timeframe: '< 1 hour'
  },
  {
    step: '3',
    title: 'Investigation',
    description: 'Forensic analysis to determine scope, cause, and impact of the incident.',
    timeframe: '< 24 hours'
  },
  {
    step: '4',
    title: 'Communication',
    description: 'Transparent communication to affected customers and regulatory authorities.',
    timeframe: '< 72 hours'
  },
  {
    step: '5',
    title: 'Recovery',
    description: 'Complete system restoration with enhanced security measures.',
    timeframe: 'As needed'
  },
  {
    step: '6',
    title: 'Review',
    description: 'Post-incident review and security improvements to prevent future occurrences.',
    timeframe: '< 2 weeks'
  }
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile-first Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600/15 ring-1 ring-emerald-500/30 mb-6">
            <ShieldCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
            Security & Privacy
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Your business data deserves enterprise-grade protection. Learn how we keep your information 
            secure with industry-leading security practices and compliance standards.
          </p>
        </div>
      </section>

      {/* Mobile-first Security Overview */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Security Features</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Comprehensive security measures protect your data at every level of our platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600/15 ring-1 ring-emerald-500/30">
                    <feature.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-400 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Certifications */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Certifications & Compliance</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              We maintain the highest standards of security and privacy through rigorous certifications.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-emerald-300">{cert.name}</h3>
                  <span className="text-sm font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                    {cert.year}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Data Handling */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Data Handling Practices</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Transparent and responsible data handling throughout the entire data lifecycle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataHandling.map((practice, index) => (
              <div key={index} className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold mb-3 text-slate-200">{practice.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {practice.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Incident Response */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Incident Response Plan</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Our comprehensive incident response plan ensures rapid detection, containment, and resolution.
            </p>
          </div>

          <div className="space-y-6">
            {incidentResponse.map((step, index) => (
              <div key={index} className="flex gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white text-sm sm:text-base font-semibold">
                    {step.step}
                  </div>
                  {index < incidentResponse.length - 1 && (
                    <div className="w-px h-16 bg-slate-700 mt-4" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold">{step.title}</h3>
                    <span className="text-sm font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                      {step.timeframe}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Security Resources */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Security Resources</h2>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold mb-3 text-slate-200">For Customers</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <a href="/docs/security" className="hover:text-emerald-400 transition-colors">Security Best Practices Guide</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <a href="/docs/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <a href="/docs/data-processing" className="hover:text-emerald-400 transition-colors">Data Processing Agreement</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <a href="/docs/incident-response" className="hover:text-emerald-400 transition-colors">Incident Response Procedures</a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-slate-200">For Security Teams</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <a href="/security/architecture" className="hover:text-emerald-400 transition-colors">Security Architecture Overview</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <a href="/security/certifications" className="hover:text-emerald-400 transition-colors">Certification Reports</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <a href="/security/penetration-testing" className="hover:text-emerald-400 transition-colors">Penetration Testing Reports</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <a href="mailto:security@remodely.com" className="hover:text-emerald-400 transition-colors">Contact Security Team</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="font-semibold mb-3 text-slate-200">Security Contact</h3>
              <p className="text-sm text-slate-400 mb-4">
                For security-related inquiries, vulnerability reports, or compliance questions, contact our security team:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:security@remodely.com"
                  className="px-6 py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow shadow-emerald-600/30 text-center"
                >
                  Contact Security Team
                </a>
                <a
                  href="/security/vulnerability-disclosure"
                  className="px-6 py-3 rounded-md border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition text-center"
                >
                  Report Vulnerability
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
