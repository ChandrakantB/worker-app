import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export interface OfflineQueueItem {
  id: string;
  action: 'task_update' | 'location_update' | 'photo_upload' | 'task_completion';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineTask {
  id: string;
  data: any;
  lastModified: number;
  status: 'pending' | 'synced' | 'error';
}

const OFFLINE_KEYS = {
  QUEUE: '@bin2win_offline_queue',
  TASKS: '@bin2win_offline_tasks',
  PHOTOS: '@bin2win_offline_photos',
  WORKER_DATA: '@bin2win_offline_worker',
  LAST_SYNC: '@bin2win_last_sync',
};

export class OfflineService {
  private static isOnline = true;
  private static onlineCallback: ((isOnline: boolean) => void) | null = null;

  static async initialize(): Promise<void> {
    // Initialize network listener
    if (Platform.OS !== 'web') {
      NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected ?? false;
        
        if (this.onlineCallback) {
          this.onlineCallback(this.isOnline);
        }

        // Auto-sync when coming back online
        if (!wasOnline && this.isOnline) {
          console.log('📶 Back online - starting sync...');
          this.processOfflineQueue();
        }
      });
    } else {
      // Web fallback - assume always online for now
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        if (this.onlineCallback) this.onlineCallback(true);
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        if (this.onlineCallback) this.onlineCallback(false);
      });
    }
  }

  static setOnlineCallback(callback: (isOnline: boolean) => void): void {
    this.onlineCallback = callback;
  }

  static getConnectionStatus(): boolean {
    return this.isOnline;
  }

  // Queue operations for offline sync
  static async addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getQueue();
      const newItem: OfflineQueueItem = {
        ...item,
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(newItem);
      await AsyncStorage.setItem(OFFLINE_KEYS.QUEUE, JSON.stringify(queue));
      console.log(`📱 Added to offline queue: ${item.action}`);

      // Try to process immediately if online
      if (this.isOnline) {
        this.processOfflineQueue();
      }
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  static async getQueue(): Promise<OfflineQueueItem[]> {
    try {
      const queueData = await AsyncStorage.getItem(OFFLINE_KEYS.QUEUE);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  static async processOfflineQueue(): Promise<void> {
    if (!this.isOnline) {
      console.log('📴 Offline - skipping queue processing');
      return;
    }

    try {
      const queue = await this.getQueue();
      const processedItems: string[] = [];

      for (const item of queue) {
        try {
          console.log(`🔄 Processing offline item: ${item.action}`);
          
          // Simulate API calls based on action type
          const success = await this.processQueueItem(item);
          
          if (success) {
            processedItems.push(item.id);
            console.log(`✅ Synced: ${item.action}`);
          } else {
            // Increment retry count
            item.retryCount++;
            if (item.retryCount >= 3) {
              processedItems.push(item.id); // Remove after 3 failed attempts
              console.log(`❌ Failed to sync after 3 attempts: ${item.action}`);
            }
          }
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error);
          item.retryCount++;
        }
      }

      // Remove processed items from queue
      const updatedQueue = queue.filter(item => !processedItems.includes(item.id));
      await AsyncStorage.setItem(OFFLINE_KEYS.QUEUE, JSON.stringify(updatedQueue));

      // Update last sync time
      await AsyncStorage.setItem(OFFLINE_KEYS.LAST_SYNC, Date.now().toString());

      console.log(`🔄 Processed ${processedItems.length} offline items`);
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  }

  private static async processQueueItem(item: OfflineQueueItem): Promise<boolean> {
    // Simulate API calls - replace with actual API integration
    switch (item.action) {
      case 'task_update':
        // Simulate task status update API call
        console.log('📋 Syncing task update:', item.data);
        return true;

      case 'location_update':
        // Simulate location update API call
        console.log('📍 Syncing location update:', item.data);
        return true;

      case 'photo_upload':
        // Simulate photo upload API call
        console.log('📸 Syncing photo upload:', item.data.taskId);
        return true;

      case 'task_completion':
        // Simulate task completion API call
        console.log('✅ Syncing task completion:', item.data);
        return true;

      default:
        console.log('❓ Unknown action type:', item.action);
        return false;
    }
  }

  // Store data locally for offline access
  static async storeOfflineData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`${OFFLINE_KEYS.TASKS}_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        status: 'pending',
      }));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  static async getOfflineData(key: string): Promise<any> {
    try {
      const stored = await AsyncStorage.getItem(`${OFFLINE_KEYS.TASKS}_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }

  // Store photos locally for offline mode
  static async storeOfflinePhoto(taskId: string, photoUri: string): Promise<void> {
    try {
      const photos = await this.getOfflinePhotos(taskId);
      photos.push({
        uri: photoUri,
        timestamp: Date.now(),
        synced: false,
      });
      
      await AsyncStorage.setItem(`${OFFLINE_KEYS.PHOTOS}_${taskId}`, JSON.stringify(photos));
    } catch (error) {
      console.error('Error storing offline photo:', error);
    }
  }

  static async getOfflinePhotos(taskId: string): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem(`${OFFLINE_KEYS.PHOTOS}_${taskId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting offline photos:', error);
      return [];
    }
  }

  // Get sync status information
  static async getSyncStatus(): Promise<{
    lastSync: number | null;
    queueCount: number;
    isOnline: boolean;
  }> {
    try {
      const lastSyncStr = await AsyncStorage.getItem(OFFLINE_KEYS.LAST_SYNC);
      const queue = await this.getQueue();
      
      return {
        lastSync: lastSyncStr ? parseInt(lastSyncStr, 10) : null,
        queueCount: queue.length,
        isOnline: this.isOnline,
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        lastSync: null,
        queueCount: 0,
        isOnline: this.isOnline,
      };
    }
  }

  // Manual sync trigger
  static async forcSync(): Promise<void> {
    console.log('🔄 Manual sync triggered');
    await this.processOfflineQueue();
  }

  // Clear all offline data
  static async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        OFFLINE_KEYS.QUEUE,
        OFFLINE_KEYS.TASKS,
        OFFLINE_KEYS.PHOTOS,
        OFFLINE_KEYS.LAST_SYNC,
      ]);
      console.log('🧹 Offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }
}
