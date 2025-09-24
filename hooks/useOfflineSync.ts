import { useEffect, useState } from 'react';
import { OfflineService } from '../services/offline/OfflineService';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null as number | null,
    queueCount: 0,
    isOnline: true,
  });

  useEffect(() => {
    // Initialize offline service
    initializeOfflineService();

    // Update sync status periodically
    const interval = setInterval(updateSyncStatus, 10000); // Every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const initializeOfflineService = async () => {
    await OfflineService.initialize();
    
    // Set up online/offline callback
    OfflineService.setOnlineCallback((online) => {
      setIsOnline(online);
      updateSyncStatus();
    });

    // Initial sync status update
    updateSyncStatus();
  };

  const updateSyncStatus = async () => {
    const status = await OfflineService.getSyncStatus();
    setSyncStatus(status);
    setIsOnline(status.isOnline);
  };

  const addToOfflineQueue = async (action: string, data: any) => {
    await OfflineService.addToQueue({
      action: action as any,
      data,
    });
    updateSyncStatus();
  };

  const forceSync = async () => {
    await OfflineService.forcSync();
    updateSyncStatus();
  };

  const clearOfflineData = async () => {
    await OfflineService.clearOfflineData();
    updateSyncStatus();
  };

  return {
    isOnline,
    syncStatus,
    addToOfflineQueue,
    forceSync,
    clearOfflineData,
    updateSyncStatus,
  };
};
