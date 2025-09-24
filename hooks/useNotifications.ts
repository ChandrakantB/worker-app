import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NotificationService } from '../services/notifications/NotificationService';
import { useWorkerData } from '../contexts/worker/WorkerDataContext';
import { router } from 'expo-router';

export const useNotifications = () => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const { worker, assignedTasks } = useWorkerData();

  useEffect(() => {
    // Initialize notifications when worker logs in
    if (worker && Platform.OS !== 'web') {
      initializeNotifications();
    } else if (worker && Platform.OS === 'web') {
      console.log('🌐 [WEB MODE] Notifications initialized for:', worker.name);
    }

    // Cleanup listeners on unmount
    return () => {
      if (Platform.OS !== 'web') {
        NotificationService.clearAllNotifications();
      }
    };
  }, [worker]);

  useEffect(() => {
    // Update badge count based on unread notifications
    if (Platform.OS !== 'web') {
      NotificationService.setBadgeCount(notificationCount);
    }
  }, [notificationCount]);

  const initializeNotifications = async () => {
    try {
      const token = await NotificationService.initialize();
      setPushToken(token);

      // Set up notification listeners
      setupNotificationListeners();

      console.log('Notifications initialized for worker:', worker?.name);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const setupNotificationListeners = () => {
    if (Platform.OS === 'web') return;

    // Handle notification tap (app closed/background)
    NotificationService.addNotificationResponseListener((response) => {
      const { data } = response.notification.request.content;
      handleNotificationAction(data);
    });

    // Handle notification received (app open)
    NotificationService.addNotificationReceivedListener((notification) => {
      setNotificationCount(prev => prev + 1);
      console.log('Notification received:', notification);
    });
  };

  const handleNotificationAction = (data: any) => {
    switch (data.type) {
      case 'new_task':
        // Navigate to tasks screen
        router.push('/(tabs)/tasks');
        break;
      case 'task_reminder':
        // Navigate to specific task
        router.push('/(tabs)/tasks');
        break;
      case 'task_update':
        // Navigate to tasks or dashboard
        router.push('/(tabs)');
        break;
      default:
        // Default to dashboard
        router.push('/(tabs)');
    }
  };

  // Simulate receiving new task notification
  const simulateNewTaskNotification = async () => {
    const mockTask = {
      id: `task-${Date.now()}`,
      type: 'collection',
      priority: 'high',
      location: {
        address: 'Sector 5, Jabalpur',
        coordinates: { lat: 23.1825, lng: 79.9870 }
      }
    };

    await NotificationService.simulateTaskAssignment(mockTask);
    setNotificationCount(prev => prev + 1);

    // Show web alert for testing
    if (Platform.OS === 'web') {
      alert(`🔔 New Task: ${mockTask.type} in ${mockTask.location.address}`);
    }
  };

  const simulateTaskReminder = async () => {
    if (assignedTasks.length > 0) {
      const task = assignedTasks[0];
      await NotificationService.simulateTaskReminder(task);
      setNotificationCount(prev => prev + 1);

      // Show web alert for testing
      if (Platform.OS === 'web') {
        alert(`⏰ Reminder: ${task.type} task due soon`);
      }
    }
  };

  const clearAllNotifications = async () => {
    await NotificationService.clearAllNotifications();
    setNotificationCount(0);
  };

  return {
    pushToken,
    notificationCount,
    simulateNewTaskNotification,
    simulateTaskReminder,
    clearAllNotifications,
    isWebPlatform: Platform.OS === 'web',
  };
};
