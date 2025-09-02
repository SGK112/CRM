import { Metadata } from 'next';
import { PencilIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Blog | Remodely CRM',
  description: 'Construction industry insights, tips, and product updates.',
};

const blogPosts = [
  {
    title: '10 Ways AI is Transforming Construction Project Management',
    excerpt:
      'Discover how artificial intelligence is revolutionizing the way construction teams plan, execute, and deliver projects.',
    author: 'Sarah Chen',
    date: '2025-01-15',
    category: 'Industry Insights',
    readTime: '8 min read',
    image: '/api/placeholder/600/300',
  },
  {
    title: 'Mobile-First Construction Management: Why Field Teams Need Apps',
    excerpt:
      'Learn why mobile-first design is crucial for construction teams and how it improves productivity on job sites.',
    author: 'Mike Rodriguez',
    date: '2025-01-10',
    category: 'Product Updates',
    readTime: '6 min read',
    image: '/api/placeholder/600/300',
  },
  {
    title: 'Best Practices for Client Communication in Construction',
    excerpt:
      'Effective communication strategies that keep clients informed and projects on track throughout the construction process.',
    author: 'Jennifer Walsh',
    date: '2025-01-05',
    category: 'Best Practices',
    readTime: '10 min read',
    image: '/api/placeholder/600/300',
  },
  {
    title: 'The Future of Construction Documentation',
    excerpt:
      'How digital documentation is replacing paper processes and improving project transparency and compliance.',
    author: 'David Park',
    date: '2024-12-28',
    category: 'Technology',
    readTime: '7 min read',
    image: '/api/placeholder/600/300',
  },
  {
    title: 'Managing Subcontractor Relationships for Better Project Outcomes',
    excerpt:
      'Tips and strategies for building strong relationships with subcontractors that lead to successful project delivery.',
    author: 'Lisa Thompson',
    date: '2024-12-20',
    category: 'Management',
    readTime: '9 min read',
    image: '/api/placeholder/600/300',
  },
  {
    title: 'Cost Control Strategies That Actually Work in Construction',
    excerpt:
      'Proven methods for keeping construction projects on budget without sacrificing quality or timeline.',
    author: 'Robert Kim',
    date: '2024-12-15',
    category: 'Finance',
    readTime: '11 min read',
    image: '/api/placeholder/600/300',
  },
];

const categories = [
  'All',
  'Industry Insights',
  'Product Updates',
  'Best Practices',
  'Technology',
  'Management',
  'Finance',
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile-first Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-600/15 ring-1 ring-amber-500/30 mb-6">
            <PencilIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Construction Insights
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Industry insights, best practices, and product updates to help your construction
            business thrive.
          </p>
        </div>
      </section>

      {/* Mobile-first Category Filter */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  index === 0
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Blog Posts */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {blogPosts.map((post, index) => (
              <article
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-amber-500/40 transition-colors group"
              >
                {/* Mobile-optimized image */}
                <div className="aspect-[16/9] bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-slate-800/80 flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl">📝</span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-2 py-1 rounded-full bg-slate-900/80 text-xs font-medium text-amber-300">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 group-hover:text-amber-300 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Mobile-optimized meta */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="text-amber-400">{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile-first Load More */}
          <div className="mt-12 text-center">
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-slate-600 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 font-medium text-sm transition">
              Load More Posts
            </button>
          </div>
        </div>
      </section>

      {/* Mobile-first Newsletter Signup */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3">Stay Updated</h2>
            <p className="text-slate-400 mb-6 text-sm sm:text-base">
              Get the latest construction industry insights and product updates delivered to your
              inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm"
              />
              <button className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
