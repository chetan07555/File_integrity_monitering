import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
              <span className="text-white font-bold text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                File Integrity Monitor
              </h1>
              <p className="text-sm text-white/90 font-medium">Real-time Security Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
              <FiUser className="text-lg text-white" />
              <div>
                <p className="text-sm font-semibold text-white">{user?.username}</p>
                <p className="text-xs text-white/80">{user?.role?.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-white/90 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
