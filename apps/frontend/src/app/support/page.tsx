import { Metadata } from 'next'
import { ChatBubbleLeftRightIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Support | Remodely CRM',
  description: 'Get help with Remodely CRM - documentation, contact support, and FAQs.'
}

const supportOptions = [
  {
    title: 'Help Center',
    description: 'Browse our comprehensive knowledge base and tutorials.',
    icon: ChatBubbleLeftRightIcon,
    action: 'Browse Articles',
    href: '/docs',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    title: 'Email Support',
    description: 'Send us a detailed message and we\'ll get back to you within 24 hours.',
    icon: EnvelopeIcon,
    action: 'Send Email',
    href: 'mailto:support@remodely.com',
    color: 'bg-green-500/10 text-green-400 border-green-500/30'
  },
  {
    title: 'Phone Support',
    description: 'Talk to our support team directly for urgent issues.',
    icon: PhoneIcon,
    action: 'Call Now',
    href: 'tel:+1-555-123-4567',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    title: 'Schedule a Call',
    description: 'Book a one-on-one session with our product experts.',
    icon: ClockIcon,
    action: 'Book Call',
    href: '#schedule',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  }
]

const faqs = [
  {
    question: 'How do I import my existing client data?',
    answer: 'You can import client data using our CSV import tool. Go to Clients > Import and download our template. Make sure your data matches the required format.'
  },
  {
    question: 'Can I use Remodely CRM on mobile devices?',
    answer: 'Yes! Remodely CRM is fully responsive and works great on mobile browsers. We also have native mobile apps coming in Q2 2025.'
  },
  {
    question: 'How do I add team members to my account?',
    answer: 'Go to Settings > Team and click "Invite Member". You can set different permission levels for each team member based on their role.'
  },
  {
    question: 'What integrations are available?',
    answer: 'We integrate with popular tools like QuickBooks, Google Calendar, Slack, and more. Check our integrations page for the full list.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade security with encryption at rest and in transit, regular backups, and SOC 2 compliance.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time from your billing settings. Your data will remain accessible for 30 days after cancellation.'
  }
]

const supportHours = [
  { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM EST' },
  { day: 'Saturday', hours: '10:00 AM - 4:00 PM EST' },
  { day: 'Sunday', hours: 'Emergency support only' }
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile-first Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-600/15 ring-1 ring-amber-500/30 mb-6">
            <ChatBubbleLeftRightIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Support Center
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            We're here to help you get the most out of Remodely CRM. Choose the support option that works best for you.
          </p>
        </div>
      </section>

      {/* Mobile-first Support Options */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {supportOptions.map((option, index) => (
              <a
                key={index}
                href={option.href}
                className="block rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6 hover:border-amber-500/40 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg border ${option.color}`}>
                    <option.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-amber-300 transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-400 mb-3 leading-relaxed">
                      {option.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-amber-400 group-hover:text-amber-300 transition-colors">
                      {option.action}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Support Hours */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Support Hours</h2>
            <div className="space-y-3">
              {supportHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-b-0">
                  <span className="text-sm sm:text-base text-slate-300">{schedule.day}</span>
                  <span className="text-sm sm:text-base text-amber-400 font-medium">{schedule.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-first FAQs */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Quick answers to common questions about Remodely CRM.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group rounded-lg border border-slate-800 bg-slate-900/40">
                <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-slate-800/40 transition-colors">
                  <h3 className="text-base sm:text-lg font-medium text-slate-200 pr-4">
                    {faq.question}
                  </h3>
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Contact Form */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Still Need Help?</h2>
            <p className="text-slate-400 mb-6 text-sm sm:text-base">
              Can't find what you're looking for? Send us a message and we'll get back to you soon.
            </p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Brief description of your issue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="input resize-none"
                  placeholder="Please provide as much detail as possible..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
