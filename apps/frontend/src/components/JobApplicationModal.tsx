'use client'

import { useState, useRef } from 'react'
import { XMarkIcon, DocumentArrowUpIcon, PaperClipIcon } from '@heroicons/react/24/outline'

interface JobApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  jobDepartment: string
  jobLocation: string
}

interface ApplicationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  linkedIn: string
  portfolio: string
  experience: string
  motivation: string
  availability: string
  salary: string
  referral: string
  additional: string
  coverLetter: string
}

export default function JobApplicationModal({ 
  isOpen, 
  onClose, 
  jobTitle, 
  jobDepartment, 
  jobLocation 
}: JobApplicationModalProps) {
  const [formData, setFormData] = useState<ApplicationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    portfolio: '',
    experience: '',
    motivation: '',
    availability: '',
    salary: '',
    referral: '',
    additional: '',
    coverLetter: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([])
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        setSubmitError('Please upload a PDF or Word document for your resume.')
        return
      }
      
      if (file.size > maxSize) {
        setSubmitError('Resume file must be less than 10MB.')
        return
      }
      
      setResumeFile(file)
      setSubmitError('')
    }
  }

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
      const maxSize = 10 * 1024 * 1024 // 10MB per file
      const maxFiles = 5

      const validFiles = files.filter(file => {
        if (!allowedTypes.includes(file.type)) {
          setSubmitError('Portfolio files must be PDF, JPEG, PNG, or GIF.')
          return false
        }
        if (file.size > maxSize) {
          setSubmitError('Each portfolio file must be less than 10MB.')
          return false
        }
        return true
      })

      if (portfolioFiles.length + validFiles.length > maxFiles) {
        setSubmitError(`You can upload a maximum of ${maxFiles} portfolio files.`)
        return
      }

      setPortfolioFiles(prev => [...prev, ...validFiles])
      setSubmitError('')
    }
  }

  const removePortfolioFile = (index: number) => {
    setPortfolioFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      
      // Add job information
      submitData.append('jobTitle', jobTitle)
      submitData.append('jobDepartment', jobDepartment)
      submitData.append('jobLocation', jobLocation)
      
      // Add resume file
      if (resumeFile) {
        submitData.append('resume', resumeFile)
      }
      
      // Add portfolio files
      portfolioFiles.forEach((file, index) => {
        submitData.append(`portfolio_${index}`, file)
      })

      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        body: submitData
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        // Reset form after successful submission
        setTimeout(() => {
          onClose()
          setSubmitSuccess(false)
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            linkedIn: '',
            portfolio: '',
            experience: '',
            motivation: '',
            availability: '',
            salary: '',
            referral: '',
            additional: '',
            coverLetter: ''
          })
          setResumeFile(null)
          setPortfolioFiles([])
        }, 2000)
      } else {
        setSubmitError(result.message || 'Failed to submit application. Please try again.')
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Application Submitted!</h3>
          <p className="text-slate-400">
            Thank you for your interest in the {jobTitle} position. We'll review your application and get back to you within 5-7 business days.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Apply for Position</h2>
            <p className="text-slate-400 text-sm mt-1">
              {jobTitle} • {jobDepartment} • {jobLocation}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm">
              {submitError}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
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
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
                placeholder="San Francisco, CA"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Professional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Portfolio/Website
                </label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Years of Relevant Experience <span className="text-red-400">*</span>
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
              >
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years (Entry level)</option>
                <option value="2-3">2-3 years</option>
                <option value="4-5">4-5 years</option>
                <option value="6-8">6-8 years</option>
                <option value="9-12">9-12 years</option>
                <option value="13+">13+ years (Senior level)</option>
              </select>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resume & Documents</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Resume <span className="text-red-400">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <PaperClipIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-slate-300">{resumeFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <DocumentArrowUpIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 mb-2">
                      Upload your resume (PDF or Word document)
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition"
                    >
                      Choose File
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Portfolio Files */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Portfolio Files (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
                <DocumentArrowUpIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-2">
                  Upload portfolio files (PDF, JPEG, PNG, GIF - Max 5 files)
                </p>
                <button
                  type="button"
                  onClick={() => portfolioInputRef.current?.click()}
                  className="px-4 py-2 rounded-md border border-slate-600 hover:border-slate-500 text-slate-300 text-sm font-medium transition"
                >
                  Add Files
                </button>
                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  multiple
                  onChange={handlePortfolioUpload}
                  className="hidden"
                />
              </div>
              
              {portfolioFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {portfolioFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800 rounded-md p-2">
                      <div className="flex items-center gap-2">
                        <PaperClipIcon className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-slate-300">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePortfolioFile(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cover Letter & Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Application Questions</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cover Letter <span className="text-red-400">*</span>
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm resize-none"
                placeholder="Tell us about yourself and why you're interested in this position..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Why do you want to work at Remodely? <span className="text-red-400">*</span>
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm resize-none"
                placeholder="What excites you about our mission and this opportunity?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Availability <span className="text-red-400">*</span>
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
                >
                  <option value="">Select availability</option>
                  <option value="immediate">Immediate</option>
                  <option value="2-weeks">2 weeks notice</option>
                  <option value="1-month">1 month</option>
                  <option value="2-months">2 months</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Salary Expectations
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
                  placeholder="$120,000 - $150,000 or Negotiable"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                How did you hear about this position?
              </label>
              <input
                type="text"
                name="referral"
                value={formData.referral}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm"
                placeholder="LinkedIn, company website, referral from [name], etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Additional Information
              </label>
              <textarea
                name="additional"
                value={formData.additional}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-sm resize-none"
                placeholder="Any additional information you'd like us to know..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-md border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !resumeFile}
              className="px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition shadow shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
