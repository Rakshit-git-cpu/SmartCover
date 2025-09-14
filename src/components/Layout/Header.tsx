import React, { useState } from 'react';
import { Umbrella, Bell, User, LogOut, Menu, X, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onNotificationClick: () => void;
  notificationCount: number;
  onHomeClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNotificationClick, notificationCount, onHomeClick }) => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-xl">
              <Umbrella className="h-6 w-6 text-black" />
            </div>
            <span className="text-xl font-bold text-white">SmartCover</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {onHomeClick && (
              <button
                onClick={onHomeClick}
                className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-900"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>
            )}
            
            <button
              onClick={onNotificationClick}
              className="relative p-2 text-gray-300 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-900"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {notificationCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-3 text-gray-300">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</span>
            </div>

            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="space-y-3">
              {onHomeClick && (
                <button
                  onClick={() => {
                    onHomeClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 text-gray-300 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-900"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  onNotificationClick();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-3 text-gray-300 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-900"
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <span className="bg-yellow-400 text-black text-xs rounded-full px-2 py-1 font-medium">
                    {notificationCount}
                  </span>
                )}
              </button>

              <div className="flex items-center space-x-3 p-3 text-gray-300">
                <User className="h-5 w-5" />
                <span className="text-sm">{user?.user_metadata?.full_name || user?.email}</span>
              </div>

              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-3 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;