'use client';

import { StarIcon, MapPinIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    name: 'Sarah Chen',
    company: 'Premier Construction LLC',
    role: 'Project Manager',
    location: 'Austin, TX',
    image: '/api/placeholder/80/80',
    rating: 5,
    text: "Remodely CRM transformed how we manage our construction projects. We've increased our efficiency by 40% and our client satisfaction scores have never been higher.",
    projectsManaged: 127,
    savings: '$89,000',
  },
  {
    name: 'Mike Rodriguez',
    company: 'Rodriguez Home Builders',
    role: 'CEO',
    location: 'Phoenix, AZ',
    image: '/api/placeholder/80/80',
    rating: 5,
    text: 'The scheduling and client communication features alone have saved us countless hours. Our team can focus on what they do best - building amazing homes.',
    projectsManaged: 89,
    savings: '$62,000',
  },
  {
    name: 'Jennifer Walsh',
    company: 'Coastal Remodeling Co.',
    role: 'Operations Director',
    location: 'San Diego, CA',
    image: '/api/placeholder/80/80',
    rating: 5,
    text: 'We went from chaos to complete organization in just 2 weeks. The ROI calculator showed we recovered our investment in the first month.',
    projectsManaged: 156,
    savings: '$124,000',
  },
];

export function TestimonialsSection() {
  return (
    <div className="bg-slate-900/60 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-100 mb-4">
            What Construction Professionals Say
          </h2>
          <p className="text-lg text-slate-400">
            Real results from real businesses using Remodely CRM
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-slate-900/70 border border-slate-800 rounded-xl shadow-sm p-6 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-600/10 transition group"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                  <p className="text-sm text-slate-500">{testimonial.company}</p>
                </div>
              </div>

              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <blockquote className="text-slate-300 mb-4 italic">"{testimonial.text}"</blockquote>

              <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-800 pt-4">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {testimonial.location}
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-200">
                    {testimonial.projectsManaged} Projects
                  </div>
                  <div className="text-emerald-400 font-medium">{testimonial.savings} Saved</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
