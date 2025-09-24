import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import SyncStatus from '../../components/ui/SyncStatus';

export default function DashboardScreen() {
  const { worker, assignedTasks, activeTask, completedTasks, updateWorkerStatus } = useWorkerData();
  const { theme, workerColors } = useTheme();
  const { 
    notificationCount, 
    simulateNewTaskNotification, 
    simulateTaskReminder, 
    clearAllNotifications,
    isWebPlatform 
  } = useNotifications();
  const { isOnline, syncStatus, forceSync } = useOfflineSync();

  const toggleDutyStatus = () => {
    if (worker) {
      Alert.alert(
        worker.isOnDuty ? 'Go Off Duty?' : 'Go On Duty?',
        worker.isOnDuty ? 'You will stop receiving new tasks.' : 'You will start receiving new tasks.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: () => updateWorkerStatus(!worker.isOnDuty)
          }
        ]
      );
    }
  };

  const getTasksByPriority = () => {
    return {
      urgent: assignedTasks.filter(task => task.priority === 'urgent').length,
      high: assignedTasks.filter(task => task.priority === 'high').length,
      medium: assignedTasks.filter(task => task.priority === 'medium').length,
      low: assignedTasks.filter(task => task.priority === 'low').length,
    };
  };

  const taskPriority = getTasksByPriority();

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-4 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold">
          Good Morning! 👋
        </Text>
        <Text className="text-white text-lg opacity-90">
          {worker ? worker.name : 'Worker'}
        </Text>
      </View>

      <View className="p-4">
        {/* Duty Status Card */}
        <View className="bg-card rounded-lg p-4 mb-4 border border-border">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text text-lg font-semibold">
                Duty Status
              </Text>
              <Text className="text-textSecondary mt-1">
                {worker?.department || 'Worker'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={toggleDutyStatus}
              className={`px-4 py-2 rounded-full ${
                worker?.isOnDuty ? 'bg-success' : 'bg-textSecondary'
              }`}
            >
              <Text className="text-white font-medium">
                {worker?.isOnDuty ? '🟢 On Duty' : '🔴 Off Duty'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync Status */}
        <View className="mb-4">
          <SyncStatus
            isOnline={isOnline}
            queueCount={syncStatus.queueCount}
            lastSync={syncStatus.lastSync}
            onForceSync={forceSync}
          />
        </View>

        {/* Notification Testing (Development Only) */}
        <View className="bg-card rounded-lg p-4 mb-4 border border-border">
          <Text className="text-text text-lg font-semibold mb-3">
            🔔 Notification Testing {isWebPlatform && '(Web Mode)'}
          </Text>
          
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-textSecondary">Unread Notifications:</Text>
            <View className="bg-danger px-2 py-1 rounded-full">
              <Text className="text-white text-sm font-bold">{notificationCount}</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <TouchableOpacity 
              onPress={simulateNewTaskNotification}
              className="bg-warning px-3 py-2 rounded-lg flex-1 mr-1"
            >
              <Text className="text-white text-center text-sm font-medium">
                📋 New Task
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={simulateTaskReminder}
              className="bg-primary px-3 py-2 rounded-lg flex-1 mx-1"
            >
              <Text className="text-white text-center text-sm font-medium">
                ⏰ Reminder
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={clearAllNotifications}
              className="bg-textSecondary px-3 py-2 rounded-lg flex-1 ml-1"
            >
              <Text className="text-white text-center text-sm font-medium">
                🧹 Clear
              </Text>
            </TouchableOpacity>
          </View>
          
          {isWebPlatform && (
            <Text className="text-textSecondary text-xs mt-2 text-center">
              💡 Web testing uses console logs and alerts
            </Text>
          )}
        </View>

        {/* Active Task Card */}
        {activeTask ? (
          <View className="bg-inProgress bg-opacity-10 border-l-4 border-inProgress rounded-lg p-4 mb-4">
            <Text className="text-inProgress text-lg font-semibold mb-2">
              🔄 Active Task
            </Text>
            <Text className="text-text font-medium">
              {activeTask.type.charAt(0).toUpperCase() + activeTask.type.slice(1)}
            </Text>
            <Text className="text-textSecondary mt-1">
              📍 {activeTask.location.address}
            </Text>
            <Text className="text-textSecondary mt-1">
              🗑️ {activeTask.wasteType} ({activeTask.estimatedQuantity})
            </Text>
          </View>
        ) : (
          <View className="bg-card rounded-lg p-4 mb-4 border border-border">
            <Text className="text-textSecondary text-center py-4">
              No active task at the moment
            </Text>
          </View>
        )}

        {/* Stats Row */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-card rounded-lg p-4 flex-1 mr-2 border border-border">
            <Text className="text-primary text-2xl font-bold">
              {assignedTasks.length}
            </Text>
            <Text className="text-textSecondary text-sm">
              Assigned Tasks
            </Text>
          </View>
          <View className="bg-card rounded-lg p-4 flex-1 ml-2 border border-border">
            <Text className="text-success text-2xl font-bold">
              {completedTasks.length}
            </Text>
            <Text className="text-textSecondary text-sm">
              Completed
            </Text>
          </View>
        </View>

        {/* Priority Breakdown */}
        <View className="bg-card rounded-lg p-4 mb-4 border border-border">
          <Text className="text-text text-lg font-semibold mb-3">
            Tasks by Priority
          </Text>
          
          <View className="space-y-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-danger rounded-full mr-2" />
                <Text className="text-text">Urgent</Text>
              </View>
              <Text className="text-text font-semibold">{taskPriority.urgent}</Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-warning rounded-full mr-2" />
                <Text className="text-text">High</Text>
              </View>
              <Text className="text-text font-semibold">{taskPriority.high}</Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-primary rounded-full mr-2" />
                <Text className="text-text">Medium</Text>
              </View>
              <Text className="text-text font-semibold">{taskPriority.medium}</Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-success rounded-full mr-2" />
                <Text className="text-text">Low</Text>
              </View>
              <Text className="text-text font-semibold">{taskPriority.low}</Text>
            </View>
          </View>
        </View>

        {/* Offline Testing (Development Only) */}
        <View className="bg-card rounded-lg p-4 mb-4 border border-border">
          <Text className="text-text text-lg font-semibold mb-3">
            📱 Offline Testing
          </Text>
          
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-textSecondary">Connection Status:</Text>
            <View className={`px-3 py-1 rounded-full ${isOnline ? 'bg-success' : 'bg-danger'}`}>
              <Text className="text-white text-sm font-bold">
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-textSecondary">Pending Sync:</Text>
            <Text className="text-text font-semibold">{syncStatus.queueCount} items</Text>
          </View>
          
          {syncStatus.queueCount > 0 && isOnline && (
            <TouchableOpacity 
              onPress={forceSync}
              className="bg-primary px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-center font-medium">
                🔄 Force Sync Now
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View className="bg-card rounded-lg p-4 border border-border">
          <Text className="text-text text-lg font-semibold mb-3">
            Quick Actions
          </Text>
          
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-primary px-4 py-3 rounded-lg flex-1 mr-2">
              <Text className="text-white text-center font-medium">
                📋 View Tasks
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-secondary px-4 py-3 rounded-lg flex-1 ml-2">
              <Text className="text-white text-center font-medium">
                🗺️ Open Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
