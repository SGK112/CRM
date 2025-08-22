'use client'

import { useState } from 'react'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface QuickContactWidgetProps {
  page?: string
  primaryEmail?: string
  primaryLabel?: string
}

export default function QuickContactWidget({ 
  page = 'unknown',
  primaryEmail = 'hello@remodely.com',
  primaryLabel = 'Quick Question'
}: QuickContactWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
          firstName: formData.name.split(' ')[0] || formData.name,
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          inquiryType: 'other',
          message: formData.message,
          source: 'quick_contact_widget',
          page: page
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => {
          setSubmitSuccess(false)
          setIsOpen(false)
        }, 3000)
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
    <>
      {/* Floating Contact Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-amber-600 hover:bg-amber-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          aria-label="Quick contact"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Contact Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-white">{primaryLabel}</h3>
                <p className="text-sm text-slate-400">We'll get back to you quickly!</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Message Sent!</h4>
                  <p className="text-slate-400">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm">
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm"
                      placeholder="Your name"
                    />
                  </div>

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
                      className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 text-sm resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-3 rounded-md border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 rounded-md bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition shadow shadow-amber-600/30 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-4 h-4" />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/40 rounded-b-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Or email us directly:</span>
                <a
                  href={`mailto:${primaryEmail}`}
                  className="text-amber-400 hover:text-amber-300 font-medium"
                >
                  {primaryEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
