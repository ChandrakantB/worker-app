import { useState } from 'react';

export const useNotifications = () => {
  const [notificationCount, setNotificationCount] = useState(3);

  const clearAllNotifications = () => {
    setNotificationCount(0);
    console.log('🔕 Mock: All notifications cleared');
  };

  const addNotification = () => {
    setNotificationCount(prev => prev + 1);
    console.log('🔔 Mock: Notification added');
  };

  

  return {
    notificationCount,
    clearAllNotifications,
    addNotification,
    expoPushToken: 'mock-token',
    error: null,
    isRegistered: true,
  };
};
