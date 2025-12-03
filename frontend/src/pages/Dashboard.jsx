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
          <EventModal event={selectedEvent} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
