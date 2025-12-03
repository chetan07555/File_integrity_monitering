import React from 'react';
import { FiX, FiClock, FiUser, FiHash, FiFileText } from 'react-icons/fi';

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  const getStatusColor = (status) => {
    const colors = {
      OK: 'bg-green-100 text-green-800',
      CREATED: 'bg-blue-100 text-blue-800',
      MODIFIED: 'bg-red-100 text-red-800',
      DELETED: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Event Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              File Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">File Name</p>
                <p className="font-medium text-gray-900">{event.fileName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">File Path</p>
                <p className="font-medium text-gray-900 break-all">{event.filePath}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Type</p>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                  {event.eventType}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Severity</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(event.severity)}`}>
                  {event.severity}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Alert Sent</p>
                <p className="font-medium text-gray-900">{event.emailSent ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {event.metadata && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Size</p>
                  <p className="font-medium text-gray-900">{event.metadata.size} bytes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Extension</p>
                  <p className="font-medium text-gray-900">{event.metadata.extension || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Permissions</p>
                  <p className="font-medium text-gray-900">{event.metadata.permissions || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modified At</p>
                  <p className="font-medium text-gray-900">
                    {event.metadata.modifiedAt ? new Date(event.metadata.modifiedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hash Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FiHash className="mr-2" />
              Hash Information
            </h3>
            <div className="space-y-3">
              {event.oldHash && (
                <div>
                  <p className="text-sm text-gray-600">Old Hash</p>
                  <p className="font-mono text-sm text-gray-900 break-all bg-white p-2 rounded">
                    {event.oldHash}
                  </p>
                </div>
              )}
              {event.newHash && (
                <div>
                  <p className="text-sm text-gray-600">New Hash</p>
                  <p className="font-mono text-sm text-gray-900 break-all bg-white p-2 rounded">
                    {event.newHash}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Diff Summary */}
          {event.diffSummary && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FiFileText className="mr-2" />
                Changes Summary
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    +{event.diffSummary.linesAdded}
                  </p>
                  <p className="text-sm text-gray-600">Lines Added</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    -{event.diffSummary.linesRemoved}
                  </p>
                  <p className="text-sm text-gray-600">Lines Removed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    ~{event.diffSummary.linesChanged}
                  </p>
                  <p className="text-sm text-gray-600">Lines Changed</p>
                </div>
              </div>
              {event.diffSummary.details && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Details</p>
                  <pre className="bg-white p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                    {event.diffSummary.details}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Additional Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <FiUser className="mr-2 text-gray-600" />
                <span className="text-sm text-gray-600">Changed By:</span>
                <span className="ml-2 font-medium text-gray-900">{event.user || 'System'}</span>
              </div>
              <div className="flex items-center">
                <FiClock className="mr-2 text-gray-600" />
                <span className="text-sm text-gray-600">Timestamp:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-100 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
