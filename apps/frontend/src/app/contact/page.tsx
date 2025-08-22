'use client'

import { useState } from 'react'
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'

// Note: Metadata handling moved to layout or use next/head for client components

const contactMethods = [
  {
    title: 'Sales Inquiries',
    description: 'Questions about pricing, features, or scheduling a demo.',
    icon: PhoneIcon,
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'sales@remodely.com'
    },
    hours: 'Mon-Fri 8AM-6PM EST',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    title: 'Customer Support',
    description: 'Technical help, account issues, or feature questions.',
    icon: EnvelopeIcon,
    contact: {
      phone: '+1 (555) 123-4568',
      email: 'support@remodely.com'
    },
    hours: 'Mon-Sat 8AM-8PM EST',
    color: 'bg-green-500/10 text-green-400 border-green-500/30'
  },
  {
    title: 'General Inquiries',
    description: 'Partnerships, media requests, or other questions.',
    icon: EnvelopeIcon,
    contact: {
      email: 'hello@remodely.com'
    },
    hours: 'Response within 24 hours',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  }
]

const offices = [
  {
    city: 'San Francisco',
    type: 'Headquarters',
    address: '123 Innovation Drive\nSan Francisco, CA 94105',
    phone: '+1 (555) 123-4567'
  },
  {
    city: 'Austin',
    type: 'Regional Office',
    address: '456 Tech Blvd\nAustin, TX 78701',
    phone: '+1 (555) 987-6543'
  }
]

const departments = [
  { name: 'Sales', email: 'sales@remodely.com' },
  { name: 'Support', email: 'support@remodely.com' },
  { name: 'Partnerships', email: 'partnerships@remodely.com' },
  { name: 'Press & Media', email: 'press@remodely.com' },
  { name: 'Careers', email: 'careers@remodely.com' },
  { name: 'Legal', email: 'legal@remodely.com' },
  { name: 'Privacy', email: 'privacy@remodely.com' },
  { name: 'Security', email: 'security@remodely.com' }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: '',
    message: '',
    newsletter: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          source: 'contact_page',
          page: 'contact'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          inquiryType: '',
          message: '',
          newsletter: false
        })
        // Hide success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000)
      } else {
        setSubmitError(result.message || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile-first Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-teal-600/15 ring-1 ring-teal-500/30 mb-6">
            <PhoneIcon className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We're here to help you succeed with Remodely CRM. Reach out to our team for support, 
            sales questions, or general inquiries.
          </p>
        </div>
      </section>

      {/* Mobile-first Contact Methods */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Choose the best way to reach us based on your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${method.color} mb-4`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{method.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {method.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {method.contact.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <a 
                        href={`tel:${method.contact.phone}`}
                        className="text-sm hover:text-teal-400 transition-colors"
                      >
                        {method.contact.phone}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a 
                      href={`mailto:${method.contact.email}`}
                      className="text-sm hover:text-teal-400 transition-colors"
                    >
                      {method.contact.email}
                    </a>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-400">{method.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Contact Form */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Send us a Message</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Fill out the form below and we'll get back to you within one business day.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            {submitSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-md text-sm mb-6">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}
            
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm mb-6">
                {submitError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 text-sm"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 text-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 text-sm"
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Inquiry Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 text-sm"
                >
                  <option value="">Select an option</option>
                  <option value="sales">Sales & Pricing</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="press">Press & Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 text-sm resize-none"
                  placeholder="Please describe your inquiry in detail..."
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-teal-600 bg-slate-800 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                />
                <label htmlFor="newsletter" className="text-sm text-slate-400">
                  I'd like to receive updates about Remodely CRM features and industry insights.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-md bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition shadow shadow-teal-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Mobile-first Office Locations */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Our Offices</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Visit us at one of our office locations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {offices.map((office, index) => (
              <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-600/15 ring-1 ring-teal-500/30">
                    <MapPinIcon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{office.city}</h3>
                      <span className="text-sm font-medium text-teal-400 bg-teal-500/10 px-2 py-1 rounded">
                        {office.type}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-400 whitespace-pre-line">
                        {office.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-slate-400" />
                        <a 
                          href={`tel:${office.phone}`}
                          className="text-sm hover:text-teal-400 transition-colors"
                        >
                          {office.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first Department Directory */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">Department Directory</h2>
            <p className="text-center text-slate-400 text-sm mb-8">
              Contact the right department directly for faster assistance.
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {departments.map((dept, index) => (
                <div key={index} className="text-center p-4 rounded-lg border border-slate-700">
                  <div className="font-medium text-slate-200 mb-2">{dept.name}</div>
                  <a
                    href={`mailto:${dept.email}`}
                    className="text-sm text-teal-400 hover:text-teal-300 transition-colors break-all"
                  >
                    {dept.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-first Response Times */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Response Times</h2>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-teal-400 mb-2">&lt; 1hr</div>
                <div className="text-sm text-slate-400">Sales Inquiries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-400 mb-2">&lt; 4hrs</div>
                <div className="text-sm text-slate-400">Support Tickets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-400 mb-2">&lt; 24hrs</div>
                <div className="text-sm text-slate-400">General Inquiries</div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 mt-6">
              <p className="text-sm text-slate-400">
                Response times are during business hours (Mon-Fri 8AM-6PM EST). 
                Urgent support issues are handled 24/7 for enterprise customers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
