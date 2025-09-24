import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SyncStatusProps {
  isOnline: boolean;
  queueCount: number;
  lastSync: number | null;
  onForceSync: () => void;
}

export default function SyncStatus({ isOnline, queueCount, lastSync, onForceSync }: SyncStatusProps) {
  const getLastSyncText = () => {
    if (!lastSync) return 'Never synced';
    const now = Date.now();
    const diffMinutes = Math.floor((now - lastSync) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just synced';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-danger';
    if (queueCount > 0) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusIcon = () => {
    if (!isOnline) return '📴';
    if (queueCount > 0) return '🔄';
    return '✅';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (queueCount > 0) return `Syncing ${queueCount}`;
    return 'Synced';
  };

  return (
    <View className="bg-card rounded-lg p-3 border border-border">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`} />
          <View className="flex-1">
            <Text className="text-text text-sm font-medium">
              {getStatusIcon()} {getStatusText()}
            </Text>
            <Text className="text-textSecondary text-xs">
              Last sync: {getLastSyncText()}
            </Text>
          </View>
        </View>
        
        {isOnline && queueCount > 0 && (
          <TouchableOpacity 
            onPress={onForceSync}
            className="bg-primary px-3 py-1 rounded-full"
          >
            <Text className="text-white text-xs font-medium">
              Sync Now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
