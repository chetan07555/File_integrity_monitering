import React, { useState } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const Filters = ({ filters, setFilters, onSearch }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({
      fileName: '',
      eventType: '',
      user: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    // Trigger search with empty filters to show all events
    setTimeout(() => onSearch(), 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-lg">
            <FiFilter className="text-white text-lg" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Search & Filter</h3>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-primary-600 hover:text-primary-700 text-sm font-semibold px-4 py-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
        >
          {showFilters ? '🔼 Hide' : '🔽 Show'} Filters
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="fileName"
                value={filters.fileName}
                onChange={handleChange}
                placeholder="Search file name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              name="eventType"
              value={filters.eventType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Events</option>
              <option value="CREATE">Create</option>
              <option value="MODIFY">Modify</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="OK">OK</option>
              <option value="CREATED">Created</option>
              <option value="MODIFIED">Modified</option>
              <option value="DELETED">Deleted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <input
              type="text"
              name="user"
              value={filters.user}
              onChange={handleChange}
              placeholder="Filter by user..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      <div className="flex space-x-3 mt-4">
        <button
          onClick={onSearch}
          className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg font-semibold"
        >
          <FiSearch />
          <span>Search</span>
        </button>
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold"
        >
          <FiX />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

export default Filters;
