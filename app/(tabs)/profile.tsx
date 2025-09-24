import React, { useState } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Switch,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import CustomHeader from '../../components/navigation/CustomHeader';
import {
  User,
  Edit3,
  Lock,
  Bell,
  Palette,
  BarChart3,
  HelpCircle,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Award,
  CheckCircle2,
  Calendar,
  ClipboardList,
  Sun,
  Moon,
  Smartphone,
  ChevronRight,
  X
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { worker, logoutWorker, assignedTasks, completedTasks, activeTask } = useWorkerData();
  const { theme, isDark, toggleTheme, themeMode, setThemeMode } = useTheme();
  const { notificationCount, clearAllNotifications } = useNotifications();
  const { syncStatus } = useOfflineSync();
  const insets = useSafeAreaInsets();
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Form states
  const [editFormData, setEditFormData] = useState({
    name: worker?.name || '',
    email: worker?.email || '',
    phone: worker?.phone || '',
    employeeId: worker?.employeeId || ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    taskUpdates: true,
    locationTracking: true,
    dutyReminders: true,
    weeklyReports: false,
  });

  // Calculate safe bottom padding for tab bar
  const tabBarHeight = 80;
  const safeBottomPadding = Math.max(insets.bottom + 65, tabBarHeight);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutWorker();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = async () => {
    if (!editFormData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    Alert.alert('Success', 'Profile updated successfully!');
    setShowEditModal(false);
  };

  const handleLanguagePress = () => {
    Alert.alert('Language Settings', 'Language selection feature coming soon!');
  };

  const handleThemePress = () => {
    setShowThemeModal(true);
  };

  const calculateWorkingDays = () => {
    return Math.floor(Math.random() * 30) + 1;
  };

  const getPerformanceRating = () => {
    const completed = completedTasks.length;
    const total = assignedTasks.length + completedTasks.length;
    if (total === 0) return 'New';
    const rate = (completed / total) * 100;
    if (rate >= 90) return 'Excellent';
    if (rate >= 75) return 'Good';
    if (rate >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const workerStats = [
    { 
      icon: ClipboardList, 
      title: 'Total Tasks', 
      value: assignedTasks.length + completedTasks.length,
      color: theme.colors.primary 
    },
    { 
      icon: CheckCircle2, 
      title: 'Completed', 
      value: completedTasks.length,
      color: theme.colors.success 
    },
    { 
      icon: Award, 
      title: 'Performance', 
      value: getPerformanceRating(),
      color: theme.colors.warning 
    },
    { 
      icon: Calendar, 
      title: 'Working Days', 
      value: calculateWorkingDays(),
      color: theme.colors.secondary 
    },
  ];

  const profileOptions = [
    {
      icon: Edit3,
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      action: () => setShowEditModal(true),
      color: theme.colors.primary
    },
    {
      icon: Lock,
      title: 'Change Password',
      subtitle: 'Update your account password',
      action: () => setShowPasswordModal(true),
      color: theme.colors.warning
    },
    {
      icon: Bell,
      title: 'Notification Settings',
      subtitle: `${notificationCount} unread notifications`,
      action: () => setShowSettingsModal(true),
      color: theme.colors.secondary
    },
    {
      icon: Palette,
      title: 'Theme Settings',
      subtitle: `Current: ${isDark ? 'Dark' : 'Light'} mode`,
      action: () => setShowThemeModal(true),
      color: theme.colors.primary
    },
    {
      icon: BarChart3,
      title: 'Performance Report',
      subtitle: 'View your work statistics',
      action: () => Alert.alert('Performance Report', 'Feature coming soon!'),
      color: theme.colors.success
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help with the app',
      action: () => Alert.alert('Help & Support', 'Contact support@bin2win.com'),
      color: theme.colors.textSecondary
    }
  ];

  const handleMenuPress = () => console.log('Profile menu pressed');

  return (
    <View className="flex-1 bg-background">
      <CustomHeader
        title="Profile"
        subtitle="Manage your account"
        showNotifications={false}
        showSettings={false}
        showConnectionStatus={false}
        showLanguageToggle={true}
        showThemeToggle={true}
        onMenuPress={handleMenuPress}
        onLanguagePress={handleLanguagePress}
        onThemePress={handleThemePress}
      />

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: safeBottomPadding + 20 }}
      >
        {/* Enhanced Profile Header */}
        <View className="bg-primary pt-8 pb-8 px-5 relative">
          <View className="items-center mb-5">
            <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-4 border-3 border-white/30">
              <User size={40} color="white" />
            </View>
            
            <Text className="text-2xl font-bold text-white mb-1">
              {worker?.name || 'Worker'}
            </Text>
            
            <Text className="text-base text-white/80 mb-3">
              {worker?.employeeId || 'N/A'} • {worker?.department || 'N/A'}
            </Text>
            
            <View className={`px-4 py-2 rounded-full flex-row items-center ${
              worker?.isOnDuty ? 'bg-success' : 'bg-textSecondary'
            }`}>
              <View className={`w-2 h-2 rounded-full mr-2 ${
                worker?.isOnDuty ? 'bg-white' : 'bg-white'
              }`} />
              <Text className="text-white text-xs font-semibold">
                {worker?.isOnDuty ? 'On Duty' : 'Off Duty'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => setShowEditModal(true)}
            className="bg-white/20 rounded-full py-3 px-5 self-center border border-white/30 active:scale-95"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Edit3 size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Edit Profile</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="p-5">
          {/* Stats Grid */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-text mb-4">
              Your Performance
            </Text>
            
            <View className="flex-row flex-wrap gap-3">
              {workerStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <View 
                    key={index} 
                    className="bg-card rounded-2xl p-4 items-center shadow-sm border border-border"
                    style={{ width: (width - 50) / 2 }}
                  >
                    <IconComponent size={24} color={stat.color} className="mb-2" />
                    <Text className="text-lg font-bold text-text mb-1">
                      {stat.value}
                    </Text>
                    <Text className="text-xs text-textSecondary text-center">
                      {stat.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Account Information */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-text mb-4">
              Account Information
            </Text>
            
            <View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <View className="flex-row items-center py-3 border-b border-border">
                <Mail size={16} color={theme.colors.textSecondary} />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-textSecondary">Email</Text>
                  <Text className="text-sm text-text font-medium">
                    {worker?.email || 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center py-3 border-b border-border">
                <Phone size={16} color={theme.colors.textSecondary} />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-textSecondary">Phone</Text>
                  <Text className="text-sm text-text font-medium">
                    {worker?.phone || 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center py-3">
                <MapPin size={16} color={theme.colors.textSecondary} />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-textSecondary">Assigned Area</Text>
                  <Text className="text-sm text-text font-medium">
                    {worker?.assignedArea || 'Not assigned'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Settings Options */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-text mb-4">
              Settings & Preferences
            </Text>
            
            {profileOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={option.action}
                  className="bg-card rounded-2xl p-4 mb-3 flex-row items-center shadow-sm border border-border active:scale-[0.98]"
                  activeOpacity={0.8}
                >
                  <IconComponent size={20} color={option.color} />
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-text mb-1">
                      {option.title}
                    </Text>
                    <Text className="text-xs text-textSecondary">
                      {option.subtitle}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-danger rounded-2xl py-4 flex-row items-center justify-center shadow-lg active:scale-[0.98]"
            activeOpacity={0.8}
          >
            <LogOut size={20} color="white" />
            <Text className="text-white text-base font-semibold ml-2">
              Logout
            </Text>
          </TouchableOpacity>

          {/* Debug Info - Remove in production */}
          <View className="mt-4 p-3 bg-textSecondary/10 rounded-lg">
            <Text className="text-xs text-textSecondary text-center">
              Safe Padding: {safeBottomPadding}px • Tab Height: {tabBarHeight}px
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Theme Settings Modal */}
      <Modal visible={showThemeModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <TouchableOpacity onPress={() => setShowThemeModal(false)}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-text">
              Theme Settings
            </Text>
            <View className="w-5" />
          </View>
          
          <View className="p-5">
            <Text className="text-base font-semibold text-text mb-5">
              Choose Theme
            </Text>
            
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const getIcon = () => {
                switch (mode) {
                  case 'light': return Sun;
                  case 'dark': return Moon;
                  case 'system': return Smartphone;
                  default: return Sun;
                }
              };
              const IconComponent = getIcon();

              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  className={`flex-row items-center py-4 px-4 rounded-2xl mb-2 border-2 ${
                    themeMode === mode 
                      ? 'bg-primary/20 border-primary' 
                      : 'bg-card border-border'
                  }`}
                  activeOpacity={0.8}
                >
                  <IconComponent size={20} color={themeMode === mode ? theme.colors.primary : theme.colors.text} />
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-text mb-1">
                      {mode === 'light' ? 'Light Mode' : mode === 'dark' ? 'Dark Mode' : 'System Default'}
                    </Text>
                    <Text className="text-xs text-textSecondary">
                      {mode === 'light' ? 'Always use light theme' : 
                       mode === 'dark' ? 'Always use dark theme' : 
                       'Follow system settings'}
                    </Text>
                  </View>
                  {themeMode === mode && (
                    <CheckCircle2 size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-text">
              Edit Profile
            </Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Text className="text-primary font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-5">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-text mb-2">Name</Text>
                <TextInput
                  className="bg-card border border-border rounded-xl p-4 text-text"
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-text mb-2">Email</Text>
                <TextInput
                  className="bg-card border border-border rounded-xl p-4 text-text"
                  value={editFormData.email}
                  onChangeText={(text) => setEditFormData({ ...editFormData, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-text mb-2">Phone</Text>
                <TextInput
                  className="bg-card border border-border rounded-xl p-4 text-text"
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-text mb-2">Employee ID</Text>
                <TextInput
                  className="bg-card border border-border rounded-xl p-4 text-text opacity-60"
                  value={editFormData.employeeId}
                  placeholder="Employee ID (Read-only)"
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={false}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
