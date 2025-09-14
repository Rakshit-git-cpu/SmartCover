import React from 'react';
import { X, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Notification } from '../../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationsRead: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationsRead,
}) => {
  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    if (unreadIds.length === 0) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
      
      onNotificationsRead();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-end p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md h-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
          <div className="flex items-center space-x-2">
            {notifications.some(n => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 text-xs bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {notifications.length > 0 ? (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      notification.read
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-gray-800/80 border-yellow-400/30 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="bg-gray-800 p-4 rounded-full mb-4">
                <Info className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-white font-medium mb-2">No notifications yet</h3>
              <p className="text-gray-400 text-sm">
                You'll receive updates about your products and warranty claims here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;