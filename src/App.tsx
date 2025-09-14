import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './components/Auth/Landing';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/Layout/Header';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Notification } from './types';

const AppContent: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // In demo mode, return empty notifications
      if (!supabase) {
        setNotifications([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading SmartCover...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleHomeClick = async () => {
    // Sign out the user to return to landing page
    await signOut();
  };

  return (
    <div className="min-h-screen bg-black">
      <Header 
        onNotificationClick={() => setIsNotificationOpen(true)}
        notificationCount={unreadNotifications}
        onHomeClick={handleHomeClick}
      />
      <Dashboard 
        onNotificationClick={() => setIsNotificationOpen(true)}
        notificationCount={unreadNotifications}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;