'use client'

import { useState } from 'react'
import Layout from '../../../components/Layout'
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CameraIcon,
  QrCodeIcon,
  ShareIcon,
  StarIcon,
  FunnelIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface BusinessCard {
  id: string
  firstName: string
  lastName: string
  title: string
  company: string
  email: string
  phone: string
  mobile?: string
  website?: string
  address?: string
  notes?: string
  tags: string[]
  isFavorite: boolean
  dateAdded: string
  lastContacted?: string
  imageUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  industry?: string
  source: 'scanned' | 'manual' | 'imported' | 'qr'
}

const mockContacts: BusinessCard[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    title: 'General Contractor',
    company: 'Smith Construction LLC',
    email: 'john.smith@smithconstruction.com',
    phone: '(555) 123-4567',
    mobile: '(555) 987-6543',
    website: 'https://smithconstruction.com',
    address: '123 Builder St, Construction City, CC 12345',
    notes: 'Specializes in residential renovations. Very reliable.',
    tags: ['contractor', 'residential', 'reliable'],
    isFavorite: true,
    dateAdded: '2025-08-10',
    lastContacted: '2025-08-12',
    industry: 'Construction',
    source: 'scanned'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'Architect',
    company: 'Modern Designs Inc',
    email: 'sarah@moderndesigns.com',
    phone: '(555) 234-5678',
    website: 'https://moderndesigns.com',
    address: '456 Design Ave, Architect City, AC 23456',
    notes: 'Great for modern residential projects.',
    tags: ['architect', 'modern', 'residential'],
    isFavorite: false,
    dateAdded: '2025-08-08',
    industry: 'Architecture',
    source: 'qr'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Thompson',
    title: 'Project Manager',
    company: 'BuildRight Corp',
    email: 'mike.thompson@buildright.com',
    phone: '(555) 345-6789',
    mobile: '(555) 876-5432',
    address: '789 Project Blvd, Manager City, MC 34567',
    notes: 'Excellent project management skills. Works on large commercial projects.',
    tags: ['project-manager', 'commercial', 'experienced'],
    isFavorite: true,
    dateAdded: '2025-08-05',
    lastContacted: '2025-08-11',
    industry: 'Construction',
    source: 'manual'
  },
  {
    id: '4',
    firstName: 'Lisa',
    lastName: 'Chen',
    title: 'Interior Designer',
    company: 'Chen Interiors',
    email: 'lisa@cheninteriors.com',
    phone: '(555) 456-7890',
    website: 'https://cheninteriors.com',
    notes: 'Specializes in luxury home interiors.',
    tags: ['designer', 'luxury', 'interiors'],
    isFavorite: false,
    dateAdded: '2025-08-03',
    industry: 'Design',
    source: 'imported'
  }
]

const industries = ['All', 'Construction', 'Architecture', 'Design', 'Engineering', 'Real Estate']
const sources = ['All', 'Scanned', 'Manual', 'Imported', 'QR Code']

export default function RolladexPage() {
  const [contacts, setContacts] = useState<BusinessCard[]>(mockContacts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All')
  const [selectedSource, setSelectedSource] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  // Static grid layout only (removed list toggle for consistency across app)
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'dateAdded' | 'lastContacted'>('name')

  // Filter and search contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesIndustry = selectedIndustry === 'All' || contact.industry === selectedIndustry
    const matchesSource = selectedSource === 'All' || contact.source === selectedSource.toLowerCase()

    return matchesSearch && matchesIndustry && matchesSource
  })

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      case 'company':
        return a.company.localeCompare(b.company)
      case 'dateAdded':
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      case 'lastContacted':
        if (!a.lastContacted && !b.lastContacted) return 0
        if (!a.lastContacted) return 1
        if (!b.lastContacted) return -1
        return new Date(b.lastContacted).getTime() - new Date(a.lastContacted).getTime()
      default:
        return 0
    }
  })

  const toggleFavorite = (id: string) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, isFavorite: !contact.isFavorite } : contact
    ))
  }

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id))
  }

  return (
    <Layout>
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Business Card Rolladex
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your professional contacts and business cards in one organized place
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button
            onClick={() => setShowScanModal(true)}
            className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            <CameraIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Scan Card
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900">{contacts.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIconSolid className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Favorites</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter(c => c.isFavorite).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CameraIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Scanned Cards</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter(c => c.source === 'scanned').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Companies</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(contacts.map(c => c.company)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts, companies, titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
            >
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="company">Sort by Company</option>
              <option value="dateAdded">Sort by Date Added</option>
              <option value="lastContacted">Sort by Last Contact</option>
            </select>

          </div>
        </div>
      </div>
      {/* Contacts Grid (static) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedContacts.map((contact) => (
          <div key={contact.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header with favorite and actions */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(contact.id)}
                    className={`${contact.isFavorite ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                  >
                    {contact.isFavorite ? (
                      <StarIconSolid className="h-5 w-5" />
                    ) : (
                      <StarIcon className="h-5 w-5" />
                    )}
                  </button>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    contact.source === 'scanned' ? 'bg-green-100 text-green-800' :
                    contact.source === 'manual' ? 'bg-blue-100 text-blue-800' :
                    contact.source === 'imported' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {contact.source}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteContact(contact.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">
                    {contact.firstName[0]}{contact.lastName[0]}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h3>
                <p className="text-sm text-gray-600">{contact.title}</p>
                <p className="text-sm font-medium text-blue-600">{contact.company}</p>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{contact.phone}</span>
                </div>
                {contact.address && (
                  <div className="flex items-start text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-xs">{contact.address}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {contact.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 3 && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        +{contact.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Last contacted */}
              {contact.lastContacted && (
                <div className="mt-3 text-xs text-gray-500">
                  Last contacted: {contact.lastContacted}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
  {sortedContacts.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedIndustry !== 'All' || selectedSource !== 'All'
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first business card.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Add Contact
            </button>
          </div>
        </div>
      )}

      {/* Scan Card Modal */}
  {showScanModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Scan Business Card</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Position the business card in the camera frame
                  </p>
                  <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <CameraIcon className="mr-2 h-4 w-4" />
                    Capture Card
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Or scan QR code for digital business cards
                  </p>
                  <button className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    Scan QR Code
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowScanModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
  {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Contact</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                </div>
              </form>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  )
}
