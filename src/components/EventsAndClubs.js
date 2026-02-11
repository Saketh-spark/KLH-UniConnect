import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  MapPin,
  Users,
  Heart,
  X,
  ChevronRight,
  Bell,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const EventsAndClubs = ({ onBack = () => {}, studentId = null }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all-events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [likedEvents, setLikedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    registeredCount: 0,
    totalClubs: 0,
    joinedCount: 0,
    totalMembers: 0
  });
  const [toastMessage, setToastMessage] = useState('');

  // Load data from backend
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Fetch published events only
      const eventsRes = await axios.get(`${API_BASE_URL}/faculty/events`);
      const publishedEvents = eventsRes.data.filter(e => e.status === 'Published');
      setEvents(publishedEvents);

      // Fetch all clubs (approved only)
      const clubsRes = await axios.get(`${API_BASE_URL}/faculty/clubs`);
      const activeClubs = clubsRes.data.filter(c => c.status === 'Active');
      setClubs(activeClubs);

      // Update stats
      setStats({
        totalEvents: publishedEvents.length,
        registeredCount: registeredEvents.length,
        totalClubs: activeClubs.length,
        joinedCount: joinedClubs.length,
        totalMembers: activeClubs.reduce((sum, club) => sum + (club.memberCount || 0), 0)
      });
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load events and clubs');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      const studentIdValue = studentId || localStorage.getItem('klhStudentId');
      await axios.post(
        `${API_BASE_URL}/faculty/events/${eventId}/register/${studentIdValue}`,
        {}
      );
      setRegisteredEvents([...registeredEvents, eventId]);
      showToast('Successfully registered for event!');
      loadAllData(); // Refresh stats
    } catch (error) {
      console.error('Registration error:', error);
      showToast('Failed to register for event');
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      const studentIdValue = studentId || localStorage.getItem('klhStudentId');
      await axios.post(
        `${API_BASE_URL}/faculty/clubs/${clubId}/members/${studentIdValue}`,
        {}
      );
      setJoinedClubs([...joinedClubs, clubId]);
      showToast('Successfully joined club!');
      loadAllData(); // Refresh stats
    } catch (error) {
      console.error('Join club error:', error);
      showToast('Failed to join club');
    }
  };

  const handleLeaveClub = async (clubId) => {
    try {
      const studentIdValue = studentId || localStorage.getItem('klhStudentId');
      await axios.delete(
        `${API_BASE_URL}/faculty/clubs/${clubId}/members/${studentIdValue}`
      );
      setJoinedClubs(joinedClubs.filter(id => id !== clubId));
      showToast('You left the club');
      loadAllData(); // Refresh stats
    } catch (error) {
      console.error('Leave club error:', error);
      showToast('Failed to leave club');
    }
  };

  const statsDisplay = [
    { label: 'Total Events', value: stats.totalEvents.toString(), color: 'text-slate-900' },
    { label: 'Registered', value: stats.registeredCount.toString(), color: 'text-sky-600' },
    { label: 'Total Clubs', value: stats.totalClubs.toString(), color: 'text-purple-600' },
    { label: 'Joined Clubs', value: stats.joinedCount.toString(), color: 'text-slate-900' },
    { label: 'Total Members', value: (stats.totalMembers / 1000).toFixed(1) + 'k', color: 'text-slate-900' }
  ];

  const eventCategories = ['All', 'Workshop', 'Seminar', 'Competition', 'Social', 'Sports', 'Cultural', 'Technical'];
  const clubCategories = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Social', 'Professional', 'Arts'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.eventType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const myEvents = events.filter(e => registeredEvents.includes(e.id));

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <button onClick={onBack} className={`flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700 mb-4 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '50ms' }}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div className={`flex items-center gap-4 transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-blue-200 text-sky-600">
              <Calendar size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">Events & Clubs</h1>
              <p className="mt-1 text-lg text-slate-600">Discover events, join clubs, and connect with your community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className={`grid gap-4 md:grid-cols-5 transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
            {statsDisplay.map((stat, idx) => (
              <div key={idx} className="rounded-[16px] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm transition duration-300 hover:shadow-md hover:scale-105 transform">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{stat.label}</p>
                <p className={`mt-3 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <div className={`mb-8 border-b border-slate-200 transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '150ms' }}>
          <div className="flex gap-8">
            {[
              { id: 'all-events', label: 'All Events', icon: Calendar, count: events.length },
              { id: 'clubs', label: 'Clubs', icon: Users, count: clubs.length },
              { id: 'my-events', label: 'My Events', icon: Calendar, count: myEvents.length }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 py-4 text-sm font-semibold transition relative ${activeTab === tab.id ? 'text-sky-600' : 'text-slate-600 hover:text-slate-900'}`}>
                  <Icon size={18} />
                  {tab.label}
                  <span className="text-xs font-bold text-slate-500 ml-1">{tab.count}</span>
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-600 rounded-t-full" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ALL EVENTS TAB */}
        {activeTab === 'all-events' && (
          <div className={`transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            <div className="mb-8 flex flex-col gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input type="text" placeholder="Search events by title, location, or keyword…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-[20px] border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200" />
              </div>
              <div className="flex flex-wrap gap-2">
                {eventCategories.map(category => (
                  <button key={category} onClick={() => setSelectedCategory(category)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {category}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-600">Showing {filteredEvents.length} of {events.length} events</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No events found. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-6 mb-12">
                {filteredEvents.map((event, idx) => (
                  <div key={event.id} className={`rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg hover:border-slate-300 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${200 + idx * 50}ms` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{event.description}</p>
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {new Date(event.dateTime).toLocaleDateString()} • {new Date(event.dateTime).toLocaleTimeString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            {event.venue}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            {event.registrationCount || 0} registered
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {event.eventType}
                          </span>
                          {registeredEvents.includes(event.id) && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 flex items-center gap-1">
                              <CheckCircle size={12} />
                              Registered
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            if (!registeredEvents.includes(event.id)) {
                              handleRegisterEvent(event.id);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                            registeredEvents.includes(event.id)
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-sky-600 text-white hover:bg-sky-700'
                          }`}
                        >
                          {registeredEvents.includes(event.id) ? '✓ Registered' : 'Register'}
                        </button>
                        <button 
                          onClick={() => {
                            if (likedEvents.includes(event.id)) {
                              setLikedEvents(likedEvents.filter(id => id !== event.id));
                            } else {
                              setLikedEvents([...likedEvents, event.id]);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 transition"
                        >
                          <Heart size={20} className={likedEvents.includes(event.id) ? 'fill-red-600 text-red-600' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Section */}
            <div className="rounded-[20px] bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border border-slate-200 p-8 text-center mb-12">
              <div className="flex justify-center mb-4 text-3xl">📅</div>
              <h2 className="text-2xl font-bold text-slate-900">Never Miss an Event Again</h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                Enable notifications to get alerts about new events, club activities, and important announcements.
              </p>
              <div className="mt-6 flex gap-4 justify-center">
                <button className="rounded-full bg-sky-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 hover:shadow-lg">
                  Enable Notifications
                </button>
                <button className="rounded-full border-2 border-sky-600 bg-white px-8 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50">
                  View Calendar
                </button>
              </div>
            </div>

            {/* Featured Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Featured This Month</h2>
              <div className="grid gap-8 md:grid-cols-2">
                <div className={`rounded-[20px] border border-slate-200 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden shadow-sm transition duration-300 hover:shadow-lg hover:-translate-y-2 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
                  <div className="h-32 flex items-center justify-center text-5xl">🎪</div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900">Cultural Fest 2024</h3>
                    <p className="mt-2 text-slate-600">Experience diverse cultures, music, dance, and drama performances. The biggest event of the year!</p>
                    <div className="mt-4 text-blue-600 font-semibold">March 5, 2024</div>
                    <button className="mt-4 w-full rounded-full bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                      Learn More
                    </button>
                  </div>
                </div>

                <div className={`rounded-[20px] border border-slate-200 bg-gradient-to-br from-pink-100 to-pink-50 overflow-hidden shadow-sm transition duration-300 hover:shadow-lg hover:-translate-y-2 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '350ms' }}>
                  <div className="h-32 flex items-center justify-center text-5xl">💻</div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900">Tech Club</h3>
                    <p className="mt-2 text-slate-600">Join 450+ members! We organize workshops, hackathons, and networking sessions throughout the year.</p>
                    <div className="mt-4 text-purple-600 font-semibold">450 Members</div>
                    <button className="mt-4 w-full rounded-full bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700">
                      Join Club
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore More */}
            <div className={`rounded-[20px] bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border border-slate-200 p-8 text-center transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
              <h2 className="text-2xl font-bold text-slate-900">Explore More Events</h2>
              <p className="mt-3 text-slate-600">Discover and register for interesting events and workshops happening on campus.</p>
              <button className="mt-6 rounded-full bg-sky-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 hover:shadow-lg">
                Browse Events
              </button>
            </div>
          </div>
        )}

        {/* CLUBS TAB */}
        {activeTab === 'clubs' && (
          <div className={`transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            <div className="mb-8">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input type="text" placeholder="Search clubs by name…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-[20px] border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200" />
              </div>
              <p className="mt-4 text-sm text-slate-600">Showing {filteredClubs.length} of {clubs.length} clubs</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Loading clubs...</p>
              </div>
            ) : filteredClubs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No clubs found. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 mb-12">
                {filteredClubs.map((club, idx) => (
                  <div key={club.id} className={`rounded-[20px] border border-slate-200 bg-white overflow-hidden shadow-sm transition duration-300 hover:shadow-lg hover:-translate-y-1 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${200 + idx * 50}ms` }}>
                    <div className="h-24 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-3xl">
                      📚
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900">{club.name}</h3>
                      <span className="inline-block mt-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {club.category}
                      </span>
                      <p className="mt-3 text-sm text-slate-600 line-clamp-2">{club.description}</p>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span className="font-semibold text-slate-900">{club.memberCount || 0} members</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          club.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {club.status}
                        </span>
                      </div>

                      {joinedClubs.includes(club.id) ? (
                        <button className="mt-4 w-full rounded-full bg-green-100 py-2 text-sm font-semibold text-green-700 transition cursor-default flex items-center justify-center gap-2">
                          <CheckCircle size={16} />
                          Member
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleJoinClub(club.id)}
                          className="mt-4 w-full rounded-full bg-sky-600 py-2 text-sm font-semibold text-white transition hover:bg-sky-700">
                          Join Club
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Explore More */}
            <div className={`rounded-[20px] bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border border-slate-200 p-8 text-center transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
              <h2 className="text-2xl font-bold text-slate-900">Explore More Clubs</h2>
              <p className="mt-3 text-slate-600">Discover and join clubs that match your interests and passions.</p>
              <button className="mt-6 rounded-full bg-sky-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 hover:shadow-lg">
                Browse Clubs
              </button>
            </div>
          </div>
        )}

        {/* MY EVENTS TAB */}
        {activeTab === 'my-events' && (
          <div className={`transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            <div className="mb-8">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-[16px] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Registered</p>
                  <p className="mt-3 text-3xl font-bold text-sky-600">{registeredEvents.length}</p>
                </div>
                <div className="rounded-[16px] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Upcoming</p>
                  <p className="mt-3 text-3xl font-bold text-green-600">{myEvents.filter(e => new Date(e.dateTime) > new Date()).length}</p>
                </div>
                <div className="rounded-[16px] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Past Events</p>
                  <p className="mt-3 text-3xl font-bold text-slate-600">{myEvents.filter(e => new Date(e.dateTime) <= new Date()).length}</p>
                </div>
                <div className="rounded-[16px] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Favorites</p>
                  <p className="mt-3 text-3xl font-bold text-purple-600">{likedEvents.length}</p>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-6">Your Registered Events</h3>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Loading your events...</p>
              </div>
            ) : myEvents.length === 0 ? (
              <div className="text-center py-12 rounded-[20px] bg-slate-50 border border-slate-200">
                <Calendar size={40} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 font-semibold">No registered events yet</p>
                <p className="text-sm text-slate-500 mt-2">Browse available events and register to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myEvents.map((event, idx) => (
                  <div key={event.id} className={`rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg hover:border-slate-300 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${250 + idx * 50}ms` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-1">{event.description}</p>
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {new Date(event.dateTime).toLocaleDateString()} • {new Date(event.dateTime).toLocaleTimeString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            {event.venue}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {event.eventType}
                          </span>
                          {new Date(event.dateTime) <= new Date() && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              Past Event
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (likedEvents.includes(event.id)) {
                            setLikedEvents(likedEvents.filter(id => id !== event.id));
                          } else {
                            setLikedEvents([...likedEvents, event.id]);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 transition"
                      >
                        <Heart size={20} className={likedEvents.includes(event.id) ? 'fill-red-600 text-red-600' : ''} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Events</h3>
            <div className="space-y-4">
              {myEvents.map((event, idx) => (
                <div key={event.id} className={`rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg hover:border-slate-300 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${250 + idx * 50}ms` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl">{event.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {event.date} • {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 rounded-[12px] bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg animate-fade-in">
            {toastMessage}
          </div>
        )}
      </main>
    </div>
  );
};

export default EventsAndClubs;
