'use client';

import { Metadata } from 'next';
import { useState } from 'react';
import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import JobApplicationModal from '@/components/JobApplicationModal';

// Note: Since this is now a client component, we'll handle metadata differently
// You might want to move metadata to layout.tsx or use next/head

const benefits = [
  {
    title: 'Competitive Salary',
    description: 'Industry-leading compensation with equity participation',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'Flexible Schedule',
    description: 'Work-life balance with flexible hours and remote options',
    icon: ClockIcon,
  },
  {
    title: 'Great Location',
    description: 'Modern office in downtown with hybrid work options',
    icon: MapPinIcon,
  },
  {
    title: 'Growth Opportunities',
    description: 'Learn from industry experts and advance your career',
    icon: BriefcaseIcon,
  },
];

const openings = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    description:
      'Lead development of core CRM features using React, Node.js, and modern cloud technologies. 5+ years experience required.',
    requirements: [
      '5+ years full-stack development experience',
      'Expert knowledge of React, TypeScript, Node.js',
      'Experience with cloud platforms (AWS, Azure, GCP)',
      'Strong understanding of database design and optimization',
      'Experience with microservices architecture',
    ],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    description:
      'Design intuitive interfaces for contractors. Create user experiences that simplify complex business workflows.',
    requirements: [
      '3+ years product design experience',
      'Portfolio showing B2B SaaS design work',
      'Proficiency in Figma, Adobe Creative Suite',
      'Experience with user research and testing',
      'Understanding of responsive design principles',
    ],
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    description:
      'Build and maintain our cloud infrastructure. Ensure 99.9% uptime for mission-critical contractor workflows.',
    requirements: [
      '4+ years DevOps/Infrastructure experience',
      'Expert knowledge of AWS/Azure cloud platforms',
      'Experience with Kubernetes, Docker, Terraform',
      'Strong scripting skills (Python, Bash)',
      'Experience with monitoring and alerting systems',
    ],
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description:
      'Help contractors succeed with Remodely. Drive adoption, reduce churn, and identify expansion opportunities.',
    requirements: [
      '3+ years customer success experience in B2B SaaS',
      'Experience in construction/contracting industry preferred',
      'Strong communication and presentation skills',
      'Data-driven approach to customer management',
      'Experience with CRM and customer success platforms',
    ],
  },
  {
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    description:
      'Drive growth through content marketing, SEO, and demand generation. Target contractor audiences across digital channels.',
    requirements: [
      '4+ years B2B marketing experience',
      'Experience marketing to blue-collar audiences',
      'Strong content creation and storytelling skills',
      'Knowledge of SEO, PPC, and marketing automation',
      'Analytical mindset with experience in marketing metrics',
    ],
  },
  {
    title: 'Sales Development Representative',
    department: 'Sales',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description:
      'Generate qualified leads and build pipeline. First point of contact for contractors interested in Remodely.',
    requirements: [
      '1+ years sales or business development experience',
      'Strong communication and phone skills',
      'Experience with CRM and sales tools',
      'Self-motivated with strong work ethic',
      'Interest in construction/contracting industry',
    ],
  },
];

const values = [
  {
    title: 'Customer Obsession',
    description:
      'We start with the contractor and work backwards. Every decision is made with our customers in mind.',
  },
  {
    title: 'Ownership',
    description:
      'We take ownership of our work and outcomes. We think like owners because we are owners.',
  },
  {
    title: 'High Standards',
    description:
      'We maintain exceptionally high standards and continuously raise the bar for ourselves and our products.',
  },
  {
    title: 'Bias for Action',
    description: 'Speed matters. We value calculated risk-taking and learning from our mistakes.',
  },
];

export default function CareersPage() {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{
    title: string;
    department: string;
    location: string;
  } | null>(null);

  const handleApplyClick = (job: (typeof openings)[0]) => {
    setSelectedJob({
      title: job.title,
      department: job.department,
      location: job.location,
    });
    setIsApplicationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsApplicationModalOpen(false);
    setSelectedJob(null);
  };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile-first Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-purple-600/15 ring-1 ring-purple-500/30 mb-6">
            <BriefcaseIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
            Join Our Team
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Help us build the future of contractor business management. Join a team that's
            passionate about solving real problems for hardworking professionals.
          </p>
        </div>
      </section>

      {/* Mobile-first Company Culture */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Our Culture</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              We're building more than software—we're creating a workplace where talented people can
              do their best work.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8"
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-purple-300">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Benefits */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Benefits & Perks</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              We take care of our team so they can take care of our customers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl border border-slate-800 bg-slate-900/40"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/15 ring-1 ring-purple-500/30 mb-4">
                  <benefit.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            <h3 className="text-xl font-semibold mb-4">Additional Benefits</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>Health, dental, and vision insurance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>401(k) with company matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>Unlimited PTO policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>$2,000 learning and development budget</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>Top-tier equipment and workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>Stock options in a growing company</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>Regular team events and outings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>Parental leave policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-first Open Positions */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Open Positions</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              We're actively hiring for these roles. Don't see a perfect fit? Send us your resume
              anyway.
            </p>
          </div>

          <div className="space-y-6">
            {openings.map((job, index) => (
              <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold mb-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {job.department}
                        </span>
                        <span className="text-slate-400">{job.location}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">{job.type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplyClick(job)}
                      className="px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow shadow-purple-600/30 whitespace-nowrap w-fit"
                    >
                      Apply Now
                    </button>
                  </div>

                  <p className="text-slate-300 mb-6 leading-relaxed text-sm sm:text-base">
                    {job.description}
                  </p>

                  <div>
                    <h4 className="font-semibold mb-3 text-slate-200">Requirements</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      {job.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Application Process */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Our Hiring Process</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              We've designed our process to be thorough but respectful of your time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Application',
                description: 'Submit your resume and cover letter through our portal.',
              },
              {
                step: '2',
                title: 'Phone Screen',
                description: '30-minute call with our recruiting team to discuss the role.',
              },
              {
                step: '3',
                title: 'Technical Interview',
                description: 'Role-specific interview with the hiring manager and team.',
              },
              {
                step: '4',
                title: 'Final Round',
                description: 'Meet with leadership and get a feel for our company culture.',
              },
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-semibold text-sm mb-4">
                  {process.step}
                </div>
                <h3 className="font-semibold mb-2">{process.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Contact */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Don't See the Right Role?</h2>
            <p className="text-slate-400 mb-6 text-sm sm:text-base">
              We're always looking for exceptional talent. Send us your resume and let us know how
              you'd like to contribute to our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:careers@remodely.com"
                className="px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow shadow-purple-600/30 text-center"
              >
                Send Resume
              </a>
              <a
                href="/about"
                className="px-6 py-3 rounded-md border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition text-center"
              >
                Learn More About Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Job Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={handleCloseModal}
          jobTitle={selectedJob.title}
          jobDepartment={selectedJob.department}
          jobLocation={selectedJob.location}
        />
      )}
    </div>
  );
}
