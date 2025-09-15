'use client';

import {
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { downloadIcsFile, generateIcsContent } from '@/lib/calendar';

interface Contact {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated?: () => void;
  selectedDate?: string;
  presetTitle?: string;
  presetContactId?: string;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onAppointmentCreated,
  selectedDate,
  presetTitle,
  presetContactId
}: AppointmentModalProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'site_visit' | 'meeting' | 'inspection' | 'other'>('consultation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact management
  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Additional options
  const [autoLocation, setAutoLocation] = useState(true);
  const [sendInvite, setSendInvite] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setTitle(presetTitle || '');
      setDate(selectedDate || '');
      setSelectedContactId(presetContactId || '');
      
      // Set default time to next available hour
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      nextHour.setMinutes(0);
      const endTime = new Date(nextHour.getTime() + 60 * 60 * 1000);

      setStart(nextHour.toTimeString().slice(0, 5));
      setEnd(endTime.toTimeString().slice(0, 5));

      // Load contacts
      loadContacts();
    }
  }, [isOpen, selectedDate, presetTitle, presetContactId]);

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const clientsData = await response.json();
        setContacts(clientsData || []);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (!contactSearchTerm) return true;
    const searchLower = contactSearchTerm.toLowerCase();
    const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    return (
      name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      (contact.phone && contact.phone.includes(contactSearchTerm))
    );
  });

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setSelectedContactId(contact.id);
    setContactSearchTerm(contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email);
    setShowContactDropdown(false);

    // Auto-fill title based on appointment type and contact
    const typeMap: Record<string, string> = {
      consultation: 'Consultation',
      site_visit: 'Site Visit',
      meeting: 'Meeting',
      inspection: 'Inspection',
      other: 'Appointment'
    };
    
    const prefix = typeMap[appointmentType] || 'Appointment';
    const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    
    if (!title || title.includes('with')) {
      setTitle(`${prefix} with ${displayName}`);
    }

    // Auto-fill location if address present
    if (autoLocation) {
      const addrParts = [
        contact.addressLine1,
        contact.addressLine2,
        contact.city && contact.state ? `${contact.city}, ${contact.state}` : contact.city || contact.state,
        contact.postalCode,
      ].filter(Boolean);
      if (addrParts.length) {
        setLocation(addrParts.join(', '));
      }
    }
  };

  const getSmartTimeSlots = () => {
    const slots = [];
    const now = new Date();

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        createdAt: new Date().toISOString(),
        invite: sendInvite ? { method: 'portal+ics' } : null,
      };

      // Try to save to API (if endpoint exists)
      try {
        const response = await fetch('/api/appointments/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        });

        if (response.ok) {
          // Generate ICS file if requested
          if (sendInvite && appointmentData.clientName) {
            try {
              const startDate = new Date(`${appointmentData.date}T${appointmentData.startTime}`);
              const endDate = new Date(`${appointmentData.date}T${appointmentData.endTime}`);
              const ics = generateIcsContent({
                title: appointmentData.title,
                start: startDate,
                end: endDate,
                description: appointmentData.notes,
                location: appointmentData.location,
              });
              downloadIcsFile(ics, `${appointmentData.title.replace(/\s+/g, '_')}.ics`);
            } catch (e) {
              // ignore ICS generation failures
            }
          }
          
          onAppointmentCreated?.();
          onClose();
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

      // Generate ICS file if requested
      if (sendInvite && appointmentData.clientName) {
        try {
          const startDate = new Date(`${appointmentData.date}T${appointmentData.startTime}`);
          const endDate = new Date(`${appointmentData.date}T${appointmentData.endTime}`);
          const ics = generateIcsContent({
            title: appointmentData.title,
            start: startDate,
            end: endDate,
            description: appointmentData.notes,
            location: appointmentData.location,
          });
          downloadIcsFile(ics, `${appointmentData.title.replace(/\s+/g, '_')}.ics`);
        } catch (e) {
          // ignore ICS generation failures
        }
      }

      onAppointmentCreated?.();
      onClose();
    } catch (error) {
      // Handle error silently or show user-friendly message
      alert('Error creating appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-brand-500/10 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-brand-500" />
            </div>
            New Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                    appointmentType === value
                      ? 'border-brand-500 bg-brand-500 text-black shadow-sm'
                      : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Selection & Smart Scheduling */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contact (Optional)
              </label>
              <div className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-500" />
                  <input
                    type="text"
                    placeholder="Search contacts or leave blank"
                    value={contactSearchTerm}
                    onChange={(e) => {
                      setContactSearchTerm(e.target.value);
                      setShowContactDropdown(true);
                    }}
                    onFocus={() => setShowContactDropdown(true)}
                    className="w-full pl-10 pr-10 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  />
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>

                {showContactDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    <div className="py-1">
                      {filteredContacts.length > 0 ? (
                        filteredContacts.slice(0, 8).map((contact) => {
                          const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
                          return (
                            <button
                              key={contact.id}
                              type="button"
                              onClick={() => handleContactSelect(contact)}
                              className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-brand-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-white truncate">
                                    {displayName}
                                  </div>
                                  <div className="text-xs text-slate-400 truncate">
                                    {contact.email}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-slate-400 text-sm">
                          {contactSearchTerm ? 'No contacts found' : 'No contacts available'}
                        </div>
                      )}
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
                {smartTimeSlots.slice(0, 3).map((slot, index) => {
                  const isSelected = date === slot.date && start === slot.time;
                  return (
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
                      className={`px-3 py-2 text-left rounded-lg text-sm font-medium transition-all border ${
                        isSelected
                          ? 'bg-brand-500 text-black border-brand-500 shadow-sm'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Kitchen consultation with Smith family"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date *
              </label>
              <div className="relative">
                <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-500" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Time *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-500" />
                <input
                  type="time"
                  className="w-full pl-10 pr-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Time *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-500" />
                <input
                  type="time"
                  className="w-full pl-10 pr-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location and Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
                <span>Location</span>
                {selectedContact && (
                  <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoLocation}
                      onChange={(e) => setAutoLocation(e.target.checked)}
                      className="rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500"
                    />
                    Auto from client
                  </label>
                )}
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-500" />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (e.target.value) setAutoLocation(false);
                  }}
                  placeholder="Address, meeting room, or video call link"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
                <span>Send Invitation</span>
              </label>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={sendInvite}
                    onChange={(e) => setSendInvite(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500"
                  />
                  Email + downloadable calendar invite (.ics)
                </label>
                {sendInvite && (
                  <p className="text-xs text-slate-500 mt-2">
                    A calendar invite (ICS) will download automatically.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 resize-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, preparation notes, or special requirements..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-black rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}