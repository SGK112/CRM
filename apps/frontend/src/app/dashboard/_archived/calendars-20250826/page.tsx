'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  MapPin, 
  Plus,
  Settings,
  RotateCw,
  ExternalLink,
  Filter,
  RefreshCw,
  Calendar as CalendarIcon,
  Video,
  Phone,
  Mail,
  Star,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Eye,
  Share2,
  Download,
  Upload,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type: 'appointment' | 'consultation' | 'installation' | 'followup' | 'meeting' | 'call';
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  location?: string;
  attendees?: string[];
  notes?: string;
  estimatedDuration?: number;
  reminders?: number[];
  meetingLink?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  tags?: string[];
  calendarSource?: 'internal' | 'google' | 'outlook' | 'apple' | 'other';
  externalId?: string;
}

interface CalendarIntegration {
  id: string;
  type: 'google' | 'outlook' | 'apple' | 'other';
  name: string;
  email: string;
  isConnected: boolean;
  lastSync: Date | null;
  syncEnabled: boolean;
  calendarIds?: string[];
  color?: string;
}

const eventTypeColors = {
  appointment: '#3B82F6',
  consultation: '#10B981', 
  installation: '#F59E0B',
  followup: '#8B5CF6',
  meeting: '#6366F1',
  call: '#EC4899'
};

const priorityIndicators = {
  low: '🟢',
  medium: '🟡', 
  high: '🔴'
};

export default function CalendarsPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'calendar' | 'list'>('calendar');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  
  // Integrations
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchIntegrations();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, typeFilter, statusFilter, priorityFilter, clientFilter, sourceFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data with comprehensive calendar events
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Kitchen Design Consultation - Smith Family',
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 30),
          type: 'consultation',
          priority: 'high',
          status: 'confirmed',
          clientName: 'Smith Family',
          projectName: 'Modern Kitchen Renovation',
          location: '123 Main St, Anytown, ST 12345',
          description: 'Initial kitchen renovation consultation and measurements. Discuss layout options, material preferences, and budget.',
          attendees: ['john.smith@email.com', 'jane.smith@email.com', 'designer@company.com'],
          estimatedDuration: 90,
          reminders: [60, 15],
          calendarSource: 'internal',
          tags: ['kitchen', 'consultation', 'new-client'],
          notes: 'Bring tablet for design sketches. Client interested in quartz countertops.'
        },
        {
          id: '2', 
          title: 'Bathroom Installation - Johnson Project',
          start: new Date(2024, 0, 16, 8, 0),
          end: new Date(2024, 0, 16, 17, 0),
          type: 'installation',
          priority: 'medium',
          status: 'scheduled',
          clientName: 'Johnson Family',
          projectName: 'Master Bath Renovation',
          location: '456 Oak Ave, Anytown, ST 12345',
          description: 'Full day bathroom installation - tiles, fixtures, vanity installation',
          estimatedDuration: 480,
          reminders: [1440, 60],
          calendarSource: 'google',
          tags: ['bathroom', 'installation'],
          notes: 'Materials delivered yesterday. Team of 3 installers.'
        },
        {
          id: '3',
          title: 'Follow-up Call - Martinez Kitchen',
          start: new Date(2024, 0, 17, 14, 0),
          end: new Date(2024, 0, 17, 14, 30),
          type: 'call',
          priority: 'low',
          status: 'scheduled',
          clientName: 'Martinez Family',
          projectName: 'Kitchen Cabinet Refresh',
          description: 'Check customer satisfaction and address any concerns post-installation',
          estimatedDuration: 30,
          meetingLink: 'https://zoom.us/j/123456789',
          calendarSource: 'outlook',
          tags: ['followup', 'customer-satisfaction'],
          reminders: [15]
        },
        {
          id: '4',
          title: 'Team Meeting - Weekly Sync',
          start: new Date(2024, 0, 18, 9, 0),
          end: new Date(2024, 0, 18, 10, 0),
          type: 'meeting',
          priority: 'medium',
          status: 'confirmed',
          description: 'Weekly team sync to discuss ongoing projects and upcoming installations',
          attendees: ['team@company.com'],
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          calendarSource: 'google',
          isRecurring: true,
          recurringPattern: 'Weekly on Thursday',
          tags: ['team', 'recurring']
        },
        {
          id: '5',
          title: 'Site Measurement - Wilson Bath',
          start: new Date(2024, 0, 19, 11, 0),
          end: new Date(2024, 0, 19, 12, 0),
          type: 'appointment',
          priority: 'high',
          status: 'confirmed',
          clientName: 'Wilson Family',
          location: '789 Pine St, Anytown, ST 12345',
          description: 'Precise measurements for custom vanity and shower enclosure',
          estimatedDuration: 60,
          reminders: [120, 30],
          calendarSource: 'internal',
          tags: ['measurement', 'bathroom', 'custom']
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const mockIntegrations: CalendarIntegration[] = [
        {
          id: '1',
          type: 'google',
          name: 'Google Calendar',
          email: 'user@gmail.com',
          isConnected: true,
          lastSync: new Date(2024, 0, 15, 9, 0),
          syncEnabled: true,
          calendarIds: ['primary', 'work@company.com'],
          color: '#4285F4'
        },
        {
          id: '2',
          type: 'outlook',
          name: 'Outlook Calendar', 
          email: 'user@company.com',
          isConnected: true,
          lastSync: new Date(2024, 0, 15, 8, 30),
          syncEnabled: true,
          color: '#0078D4'
        },
        {
          id: '3',
          type: 'apple',
          name: 'Apple iCloud',
          email: 'user@icloud.com',
          isConnected: false,
          lastSync: null,
          syncEnabled: false,
          color: '#007AFF'
        }
      ];
      
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const filterEvents = () => {
    let filtered = events.filter(event => {
      const matchesType = typeFilter === 'all' || event.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || event.priority === priorityFilter;
      const matchesClient = clientFilter === 'all' || 
                           (event.clientName && event.clientName.toLowerCase().includes(clientFilter.toLowerCase()));
      const matchesSource = sourceFilter === 'all' || event.calendarSource === sourceFilter;
      
      return matchesType && matchesStatus && matchesPriority && matchesClient && matchesSource;
    });
    
    setFilteredEvents(filtered);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSyncCalendars = async () => {
    setSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => prev.map(integration => 
        integration.isConnected 
          ? { ...integration, lastSync: new Date() }
          : integration
      ));
      
      await fetchEvents();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const typeColor = eventTypeColors[event.type] || '#6B7280';
    
    return {
      style: {
        backgroundColor: typeColor,
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        fontSize: '12px',
        padding: '2px 6px',
        opacity: event.status === 'cancelled' ? 0.5 : 1
      }
    };
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return filteredEvents
      .filter(event => event.start >= now && event.start <= next7Days && event.status !== 'cancelled')
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 5);
  }, [filteredEvents]);

  const todaysEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    return filteredEvents
      .filter(event => event.start >= today && event.start < tomorrow)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [filteredEvents]);

  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const completed = filteredEvents.filter(e => e.status === 'completed').length;
    const upcoming = filteredEvents.filter(e => e.start > new Date() && e.status !== 'cancelled').length;
    const cancelled = filteredEvents.filter(e => e.status === 'cancelled').length;
    
    return { total, completed, upcoming, cancelled };
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Unified Calendar System
              </h1>
              <p className="text-gray-800 dark:text-gray-200 mt-2">
                Professional calendar management with multi-platform integration and advanced scheduling
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' 
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {[typeFilter, statusFilter, priorityFilter, clientFilter, sourceFilter].filter(f => f !== 'all').length > 0 && (
                  <span className="bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {[typeFilter, statusFilter, priorityFilter, clientFilter, sourceFilter].filter(f => f !== 'all').length}
                  </span>
                )}
              </button>
              
              <button
                onClick={handleSyncCalendars}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync All'}
              </button>
              
              <button
                onClick={() => setShowIntegrationsModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Settings className="w-4 h-4" />
                Integrations
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Types</option>
                    <option value="appointment">Appointments</option>
                    <option value="consultation">Consultations</option>
                    <option value="installation">Installations</option>
                    <option value="followup">Follow-ups</option>
                    <option value="meeting">Meetings</option>
                    <option value="call">Calls</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calendar Source
                  </label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Sources</option>
                    <option value="internal">Internal</option>
                    <option value="google">Google Calendar</option>
                    <option value="outlook">Outlook</option>
                    <option value="apple">Apple iCloud</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Filter
                  </label>
                  <input
                    type="text"
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    placeholder="Search by client..."
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setClientFilter('all');
                    setSourceFilter('all');
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Total Events</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">All time</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CalendarDays className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Upcoming</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.upcoming}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Next 30 days</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Completed</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.completed}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">This month</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Today's Events</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{todaysEvents.length}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {todaysEvents.filter(e => e.status === 'confirmed').length} confirmed
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Star className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Main Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setCalendarView('calendar')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        calendarView === 'calendar'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCalendarView('list')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        calendarView === 'list'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {['month', 'week', 'day', 'agenda'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode as any)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          viewMode === mode
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Export
                  </button>
                </div>
              </div>
              
              {/* Calendar Content */}
              <div className="p-6">
                {calendarView === 'calendar' ? (
                  <div style={{ height: '700px' }} className="bg-white dark:bg-gray-800 rounded-lg">
                    <Calendar
                      localizer={localizer}
                      events={filteredEvents}
                      startAccessor="start"
                      endAccessor="end"
                      onSelectEvent={handleSelectEvent}
                      eventPropGetter={eventStyleGetter}
                      view={viewMode}
                      onView={(view) => setViewMode(view as any)}
                      date={currentDate}
                      onNavigate={setCurrentDate}
                      popup
                      style={{ 
                        height: '100%',
                        fontFamily: 'inherit',
                        backgroundColor: 'transparent'
                      }}
                      components={{
                        event: ({ event }: any) => (
                          <div className="p-1 h-full">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs">{priorityIndicators[event.priority as keyof typeof priorityIndicators]}</span>
                              <span className="text-xs font-semibold truncate text-white">
                                {event.title}
                              </span>
                            </div>
                            {event.clientName && (
                              <div className="text-xs opacity-90 truncate text-white">
                                {event.clientName}
                              </div>
                            )}
                          </div>
                        )
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[700px] overflow-y-auto">
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleSelectEvent(event)}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span>{priorityIndicators[event.priority]}</span>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {event.title}
                                </h3>
                                <span
                                  className="px-2 py-1 text-xs font-medium rounded-full text-white"
                                  style={{ backgroundColor: eventTypeColors[event.type] }}
                                >
                                  {event.type}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  event.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  event.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                  event.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' :
                                  event.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                }`}>
                                  {event.status}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-800 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {event.start.toLocaleDateString()} {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                
                                {event.clientName && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {event.clientName}
                                  </div>
                                )}
                                
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate max-w-[200px]">{event.location}</span>
                                  </div>
                                )}
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-gray-800 dark:text-gray-300 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {event.meetingLink && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(event.meetingLink, '_blank');
                                  }}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                                >
                                  <Video className="w-4 h-4" />
                                </button>
                              )}
                              
                              <div className="text-xs text-gray-700 dark:text-gray-300 capitalize bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                                {event.calendarSource}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-700 dark:text-gray-300">No events found matching your filters</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Today's Schedule
              </h3>
              
              {todaysEvents.length > 0 ? (
                <div className="space-y-3">
                  {todaysEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{priorityIndicators[event.priority]}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {event.title}
                        </span>
                      </div>
                      <div className="text-xs text-gray-800 dark:text-gray-300">
                        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {event.clientName && ` • ${event.clientName}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-800 dark:text-gray-300">
                    No events scheduled for today
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Upcoming Events
              </h3>
              
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{priorityIndicators[event.priority]}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {event.title}
                        </span>
                      </div>
                      <div className="text-xs text-gray-800 dark:text-gray-300">
                        {event.start.toLocaleDateString()}
                        {event.clientName && ` • ${event.clientName}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CalendarDays className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-800 dark:text-gray-300">
                    No upcoming events
                  </p>
                </div>
              )}
            </div>

            {/* Calendar Integrations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-green-500" />
                Calendar Sync
              </h3>
              
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: integration.color }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {integration.name}
                        </div>
                        {integration.isConnected && integration.lastSync && (
                          <div className="text-xs text-gray-800 dark:text-gray-300">
                            Synced: {integration.lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {integration.isConnected ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setShowIntegrationsModal(true)}
                className="w-full mt-4 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Manage Integrations
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </button>
                
                <button
                  onClick={handleSyncCalendars}
                  disabled={syncing}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 font-medium"
                >
                  <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  Sync Calendars
                </button>
                
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium">
                  <Share2 className="w-4 h-4" />
                  Share Calendar
                </button>
                
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium">
                  <Download className="w-4 h-4" />
                  Export Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>{priorityIndicators[selectedEvent.priority]}</span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedEvent.title}
                    </h2>
                    <span
                      className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: eventTypeColors[selectedEvent.type] }}
                    >
                      {selectedEvent.type}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowEventModal(false)}
                    className="text-gray-700 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEvent.start.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  {selectedEvent.clientName && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Client</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">{selectedEvent.clientName}</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.location && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Location</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">{selectedEvent.location}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedEvent.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.meetingLink && (
                      <button
                        onClick={() => window.open(selectedEvent.meetingLink, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </button>
                    )}
                    
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                      <Share2 className="w-4 h-4" />
                      Share Event
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
                      <ExternalLink className="w-4 h-4" />
                      Edit Event
                    </button>
                    <button 
                      onClick={() => setShowEventModal(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-6 right-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
