import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MapPin,
  Download,
  BarChart3,
  TrendingUp,
  Activity,
  Settings,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  X,
  Send,
  Bell,
  FileText
} from 'lucide-react';
import { eventAPI, clubAPI } from '../services/eventsClubsAPI';

const FacultyEventsClubs = ({ onBack = () => {} }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'Workshop',
    dateTime: '',
    venue: '',
    maxParticipants: '',
    registrationDeadline: '',
    bannerUrl: '',
    clubId: '',
    departmentId: '',
    status: 'Upcoming'
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const facultyId = localStorage.getItem('klhFacultyId');
      
      // Fetch stats, events, and clubs
      const [statsRes, eventsRes, clubsRes] = await Promise.all([
        eventAPI.getStats(facultyId),
        eventAPI.getMyEvents(facultyId),
        clubAPI.getMyClubs(facultyId)
      ]);

      setDashboardStats(statsRes.data);
      setEvents(eventsRes.data);
      setClubs(clubsRes.data);
    } catch (error) {
      showToast('Failed to load data');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const facultyId = localStorage.getItem('klhFacultyId');
      const payload = {
        ...formData,
        createdBy: facultyId
      };

      if (editingEvent) {
        await eventAPI.updateEvent(editingEvent._id, payload);
        showToast('Event updated successfully!');
      } else {
        await eventAPI.createEvent(payload, facultyId);
        showToast('Event created successfully!');
      }

      setShowCreateEventModal(false);
      setFormData({
        title: '',
        description: '',
        eventType: 'Workshop',
        dateTime: '',
        venue: '',
        maxParticipants: '',
        registrationDeadline: '',
        bannerUrl: '',
        clubId: '',
        departmentId: '',
        status: 'Upcoming'
      });
      setEditingEvent(null);
      loadDashboardData();
    } catch (error) {
      showToast('Failed to save event');
      console.error('Error creating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventAPI.deleteEvent(eventId);
      showToast('Event deleted successfully!');
      loadDashboardData();
    } catch (error) {
      showToast('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  const handlePublishEvent = async (eventId) => {
    try {
      await eventAPI.publishEvent(eventId);
      showToast('Event published successfully!');
      loadDashboardData();
    } catch (error) {
      showToast('Failed to publish event');
      console.error('Error publishing event:', error);
    }
  };

  const handleApproveClub = async (clubId) => {
    try {
      const facultyId = localStorage.getItem('klhFacultyId');
      await clubAPI.approveClub(clubId, facultyId);
      showToast('Club approved successfully!');
      loadDashboardData();
    } catch (error) {
      showToast('Failed to approve club');
      console.error('Error approving club:', error);
    }
  };

  const handleExportRegistrations = async (eventId) => {
    try {
      const response = await eventAPI.exportRegistrations(eventId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      showToast('Registrations exported!');
    } catch (error) {
      showToast('Failed to export registrations');
      console.error('Error exporting:', error);
    }
  };

  const StatCard = ({ label, value, description, gradient, icon: Icon }) => (
    <div
      className={`rounded-[16px] border border-slate-200 bg-gradient-to-br ${gradient} p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="rounded-[12px] bg-white/50 p-3">
          <Icon size={24} className="text-slate-600" />
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Overview</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Events"
            value={dashboardStats?.totalEvents || 0}
            description="Created this semester"
            gradient="from-blue-100 to-blue-50"
            icon={Calendar}
          />
          <StatCard
            label="Upcoming Events"
            value={dashboardStats?.upcomingEvents || 0}
            description="Scheduled to occur"
            gradient="from-emerald-100 to-emerald-50"
            icon={Clock}
          />
          <StatCard
            label="Total Clubs"
            value={dashboardStats?.totalClubs || 0}
            description="Active & managed"
            gradient="from-purple-100 to-purple-50"
            icon={Users}
          />
          <StatCard
            label="Student Registrations"
            value={dashboardStats?.totalRegistrations || 0}
            description="Across all events"
            gradient="from-orange-100 to-orange-50"
            icon={TrendingUp}
          />
          <StatCard
            label="Pending Approvals"
            value={dashboardStats?.pendingApprovals || 0}
            description="Clubs & events"
            gradient="from-amber-100 to-amber-50"
            icon={AlertCircle}
          />
          <StatCard
            label="Active Clubs"
            value={dashboardStats?.activeClubs || 0}
            description="Verified & running"
            gradient="from-cyan-100 to-cyan-50"
            icon={Activity}
          />
          <StatCard
            label="Attendance Rate"
            value={`${dashboardStats?.attendancePercentage || 0}%`}
            description="Average across events"
            gradient="from-pink-100 to-pink-50"
            icon={CheckCircle}
          />
          <StatCard
            label="Past Events"
            value={dashboardStats?.pastEvents || 0}
            description="Completed events"
            gradient="from-slate-100 to-slate-50"
            icon={FileText}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            onClick={() => {
              setEditingEvent(null);
              setFormData({
                title: '',
                description: '',
                eventType: 'Workshop',
                dateTime: '',
                venue: '',
                maxParticipants: '',
                registrationDeadline: '',
                bannerUrl: '',
                clubId: '',
                departmentId: '',
                status: 'Upcoming'
              });
              setShowCreateEventModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-[12px] bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Create New Event
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className="flex items-center justify-center gap-2 rounded-[12px] bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            <Users size={20} />
            Manage Clubs
          </button>
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="flex items-center justify-center gap-2 rounded-[12px] bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            <BarChart3 size={20} />
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );

  const AllEventsTab = () => {
    const filteredEvents = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedEventFilter === 'All' || event.eventType === selectedEventFilter;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        {/* Filter & Search */}
        <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[12px] border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-3 text-slate-400" />
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="w-full rounded-[12px] border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option>All</option>
                <option>Workshop</option>
                <option>Seminar</option>
                <option>Competition</option>
                <option>Cultural</option>
                <option>Sports</option>
                <option>Technical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Calendar size={40} className="mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500">No events found</p>
            </div>
          ) : (
            filteredEvents.map(event => (
              <div
                key={event._id}
                className="group rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-200"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{event.title}</h3>
                    <div className="mt-2 inline-block rounded-[8px] bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {event.eventType}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={16} />
                      {new Date(event.dateTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={16} />
                      {event.venue}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-600" />
                      <span className="text-slate-600">{event.registrationCount || 0} registered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className={event.status === 'Published' ? 'text-emerald-600' : 'text-amber-600'} />
                      <span className={event.status === 'Published' ? 'text-emerald-700' : 'text-amber-700'}>{event.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {event.status !== 'Published' && (
                      <button
                        onClick={() => handlePublishEvent(event._id)}
                        className="rounded-[8px] bg-emerald-100 p-2 text-emerald-600 transition hover:bg-emerald-200"
                        title="Publish Event"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setFormData({
                          title: event.title,
                          description: event.description,
                          eventType: event.eventType,
                          dateTime: event.dateTime,
                          venue: event.venue,
                          maxParticipants: event.maxParticipants,
                          registrationDeadline: event.registrationDeadline,
                          bannerUrl: event.bannerUrl || '',
                          clubId: event.clubId || '',
                          departmentId: event.departmentId || '',
                          status: event.status
                        });
                        setShowCreateEventModal(true);
                      }}
                      className="rounded-[8px] bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                      title="Edit Event"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="rounded-[8px] bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                      title="Delete Event"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const ClubsManagementTab = () => (
    <div className="space-y-6">
      <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Club Management</h3>
        <div className="space-y-4">
          {clubs.length === 0 ? (
            <p className="text-center text-slate-500">No clubs to manage</p>
          ) : (
            clubs.map(club => (
              <div
                key={club._id}
                className="rounded-[12px] border border-slate-200 bg-slate-50 p-4 transition hover:border-purple-300 hover:bg-purple-50"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{club.name}</h4>
                    <p className="mt-1 text-sm text-slate-600">{club.description}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users size={16} />
                      {club.memberCount || 0} Members
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${club.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-slate-600">{club.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {club.status === 'Pending' && (
                      <button
                        onClick={() => handleApproveClub(club._id)}
                        className="rounded-[8px] bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200"
                      >
                        Approve
                      </button>
                    )}
                    <button className="rounded-[8px] bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-200">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const RegistrationsTab = () => {
    const selectedEvent = events[0];
    return (
      <div className="space-y-6">
        <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Registrations & Attendance</h3>
            {selectedEvent && (
              <button
                onClick={() => handleExportRegistrations(selectedEvent._id)}
                className="flex items-center gap-2 rounded-[8px] bg-emerald-100 px-4 py-2 font-semibold text-emerald-700 transition hover:bg-emerald-200"
              >
                <Download size={18} />
                Export CSV
              </button>
            )}
          </div>
          <p className="text-sm text-slate-600">
            Total Registrations: <span className="font-bold text-slate-900">{registrations.length}</span>
          </p>
          <div className="mt-4 space-y-2">
            {registrations.length === 0 ? (
              <p className="text-center text-slate-500">No registrations yet</p>
            ) : (
              registrations.map((reg, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-[8px] border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-slate-900">{reg.studentName}</p>
                    <p className="text-sm text-slate-600">{reg.studentEmail}</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded border-slate-300" title="Mark attendance" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const AnnouncementsTab = () => (
    <div className="space-y-6">
      <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Send Announcements</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Recipient</label>
            <select className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition focus:border-blue-500 focus:outline-none">
              <option>All Students</option>
              <option>Club Members</option>
              <option>Event Attendees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Title</label>
            <input
              type="text"
              placeholder="Announcement title"
              className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
            <textarea
              placeholder="Write your announcement..."
              rows={4}
              className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button className="flex items-center justify-center gap-2 w-full rounded-[8px] bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
            <Send size={18} />
            Send Announcement
          </button>
        </div>
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Event Participation</h3>
          <div className="h-40 rounded-[8px] bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-sm text-slate-600">
            Chart: Event Registration Trends
          </div>
        </div>

        <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Club Growth</h3>
          <div className="h-40 rounded-[8px] bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-sm text-slate-600">
            Chart: Club Member Growth
          </div>
        </div>

        <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Attendance Analysis</h3>
          <div className="h-40 rounded-[8px] bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-sm text-slate-600">
            Chart: Attendance Rates by Event
          </div>
        </div>

        <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Department Engagement</h3>
          <div className="h-40 rounded-[8px] bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-sm text-slate-600">
            Chart: Dept. Wise Participation
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Download Reports</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button className="flex items-center justify-center gap-2 rounded-[8px] bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200">
            <Download size={18} />
            Event Report
          </button>
          <button className="flex items-center justify-center gap-2 rounded-[8px] bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200">
            <Download size={18} />
            Attendance Report
          </button>
          <button className="flex items-center justify-center gap-2 rounded-[8px] bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200">
            <Download size={18} />
            Analytics Report
          </button>
        </div>
      </div>
    </div>
  );

  const CreateEventModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[20px] bg-white p-8 shadow-2xl">
        <button
          onClick={() => {
            setShowCreateEventModal(false);
            setEditingEvent(null);
          }}
          className="absolute top-4 right-4 text-slate-400 transition hover:text-slate-600"
        >
          <X size={24} />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </h2>

        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="E.g., React Workshop"
              className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event description..."
              rows={3}
              className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition focus:border-blue-500 focus:outline-none"
              >
                <option>Workshop</option>
                <option>Seminar</option>
                <option>Competition</option>
                <option>Cultural</option>
                <option>Sports</option>
                <option>Technical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="E.g., Tech Lab A, Block 3"
              className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Max Participants</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Registration Deadline</label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                className="w-full rounded-[8px] border border-slate-200 bg-white py-2 px-3 text-sm transition focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-[8px] bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateEventModal(false);
                setEditingEvent(null);
              }}
              className="flex-1 rounded-[8px] border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'events', label: 'All Events', icon: Calendar },
    { id: 'clubs', label: 'Clubs Management', icon: Users },
    { id: 'registrations', label: 'Registrations', icon: CheckCircle },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 mb-4 transform ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '50ms' }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div
            className={`flex items-center gap-4 transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-gradient-to-br from-blue-100 to-purple-100">
              <Calendar size={28} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">Events & Clubs Management</h1>
              <p className="mt-1 text-lg text-slate-600">Faculty control center for events, clubs, and student engagement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-4 font-semibold transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto" />
              <p className="text-slate-600">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'events' && <AllEventsTab />}
            {activeTab === 'clubs' && <ClubsManagementTab />}
            {activeTab === 'registrations' && <RegistrationsTab />}
            {activeTab === 'announcements' && <AnnouncementsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateEventModal && <CreateEventModal />}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 rounded-[12px] bg-slate-900 px-6 py-3 text-white shadow-lg animate-in fade-in slide-in-from-bottom">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default FacultyEventsClubs;
