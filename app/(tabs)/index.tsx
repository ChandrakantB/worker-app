import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Dimensions, Vibration } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { SOSService } from '../../services/emergency/SOSService';
import CustomHeader from '../../components/navigation/CustomHeader';
import {
  Activity, AlertTriangle, AlertCircle, CheckCircle2, Circle, MapPin, Trash2, Target,
  TrendingUp, Zap, Shield, Timer, Calendar, BarChart3, Gauge, Route, Play, Pause,
  ChevronRight, RefreshCw, Siren, PhoneCall, Phone, Signal, WifiOff
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { worker, assignedTasks, activeTask, completedTasks, updateWorkerStatus } = useWorkerData();
  const { theme } = useTheme();
  const { isOnline, syncStatus } = useOfflineSync();
  const insets = useSafeAreaInsets();
  const [sosLoading, setSosLoading] = useState(false);

  // Calculate safe bottom padding for tab bar
  const tabBarHeight = 80; // Android tab bar height
  const safeBottomPadding = Math.max(insets.bottom + 65, tabBarHeight); // iOS: insets + 65, Android: 80

  const handleSOS = () => {
    Vibration.vibrate([0, 100, 100, 100]);
    Alert.alert(
      '🚨 Emergency SOS',
      'This will immediately alert supervisors and emergency services with your location. Use only for real emergencies.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Emergency Alert', style: 'destructive', onPress: sendSOSAlert }
      ]
    );
  };

  const sendSOSAlert = async () => {
    if (!worker) return;
    setSosLoading(true);
    
    try {
      Vibration.vibrate([0, 200, 100, 200]);
      const success = await SOSService.sendEmergencyAlert(worker.id, worker.name, 'general');
      
      Alert.alert(
        success ? '✅ Emergency Alert Sent' : '❌ Alert Failed',
        success 
          ? 'Help is on the way! Emergency services and supervisors have been notified.\n\nYour location has been shared.\n\nStay calm and stay safe.' 
          : 'Emergency alert could not be sent. Please try again or call emergency services directly.',
        success 
          ? [{ text: 'OK' }]
          : [
              { text: 'Retry', onPress: sendSOSAlert },
              { text: 'Call 108', onPress: () => console.log('Direct emergency call') }
            ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert. Please call 108 directly.');
    } finally {
      setSosLoading(false);
    }
  };

  const toggleDutyStatus = () => {
    if (!worker) return;
    Alert.alert(
      worker.isOnDuty ? 'Go Off Duty?' : 'Go On Duty?',
      worker.isOnDuty ? 'You will stop receiving new tasks' : 'You will start receiving new tasks',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateWorkerStatus(!worker.isOnDuty) }
      ]
    );
  };

  const getTasksByPriority = () => ({
    urgent: assignedTasks.filter(task => task.priority === 'urgent').length,
    high: assignedTasks.filter(task => task.priority === 'high').length,
    medium: assignedTasks.filter(task => task.priority === 'medium').length,
    low: assignedTasks.filter(task => task.priority === 'low').length,
  });

  const getCompletionRate = () => {
    const total = assignedTasks.length + completedTasks.length;
    return total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;
  };

  const taskPriority = getTasksByPriority();
  const completionRate = getCompletionRate();

  const handleMenuPress = () => {
    console.log('Menu pressed - Add drawer/menu logic here');
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed - Navigate to notifications screen');
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed - Navigate to settings screen');
  };

  return (
    <View className="flex-1 bg-background">
      <CustomHeader
        title="Dashboard"
        subtitle={`Welcome back, ${worker?.name || 'Worker'}!`}
        showNotifications={true}
        showSettings={true}
        showConnectionStatus={true}
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        onSettingsPress={handleSettingsPress}
      />
      
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: safeBottomPadding + 20 // Extra 20px padding for breathing room
        }}
      >
        <View className="p-5">
          {/* Status Overview Cards */}
          <View className="flex-row mb-5 gap-3">
            {/* Duty Status Card */}
            <TouchableOpacity
              onPress={toggleDutyStatus}
              className={`flex-1 bg-card rounded-2xl p-4 border-2 shadow-sm ${
                worker?.isOnDuty ? 'border-success' : 'border-border'
              }`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center mb-3">
                {worker?.isOnDuty ? (
                  <Play size={20} color={theme.colors.success} />
                ) : (
                  <Pause size={20} color={theme.colors.textSecondary} />
                )}
                <Text className={`ml-2 text-sm font-semibold ${
                  worker?.isOnDuty ? 'text-success' : 'text-textSecondary'
                }`}>
                  {worker?.isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                </Text>
              </View>
              <Text className="text-xs text-textSecondary mb-2">
                {worker?.department || 'Department'}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-xs text-textSecondary flex-1">
                  Tap to toggle
                </Text>
                <ChevronRight size={14} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Connection Status Card */}
            <View className={`flex-1 bg-card rounded-2xl p-4 border-2 shadow-sm ${
              isOnline ? 'border-success' : 'border-danger'
            }`}>
              <View className="flex-row items-center mb-3">
                {isOnline ? (
                  <Signal size={20} color={theme.colors.success} />
                ) : (
                  <WifiOff size={20} color={theme.colors.danger} />
                )}
                <Text className={`ml-2 text-sm font-semibold ${
                  isOnline ? 'text-success' : 'text-danger'
                }`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </Text>
              </View>
              <Text className="text-xs text-textSecondary mb-2">Sync Status</Text>
              <Text className="text-xs text-textSecondary">
                {syncStatus.queueCount} pending
              </Text>
            </View>
          </View>

          {/* Emergency SOS Section - Enhanced */}
          <View className="bg-card rounded-3xl p-5 mb-6 shadow-lg border-2 border-danger/20">
            <View className="flex-row items-center mb-4">
              <Shield size={24} color={theme.colors.danger} />
              <Text className="text-lg font-bold text-text ml-3">
                Emergency Services
              </Text>
            </View>

            {/* Main SOS Button */}
            <TouchableOpacity
              onPress={handleSOS}
              disabled={sosLoading}
              className={`bg-danger rounded-2xl p-5 items-center shadow-xl mb-4 ${
                sosLoading ? 'opacity-70' : ''
              }`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center mb-2">
                {sosLoading ? (
                  <RefreshCw size={32} color="white" className="mr-3 animate-spin" />
                ) : (
                  <Siren size={32} color="white" className="mr-3" />
                )}
                <Text className="text-white text-xl font-extrabold tracking-wider">
                  {sosLoading ? 'SENDING...' : 'EMERGENCY SOS'}
                </Text>
              </View>
              <Text className="text-white/90 text-sm text-center tracking-wide leading-5">
                {sosLoading 
                  ? 'Alerting supervisors and emergency services with your location' 
                  : 'Tap for immediate assistance • Use only in real emergencies'
                }
              </Text>
            </TouchableOpacity>

            {/* Emergency Contacts Grid */}
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-background rounded-xl p-3 items-center active:bg-border"
                activeOpacity={0.7}
              >
                <PhoneCall size={16} color={theme.colors.danger} className="mb-1" />
                <Text className="text-xs font-semibold text-text">Emergency</Text>
                <Text className="text-xs text-textSecondary">108</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-background rounded-xl p-3 items-center active:bg-border"
                activeOpacity={0.7}
              >
                <Phone size={16} color={theme.colors.primary} className="mb-1" />
                <Text className="text-xs font-semibold text-text">Supervisor</Text>
                <Text className="text-xs text-textSecondary">Available</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Performance Metrics */}
          <View className="bg-card rounded-2xl p-5 mb-5 shadow-sm">
            <View className="flex-row items-center mb-5">
              <Gauge size={24} color={theme.colors.text} />
              <Text className="text-lg font-bold text-text ml-3">
                Performance Overview
              </Text>
            </View>

            {/* Stats Grid - Responsive */}
            <View className="flex-row flex-wrap gap-3">
              {[
                { icon: Target, value: assignedTasks.length, label: 'Assigned Tasks', color: theme.colors.primary },
                { icon: CheckCircle2, value: completedTasks.length, label: 'Completed', color: theme.colors.success },
                { icon: TrendingUp, value: `${completionRate}%`, label: 'Completion Rate', color: theme.colors.warning },
                { icon: Calendar, value: Math.floor(Math.random() * 30) + 1, label: 'Working Days', color: theme.colors.secondary }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <View 
                    key={index}
                    className="bg-background rounded-xl p-4 items-center flex-1 min-w-[120px]"
                    style={{ minWidth: (width - 70) / 2 }}
                  >
                    <IconComponent size={24} color={stat.color} className="mb-2" />
                    <Text className="text-2xl font-bold text-text mb-1">
                      {stat.value}
                    </Text>
                    <Text className="text-xs text-textSecondary text-center leading-4">
                      {stat.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Active Task Section */}
          <View className="bg-card rounded-2xl p-5 mb-5 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Activity size={24} color={theme.colors.text} />
              <Text className="text-lg font-bold text-text ml-3">
                Current Task
              </Text>
            </View>

            {activeTask ? (
              <View className="bg-inProgress/15 rounded-xl p-4 border-l-4 border-inProgress">
                <Text className="text-base font-semibold text-text mb-2">
                  {activeTask.type.charAt(0).toUpperCase() + activeTask.type.slice(1)} Task
                </Text>
                
                <View className="flex-row items-center mb-1.5">
                  <MapPin size={14} color={theme.colors.textSecondary} />
                  <Text className="text-sm text-textSecondary ml-1.5 flex-1">
                    {activeTask.location.address}
                  </Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Trash2 size={14} color={theme.colors.textSecondary} />
                  <Text className="text-sm text-textSecondary ml-1.5">
                    {activeTask.wasteType} • {activeTask.estimatedQuantity}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="bg-inProgress px-2 py-1 rounded-md">
                    <Text className="text-white text-xs font-semibold">IN PROGRESS</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Timer size={16} color={theme.colors.textSecondary} />
                    <Text className="text-xs text-textSecondary ml-1">
                      Started 25 min ago
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="bg-background rounded-xl p-5 items-center border-2 border-dashed border-border">
                <Circle size={32} color={theme.colors.textSecondary} className="mb-3" />
                <Text className="text-base text-textSecondary text-center mb-1">
                  No active task
                </Text>
                <Text className="text-xs text-textSecondary text-center leading-4">
                  New tasks will appear here when assigned
                </Text>
              </View>
            )}
          </View>

          {/* Priority Breakdown */}
          <View className="bg-card rounded-2xl p-5 mb-5 shadow-sm">
            <View className="flex-row items-center mb-4">
              <BarChart3 size={24} color={theme.colors.text} />
              <Text className="text-lg font-bold text-text ml-3">
                Task Priorities
              </Text>
            </View>

            <View className="gap-3">
              {[
                { key: 'urgent', label: 'Urgent', count: taskPriority.urgent, color: theme.colors.danger, icon: AlertTriangle },
                { key: 'high', label: 'High', count: taskPriority.high, color: theme.colors.warning, icon: AlertCircle },
                { key: 'medium', label: 'Medium', count: taskPriority.medium, color: theme.colors.primary, icon: Circle },
                { key: 'low', label: 'Low', count: taskPriority.low, color: theme.colors.success, icon: CheckCircle2 }
              ].map((priority) => {
                const IconComponent = priority.icon;
                return (
                  <View key={priority.key} className="flex-row items-center bg-background rounded-xl p-3">
                    <IconComponent size={18} color={priority.color} />
                    <Text className="text-sm font-semibold text-text ml-3 flex-1">
                      {priority.label}
                    </Text>
                    <View 
                      className="rounded-xl px-2 py-1 min-w-[28px] items-center"
                      style={{ backgroundColor: priority.color }}
                    >
                      <Text className="text-white text-xs font-bold">
                        {priority.count}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick Actions - Final Section */}
          <View className="bg-card rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Zap size={24} color={theme.colors.text} />
              <Text className="text-lg font-bold text-text ml-3">
                Quick Actions
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-primary rounded-xl p-4 items-center shadow-sm active:scale-95"
                activeOpacity={0.8}
              >
                <Target size={24} color="white" className="mb-2" />
                <Text className="text-white text-sm font-semibold">
                  View Tasks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-secondary rounded-xl p-4 items-center shadow-sm active:scale-95"
                activeOpacity={0.8}
              >
                <Route size={24} color="white" className="mb-2" />
                <Text className="text-white text-sm font-semibold">
                  Open Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Debug Info - Remove in production */}
          <View className="mt-4 p-3 bg-textSecondary/10 rounded-lg">
            <Text className="text-xs text-textSecondary text-center">
              Safe Bottom: {safeBottomPadding}px • Tab Height: {tabBarHeight}px • Insets: {insets.bottom}px
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
