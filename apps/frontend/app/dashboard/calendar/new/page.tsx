'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface Contact {
  id: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  type?: string;
  contactType?: string;
}

export default function NewAppointment() {
  const router = useRouter();
  const params = useSearchParams();
  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentType, setAppointmentType] = useState<
    'consultation' | 'site_visit' | 'meeting' | 'inspection' | 'other'
  >('consultation');

  useEffect(() => {
    const cid = params?.get('clientId');
    const pid = params?.get('projectId');
    const dateParam = params?.get('date');

    if (cid) setSelectedContactId(cid);
    if (pid) setProjectId(pid);
    if (dateParam) setDate(dateParam);

    // Set default time to next available hour
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    nextHour.setMinutes(0);
    const endTime = new Date(nextHour.getTime() + 60 * 60 * 1000);
    
    setStart(nextHour.toTimeString().slice(0, 5));
    setEnd(endTime.toTimeString().slice(0, 5));
  }, [params]);

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const authToken = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.length > 10) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const response = await fetch('/api/clients', {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          const contactList = data.clients || data || [];
          setContacts(contactList);
          
          // If we have a preselected contact, find and set it
          if (selectedContactId) {
            const contact = contactList.find((c: Contact) => c.id === selectedContactId || c._id === selectedContactId);
            if (contact) {
              setSelectedContact(contact);
              const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
              setTitle(`Meeting with ${displayName}`);
            }
          }
        }
      } catch (error) {
        // Fail silently
      }
    };

    loadContacts();
  }, [selectedContactId]);

  const filteredContacts = contacts.filter(contact => {
    const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    const searchText = contactSearchTerm.toLowerCase();
    return displayName.toLowerCase().includes(searchText) || 
           contact.email.toLowerCase().includes(searchText) ||
           (contact.company && contact.company.toLowerCase().includes(searchText));
  });

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setSelectedContactId(contact.id || contact._id || '');
    setShowContactDropdown(false);
    setContactSearchTerm('');
    
    // Auto-populate title
    const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    if (!title || title.includes('Meeting with')) {
      setTitle(`${appointmentType === 'consultation' ? 'Consultation' : 
                appointmentType === 'site_visit' ? 'Site visit' : 
                appointmentType === 'inspection' ? 'Inspection' : 'Meeting'} with ${displayName}`);
    }
  };

  const getSmartTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(9, 0, 0, 0); // Start at 9 AM
    
    // Today's remaining slots
    if (now.getHours() < 17) {
      const nextSlot = new Date(now);
      nextSlot.setMinutes(0, 0, 0);
      nextSlot.setHours(nextSlot.getHours() + 1);
      
      while (nextSlot.getHours() < 17) {
        slots.push({
          label: `Today ${nextSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          date: nextSlot.toISOString().split('T')[0],
          time: nextSlot.toTimeString().slice(0, 5),
        });
        nextSlot.setHours(nextSlot.getHours() + 1);
        if (slots.length >= 3) break;
      }
    }
    
    // Tomorrow slots
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    for (let i = 0; i < 3; i++) {
      slots.push({
        label: `Tomorrow ${tomorrow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        date: tomorrow.toISOString().split('T')[0],
        time: tomorrow.toTimeString().slice(0, 5),
      });
      tomorrow.setHours(tomorrow.getHours() + 2);
    }
    
    return slots;
  };

  const smartTimeSlots = getSmartTimeSlots();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create appointment object
      const appointmentData = {
        title,
        date,
        startTime: start,
        endTime: end,
        type: appointmentType,
        location,
        notes,
        clientId: selectedContactId || null,
        clientName: selectedContact ? (selectedContact.name || `${selectedContact.firstName || ''} ${selectedContact.lastName || ''}`.trim() || selectedContact.email) : null,
        projectId: projectId || null,
        createdAt: new Date().toISOString(),
      };

      // Try to save to API (if endpoint exists)
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        });

        if (response.ok) {
          // Successfully saved to API
          router.push('/dashboard/calendar?created=true');
          return;
        }
      } catch (apiError) {
        // API not available, saving locally
      }

      // Fallback: save to localStorage
      const existingAppointments = JSON.parse(
        localStorage.getItem('appointments') || '[]'
      );
      
      const newAppointment = {
        ...appointmentData,
        id: Date.now().toString(),
      };

      existingAppointments.push(newAppointment);
      localStorage.setItem('appointments', JSON.stringify(existingAppointments));

      // Navigate back to calendar with success message
      router.push('/dashboard/calendar?created=true');
    } catch (error) {
      // Handle error silently or show user-friendly message
      alert('Error creating appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.push('/dashboard/calendar');
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <CalendarDaysIcon className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  New Appointment
                </h1>
                <p className="text-slate-400 mt-1">
                  Schedule a client meeting or site visit
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-all duration-200 border border-slate-700"
            >
              <XMarkIcon className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden"
        >
          <div className="p-8 space-y-8">
            {/* Appointment Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Appointment Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { value: 'consultation', label: 'Consultation', icon: UserIcon },
                  { value: 'site_visit', label: 'Site Visit', icon: MapPinIcon },
                  { value: 'meeting', label: 'Meeting', icon: UserIcon },
                  { value: 'inspection', label: 'Inspection', icon: CheckIcon },
                  { value: 'other', label: 'Other', icon: DocumentTextIcon },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setAppointmentType(
                        value as 'consultation' | 'site_visit' | 'meeting' | 'inspection' | 'other'
                      )
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                      appointmentType === value
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Selection & Smart Scheduling */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Contact & Schedule
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Contact
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowContactDropdown(!showContactDropdown)}
                      className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white text-left focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 flex items-center justify-between"
                    >
                      <span className={selectedContact ? 'text-white' : 'text-slate-400'}>
                        {selectedContact 
                          ? (selectedContact.name || `${selectedContact.firstName || ''} ${selectedContact.lastName || ''}`.trim() || selectedContact.email)
                          : 'Choose existing contact or leave blank'
                        }
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                    </button>
                    
                    {showContactDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search contacts..."
                              value={contactSearchTerm}
                              onChange={(e) => setContactSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {filteredContacts.length > 0 ? (
                            filteredContacts.map((contact) => (
                              <button
                                key={contact.id || contact._id}
                                type="button"
                                onClick={() => handleContactSelect(contact)}
                                className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-black text-sm font-semibold">
                                    {(contact.name || contact.firstName || contact.email || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium">
                                      {contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email}
                                    </p>
                                    <p className="text-slate-400 text-xs">{contact.email}</p>
                                    {contact.company && (
                                      <p className="text-slate-500 text-xs">{contact.company}</p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-slate-400 text-sm">
                              {contactSearchTerm ? 'No contacts found' : 'No contacts available'}
                            </div>
                          )}
                        </div>
                        <div className="p-2 border-t border-slate-700">
                          <button
                            type="button"
                            onClick={() => {
                              setShowContactDropdown(false);
                              router.push('/dashboard/onboarding?returnTo=/dashboard/calendar/new');
                            }}
                            className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Add New Contact
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quick Schedule
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {smartTimeSlots.slice(0, 3).map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setDate(slot.date);
                          setStart(slot.time);
                          const endTime = new Date(`${slot.date}T${slot.time}`);
                          endTime.setHours(endTime.getHours() + 1);
                          setEnd(endTime.toTimeString().slice(0, 5));
                        }}
                        className="px-3 py-2 text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm transition-colors"
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Appointment Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., Kitchen consultation with Smith family"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project ID (Optional)
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                    placeholder="Link to existing project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date *
                  </label>
                  <div className="relative">
                    <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Time *
                  </label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                    <input
                      type="time"
                      className="w-full pl-10 pr-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      value={start}
                      onChange={e => setStart(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Time *
                  </label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                    <input
                      type="time"
                      className="w-full pl-10 pr-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      value={end}
                      onChange={e => setEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Additional Details
              </h3>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Address, meeting room, or video call link"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none"
                    rows={4}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Additional details, preparation notes, or special requirements..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-800/50 px-8 py-6 border-t border-slate-700">
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 border border-slate-600 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title || !date || !start || !end}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Create Appointment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
