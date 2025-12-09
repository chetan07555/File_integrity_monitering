import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import socketService from '../services/socket';
import Header from '../components/Header';
import Filters from '../components/Filters';
import EventTable from '../components/EventTable';
import EventModal from '../components/EventModal';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [criticalEvent, setCriticalEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fileName: '',
    eventType: '',
    user: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadEvents();
    loadStats();

    // Connect to Socket.io
    const socket = socketService.connect();

    // Listen for real-time events
    socketService.on('fileEvent', (newEvent) => {
      console.log('New file event received:', newEvent);
      setEvents((prev) => [newEvent, ...prev]);
      loadStats(); // Refresh stats
    });

    return () => {
      socketService.off('fileEvent');
    };
  }, []);

  // Track the most recent critical modification event for alerting
  useEffect(() => {
    if (!events || events.length === 0) {
      setCriticalEvent(null);
      return;
    }

    const recentCritical = events.find(
      (ev) => ev.eventType === 'MODIFY' && ev.severity === 'CRITICAL'
    );

    setCriticalEvent(recentCritical || null);
  }, [events]);

  const loadEvents = async (searchFilters = {}) => {
    try {
      setLoading(true);
      const params = {
        ...searchFilters,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      const response = await eventsAPI.getEvents(params);
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await eventsAPI.getStats(7);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = () => {
    const searchFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        searchFilters[key] = filters[key];
      }
    });
    loadEvents(searchFilters);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleRestore = async () => {
    // Refresh data after a restore so UI reflects reverted content/events
    await loadEvents(filters);
    await loadStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Events</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {stats.totalEvents}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FiActivity className="text-white text-3xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Created</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {stats.eventTypeCounts.find((e) => e._id === 'CREATE')?.count || 0}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FiCheckCircle className="text-white text-3xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Modified</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {stats.eventTypeCounts.find((e) => e._id === 'MODIFY')?.count || 0}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FiAlertCircle className="text-white text-3xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Deleted</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {stats.eventTypeCounts.find((e) => e._id === 'DELETE')?.count || 0}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FiTrendingUp className="text-white text-3xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Critical Alert Banner */}
        {criticalEvent && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-900 rounded-xl shadow-md p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <FiAlertCircle className="text-red-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Critical modification detected</p>
                <p className="text-base font-medium">
                  {criticalEvent.fileName} was modified at{' '}
                  {new Date(criticalEvent.createdAt).toLocaleString()}.
                </p>
                <p className="text-sm text-red-800 break-all">
                  Path: {criticalEvent.filePath}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleViewDetails(criticalEvent)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                View details
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <Filters filters={filters} setFilters={setFilters} onSearch={handleSearch} />

        {/* Real-time indicator */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg px-6 py-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 bg-white rounded-full animate-ping"></div>
            </div>
            <span className="text-white font-semibold text-lg">
              🔴 Live Monitoring Active
            </span>
          </div>
          <span className="text-white/90 text-sm font-medium">
            Real-time updates enabled
          </span>
        </div>

        {/* Events Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : (
          <EventTable events={events} onViewDetails={handleViewDetails} />
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={handleCloseModal}
            onRestore={handleRestore}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
