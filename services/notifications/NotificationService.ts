import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

// Configure notification behavior only on supported platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export class NotificationService {
  private static expoPushToken: string | null = null;

  static async initialize(): Promise<string | null> {
    // Skip notifications on web platform
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web platform');
      return null;
    }

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notification Permission Required',
          'Please enable notifications to receive task assignments and updates.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Get push token (only for physical devices)
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-expo-project-id', // Replace with your Expo project ID
        });
        this.expoPushToken = token.data;
        console.log('Expo Push Token:', token.data);
        return token.data;
      } else {
        console.log('Push notifications require a physical device');
        return null;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  static async scheduleLocalNotification(notification: NotificationData): Promise<void> {
    // Skip on web, show console log instead
    if (Platform.OS === 'web') {
      console.log('🔔 [WEB SIMULATION] Notification:', notification.title, '-', notification.body);
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Simulate server push notifications for development
  static async simulateTaskAssignment(taskData: any): Promise<void> {
    const notification: NotificationData = {
      title: '🔔 New Task Assigned!',
      body: `${taskData.type} task in ${taskData.location.address}`,
      data: {
        type: 'new_task',
        taskId: taskData.id,
        priority: taskData.priority,
      },
    };

    await this.scheduleLocalNotification(notification);
  }

  static async simulateTaskReminder(taskData: any): Promise<void> {
    const notification: NotificationData = {
      title: '⏰ Task Reminder',
      body: `Task "${taskData.type}" is due soon at ${taskData.location.address}`,
      data: {
        type: 'task_reminder',
        taskId: taskData.id,
        priority: taskData.priority,
      },
    };

    await this.scheduleLocalNotification(notification);
  }

  static async simulateTaskUpdate(taskData: any, status: string): Promise<void> {
    const statusMessages = {
      approved: '✅ Task approved by admin',
      rejected: '❌ Task rejected - please review',
      urgent: '🚨 Task marked as URGENT',
    };

    const notification: NotificationData = {
      title: '📋 Task Update',
      body: statusMessages[status] || `Task status updated: ${status}`,
      data: {
        type: 'task_update',
        taskId: taskData.id,
        status: status,
      },
    };

    await this.scheduleLocalNotification(notification);
  }

  static getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Handle notification tap when app is opened
  static addNotificationResponseListener(handler: (response: any) => void): void {
    if (Platform.OS === 'web') {
      console.log('Notification response listeners not supported on web');
      return;
    }
    Notifications.addNotificationResponseReceivedListener(handler);
  }

  // Handle notifications received while app is open
  static addNotificationReceivedListener(handler: (notification: any) => void): void {
    if (Platform.OS === 'web') {
      console.log('Notification received listeners not supported on web');
      return;
    }
    Notifications.addNotificationReceivedListener(handler);
  }

  // Clear all notifications
  static async clearAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('🧹 [WEB SIMULATION] Cleared all notifications');
      return;
    }

    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Get notification badge count
  static async getBadgeCount(): Promise<number> {
    if (Platform.OS === 'web') {
      return 0; // Web doesn't support badges
    }

    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  // Set notification badge count
  static async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'web') {
      console.log(`🔢 [WEB SIMULATION] Badge count set to: ${count}`);
      return;
    }

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
}
