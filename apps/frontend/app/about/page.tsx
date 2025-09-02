import { Metadata } from 'next';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'About Us | Remodely CRM',
  description:
    'Learn about Remodely CRM - our mission, team, and commitment to helping contractors grow their business.',
};

const values = [
  {
    title: 'Customer Success',
    description:
      'Your success is our success. We build features that help contractors win more projects and grow their business.',
    icon: UserGroupIcon,
  },
  {
    title: 'Simplicity',
    description:
      'Complex problems deserve simple solutions. We make powerful tools that are easy to use and understand.',
    icon: BuildingOfficeIcon,
  },
  {
    title: 'Reliability',
    description:
      'Contractors depend on us to run their business. We maintain 99.9% uptime and enterprise-grade security.',
    icon: ClockIcon,
  },
  {
    title: 'Innovation',
    description:
      'The construction industry is evolving. We stay ahead with cutting-edge technology and modern workflows.',
    icon: MapPinIcon,
  },
];

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Co-Founder',
    bio: 'Former contractor with 15 years in residential remodeling. Built Remodely after struggling with outdated CRM tools.',
    image: '/team/sarah.jpg',
  },
  {
    name: 'Mike Chen',
    role: 'CTO & Co-Founder',
    bio: 'Software architect with experience building scalable SaaS platforms. Previously led engineering at two successful startups.',
    image: '/team/mike.jpg',
  },
  {
    name: 'Jessica Rodriguez',
    role: 'Head of Product',
    bio: 'Product manager passionate about user experience. Spent 8 years at construction tech companies understanding contractor workflows.',
    image: '/team/jessica.jpg',
  },
  {
    name: 'David Kim',
    role: 'Head of Engineering',
    bio: 'Full-stack engineer focused on building reliable, performant systems. Expert in modern web technologies and cloud infrastructure.',
    image: '/team/david.jpg',
  },
];

const stats = [
  { label: 'Active Contractors', value: '2,500+' },
  { label: 'Projects Managed', value: '50,000+' },
  { label: 'Revenue Tracked', value: '$500M+' },
  { label: 'Team Members', value: '25' },
];

const timeline = [
  {
    year: '2021',
    title: 'Company Founded',
    description:
      'Sarah and Mike started Remodely after experiencing firsthand the challenges of managing a contracting business with outdated tools.',
  },
  {
    year: '2022',
    title: 'Beta Launch',
    description:
      'Launched with 50 beta contractors to validate our approach and gather feedback on core features.',
  },
  {
    year: '2023',
    title: 'Series A Funding',
    description:
      'Raised $5M Series A to accelerate product development and grow our team of industry experts.',
  },
  {
    year: '2024',
    title: 'Mobile App Launch',
    description:
      'Released native mobile apps to help contractors manage their business from anywhere, anytime.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile-first Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-600/15 ring-1 ring-blue-500/30 mb-6">
            <BuildingOfficeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
            About Remodely
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We're building the future of contractor business management. Our mission is to help
            contractors focus on what they do best while we handle the business side.
          </p>
        </div>
      </section>

      {/* Mobile-first Stats */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 sm:p-6 rounded-xl border border-slate-800 bg-slate-900/40"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Story */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Our Story</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p className="text-sm sm:text-base">
                  Remodely was born from frustration. Our founder Sarah spent years running a
                  successful remodeling business, but was constantly battling with outdated software
                  that made simple tasks complicated and expensive.
                </p>
                <p className="text-sm sm:text-base">
                  After trying every CRM on the market and finding them all lacking, Sarah teamed up
                  with Mike, a seasoned software architect, to build something better. Something
                  designed specifically for contractors, by contractors.
                </p>
                <p className="text-sm sm:text-base">
                  Today, Remodely serves thousands of contractors across North America, helping them
                  streamline their operations, win more projects, and grow their businesses.
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8">
              <blockquote className="text-lg sm:text-xl text-slate-200 font-medium mb-4">
                "We built Remodely to be the CRM we always wished we had when we were running our
                own contracting business."
              </blockquote>
              <cite className="text-sm text-slate-400">— Sarah Johnson, CEO & Co-Founder</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-first Values */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Our Values</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              These principles guide everything we do, from product decisions to customer support.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-600/15 ring-1 ring-amber-500/30">
                    <value.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">{value.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Timeline */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Our Journey</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Key milestones in building the contractor CRM of the future.
            </p>
          </div>

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-600 text-white text-sm sm:text-base font-semibold">
                    {index + 1}
                  </div>
                  {index < timeline.length - 1 && <div className="w-px h-16 bg-slate-700 mt-4" />}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold">{item.title}</h3>
                    <span className="text-sm font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded w-fit">
                      {item.year}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Team */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Meet Our Team</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              The experienced professionals building the future of contractor software.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold text-lg sm:text-xl">
                    {member.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-200">
                      {member.name}
                    </h3>
                    <p className="text-sm sm:text-base text-amber-400 font-medium">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Ready to Join Our Mission?</h2>
            <p className="text-slate-400 mb-6 text-sm sm:text-base">
              Whether you're a contractor looking for better tools or a talented professional
              wanting to join our team, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/trial"
                className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30 text-center"
              >
                Start Free Trial
              </a>
              <a
                href="/careers"
                className="px-6 py-3 rounded-md border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition text-center"
              >
                View Careers
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
