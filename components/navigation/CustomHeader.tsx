import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import {
  Bell, Settings, Menu, Wifi, WifiOff, Clock, Languages, Sun, Moon, 
  X, Power, MapPin, User, BarChart3, HelpCircle, LogOut, Globe, 
  Smartphone, CheckCircle2
} from 'lucide-react-native';

interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  showConnectionStatus?: boolean;
  showLanguageToggle?: boolean;
  showThemeToggle?: boolean;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  onLanguagePress?: () => void;
  onThemePress?: () => void;
}

export default function CustomHeader({
  title, subtitle, showNotifications = true, showSettings = true,
  showConnectionStatus = true, showLanguageToggle = false, showThemeToggle = false,
  onMenuPress, onNotificationPress, onSettingsPress, onLanguagePress, onThemePress,
}: CustomHeaderProps) {
  const { theme, isDark, toggleTheme, themeMode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { notificationCount, clearAllNotifications } = useNotifications();
  const { isOnline, syncStatus, forceSync } = useOfflineSync();
  const { worker, logoutWorker, updateWorkerStatus } = useWorkerData();

  // Modal states
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const getHeaderPadding = () => {
    if (Platform.OS === 'ios') {
      return insets.top > 0 ? insets.top + 8 : 48;
    } else if (Platform.OS === 'android') {
      return (StatusBar.currentHeight || 24) - 6;
    }
    return 8;
  };

  const headerPadding = getHeaderPadding();
  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // MENU FUNCTIONALITY - FIXED
  const handleMenuPress = () => {
    console.log('🔍 Menu button pressed');
    console.log('🔍 onMenuPress provided:', !!onMenuPress);
    
    if (onMenuPress) {
      console.log('🔍 Using custom onMenuPress handler');
      onMenuPress();
    } else {
      console.log('🔍 Opening default menu modal');
      setShowMenuModal(true);
      console.log('🔍 Modal state set to true');
    }
  };

  const menuItems = [
    {
      icon: Power,
      title: worker?.isOnDuty ? 'Go Off Duty' : 'Go On Duty',
      subtitle: worker?.isOnDuty ? 'Stop receiving new tasks' : 'Start receiving new tasks',
      action: () => {
        setShowMenuModal(false);
        Alert.alert(
          worker?.isOnDuty ? 'Go Off Duty?' : 'Go On Duty?',
          worker?.isOnDuty ? 'You will stop receiving new tasks' : 'You will start receiving new tasks',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Confirm', onPress: () => updateWorkerStatus(!worker?.isOnDuty) }
          ]
        );
      },
      color: worker?.isOnDuty ? theme.colors.warning : theme.colors.success
    },
    {
      icon: BarChart3,
      title: 'Performance Report',
      subtitle: 'View your work statistics',
      action: () => {
        setShowMenuModal(false);
        Alert.alert('Performance Report', 'Performance analytics feature coming soon!');
      },
      color: theme.colors.primary
    },
    {
      icon: MapPin,
      title: 'Location Services',
      subtitle: 'Manage location tracking',
      action: () => {
        setShowMenuModal(false);
        Alert.alert('Location Services', 'Location tracking is active for task assignment and navigation.');
      },
      color: theme.colors.secondary
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help with the app',
      action: () => {
        setShowMenuModal(false);
        Alert.alert(
          'Help & Support', 
          'Need assistance?\n\n📧 Email: support@bin2win.com\n📞 Phone: +91-XXXXXXXXXX\n🕒 Available: Mon-Fri 9AM-6PM'
        );
      },
      color: theme.colors.textSecondary
    }
  ];

  // NOTIFICATIONS FUNCTIONALITY
  const handleNotificationPress = () => {
    console.log('🔍 Notification button pressed');
    
    if (onNotificationPress) {
      console.log('🔍 Using custom notification handler');
      onNotificationPress();
    } else {
      console.log('🔍 Opening default notifications modal');
      setShowNotificationsModal(true);
    }
  };

  const mockNotifications = [
    {
      id: '1',
      title: 'New Task Assigned',
      message: 'Organic waste collection at Residential Zone Block A',
      time: '5 min ago',
      type: 'task',
      unread: true
    },
    {
      id: '2',
      title: 'Task Completed',
      message: 'Successfully completed waste collection at Sector 4',
      time: '1 hour ago',
      type: 'success',
      unread: true
    },
    {
      id: '3',
      title: 'Route Updated',
      message: 'Your collection route has been optimized',
      time: '2 hours ago',
      type: 'info',
      unread: false
    },
    {
      id: '4',
      title: 'Weekly Report',
      message: 'Your performance report for this week is ready',
      time: '1 day ago',
      type: 'report',
      unread: false
    }
  ];

  // SETTINGS FUNCTIONALITY
  const handleSettingsPress = () => {
    console.log('🔍 Settings button pressed');
    
    if (onSettingsPress) {
      console.log('🔍 Using custom settings handler');
      onSettingsPress();
    } else {
      console.log('🔍 Opening default settings modal');
      setShowSettingsModal(true);
    }
  };

  const settingsItems = [
    {
      icon: User,
      title: 'Edit Profile',
      subtitle: 'Update personal information',
      action: () => {
        setShowSettingsModal(false);
        router.push('/(tabs)/profile');
      }
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: `${notificationCount} unread notifications`,
      action: () => {
        setShowSettingsModal(false);
        setShowNotificationsModal(true);
      }
    },
    {
      icon: Globe,
      title: 'Language',
      subtitle: 'Change app language',
      action: () => {
        setShowSettingsModal(false);
        setShowLanguageModal(true);
      }
    },
    {
      icon: isDark ? Sun : Moon,
      title: 'Theme',
      subtitle: `Current: ${isDark ? 'Dark' : 'Light'} mode`,
      action: () => {
        setShowSettingsModal(false);
        setShowThemeModal(true);
      }
    }
  ];

  // THEME FUNCTIONALITY
  const handleThemePress = () => {
    console.log('🔍 Theme button pressed');
    
    if (onThemePress) {
      console.log('🔍 Using custom theme handler');
      onThemePress();
    } else {
      console.log('🔍 Opening default theme modal');
      setShowThemeModal(true);
    }
  };

  // LANGUAGE FUNCTIONALITY
  const handleLanguagePress = () => {
    console.log('🔍 Language button pressed');
    
    if (onLanguagePress) {
      console.log('🔍 Using custom language handler');
      onLanguagePress();
    } else {
      console.log('🔍 Opening default language modal');
      setShowLanguageModal(true);
    }
  };

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', active: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', active: false },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', active: false },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', active: false }
  ];

  return (
    <>
      <View 
        className="bg-background border-b border-border shadow-sm"
        style={{ 
          paddingTop: headerPadding,
          marginTop: 0,
          zIndex: 10
        }}
      >
        {/* Main Header Row */}
        <View className="flex-row items-center justify-between px-5 py-3">
          {/* Left Side - Menu & Title */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={handleMenuPress} 
              className="mr-4 p-2 rounded-lg active:bg-border"
              activeOpacity={0.7}
            >
              <Menu size={22} color={theme.colors.text} />
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text className="text-lg font-bold text-text tracking-tight leading-5">
                {title}
              </Text>
              {subtitle && (
                <Text className="text-sm text-textSecondary mt-0.5 leading-4">
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Right Side - Action Icons */}
          <View className="flex-row items-center gap-2">
            {showConnectionStatus && (
              <TouchableOpacity 
                onPress={() => {
                  forceSync();
                  Alert.alert(
                    isOnline ? 'Sync Started' : 'Offline Mode',
                    isOnline 
                      ? 'Syncing data with server...' 
                      : 'You are offline. Changes will sync when connection is restored.'
                  );
                }}
                className="items-center p-1 rounded-lg active:bg-border"
                activeOpacity={0.7}
              >
                {isOnline ? (
                  <Wifi size={18} color={theme.colors.success} />
                ) : (
                  <WifiOff size={18} color={theme.colors.danger} />
                )}
              </TouchableOpacity>
            )}

            {showLanguageToggle && (
              <TouchableOpacity 
                onPress={handleLanguagePress} 
                className="p-2 rounded-lg active:bg-border"
                activeOpacity={0.7}
              >
                <Languages size={16} color={theme.colors.text} />
              </TouchableOpacity>
            )}

            {showThemeToggle && (
              <TouchableOpacity 
                onPress={handleThemePress} 
                className="p-2 rounded-lg active:bg-border"
                activeOpacity={0.7}
              >
                {isDark ? (
                  <Sun size={16} color={theme.colors.text} />
                ) : (
                  <Moon size={16} color={theme.colors.text} />
                )}
              </TouchableOpacity>
            )}

            {showNotifications && (
              <TouchableOpacity 
                onPress={handleNotificationPress} 
                className="relative p-2 rounded-lg active:bg-border"
                activeOpacity={0.7}
              >
                <Bell size={18} color={theme.colors.text} />
                {notificationCount > 0 && (
                  <View className="absolute -top-0.5 -right-0.5 bg-danger rounded-full min-w-[16px] h-[16px] items-center justify-center border border-background">
                    <Text className="text-white text-[9px] font-bold leading-3">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {showSettings && (
              <TouchableOpacity 
                onPress={handleSettingsPress} 
                className="p-2 rounded-lg active:bg-border"
                activeOpacity={0.7}
              >
                <Settings size={18} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status Bar - App info */}
        <View className="flex-row items-center justify-between px-5 pb-3 pt-1">
          <View className="flex-row items-center">
            <Clock size={12} color={theme.colors.textSecondary} />
            <Text className="text-xs text-textSecondary font-medium ml-1">
              {getCurrentTime()}
            </Text>
          </View>

          
        </View>

        {/* Debug Info */}
        {__DEV__ && showMenuModal && (
          <View className="bg-green-500 px-2 py-1">
            <Text className="text-white text-xs text-center font-bold">
              🟢 MODAL STATE: TRUE - Modal should be visible!
            </Text>
          </View>
        )}
      </View>

      {/* MENU MODAL */}
      <Modal 
        visible={showMenuModal} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <Text className="text-lg font-semibold text-text">Menu</Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('🔍 Closing menu modal');
                setShowMenuModal(false);
              }}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-5">
              {/* Worker Profile Card */}
              <View className="bg-card rounded-2xl p-4 mb-4 border border-border">
                <View className="flex-row items-center">
                  <View className="bg-primary/20 rounded-full p-3">
                    <User size={32} color={theme.colors.primary} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-bold text-text">{worker?.name || 'Worker Name'}</Text>
                    <Text className="text-sm text-textSecondary">{worker?.employeeId || 'ID: N/A'}</Text>
                    <Text className="text-xs text-textSecondary mt-1">{worker?.department || 'Department'}</Text>
                    <View className={`px-2 py-1 rounded-lg mt-2 self-start ${
                      worker?.isOnDuty ? 'bg-success/20' : 'bg-textSecondary/20'
                    }`}>
                      <Text className={`text-xs font-semibold ${
                        worker?.isOnDuty ? 'text-success' : 'text-textSecondary'
                      }`}>
                        {worker?.isOnDuty ? '🟢 On Duty' : '🔴 Off Duty'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Menu Items */}
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={item.action}
                    className="bg-card rounded-2xl p-4 mb-3 flex-row items-center border border-border active:scale-[0.98]"
                    activeOpacity={0.8}
                  >
                    <View className="bg-background rounded-lg p-2">
                      <IconComponent size={20} color={item.color} />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-base font-semibold text-text">{item.title}</Text>
                      <Text className="text-xs text-textSecondary mt-1">{item.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Logout Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowMenuModal(false);
                  Alert.alert(
                    'Logout Confirmation',
                    'Are you sure you want to logout? Any unsaved changes will be lost.',
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
                }}
                className="bg-danger rounded-2xl p-4 flex-row items-center justify-center mt-2 active:scale-[0.98]"
                activeOpacity={0.8}
              >
                <LogOut size={20} color="white" />
                <Text className="text-white font-bold ml-2">Logout</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* NOTIFICATIONS MODAL */}
      <Modal 
        visible={showNotificationsModal} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <Text className="text-lg font-semibold text-text">Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-5">
              {/* Notifications Header */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-sm text-textSecondary">{notificationCount} unread notifications</Text>
                <TouchableOpacity
                  onPress={() => {
                    clearAllNotifications();
                    Alert.alert('Success', 'All notifications have been cleared');
                  }}
                  className="bg-primary px-3 py-2 rounded-lg active:scale-95"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xs font-semibold">Clear All</Text>
                </TouchableOpacity>
              </View>

              {/* Notifications List */}
              {mockNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  className={`bg-card rounded-2xl p-4 mb-3 border-l-4 ${
                    notification.type === 'task' ? 'border-primary' :
                    notification.type === 'success' ? 'border-success' :
                    notification.type === 'report' ? 'border-warning' : 'border-secondary'
                  }`}
                  activeOpacity={0.8}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-base font-semibold text-text flex-1 pr-2">
                      {notification.title}
                    </Text>
                    {notification.unread && (
                      <View className="w-2 h-2 rounded-full bg-danger" />
                    )}
                  </View>
                  <Text className="text-sm text-textSecondary mb-2 leading-5">
                    {notification.message}
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-textSecondary">{notification.time}</Text>
                    <View className={`px-2 py-1 rounded-md ${
                      notification.type === 'task' ? 'bg-primary/20' :
                      notification.type === 'success' ? 'bg-success/20' :
                      notification.type === 'report' ? 'bg-warning/20' : 'bg-secondary/20'
                    }`}>
                      <Text className={`text-xs font-semibold ${
                        notification.type === 'task' ? 'text-primary' :
                        notification.type === 'success' ? 'text-success' :
                        notification.type === 'report' ? 'text-warning' : 'text-secondary'
                      }`}>
                        {notification.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {mockNotifications.length === 0 && (
                <View className="bg-card rounded-2xl p-6 items-center">
                  <Bell size={32} color={theme.colors.textSecondary} className="mb-3" />
                  <Text className="text-base text-textSecondary text-center">No notifications</Text>
                  <Text className="text-xs text-textSecondary text-center mt-1">
                    You're all caught up!
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal 
        visible={showSettingsModal} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <Text className="text-lg font-semibold text-text">Quick Settings</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View className="p-5">
            {settingsItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={item.action}
                  className="bg-card rounded-2xl p-4 mb-3 flex-row items-center border border-border active:scale-[0.98]"
                  activeOpacity={0.8}
                >
                  <View className="bg-primary/10 rounded-lg p-2">
                    <IconComponent size={20} color={theme.colors.primary} />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-text">{item.title}</Text>
                    <Text className="text-xs text-textSecondary mt-1">{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* THEME MODAL */}
      <Modal 
        visible={showThemeModal} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <Text className="text-lg font-semibold text-text">Theme Settings</Text>
            <TouchableOpacity onPress={() => setShowThemeModal(false)}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View className="p-5">
            <Text className="text-sm text-textSecondary mb-4">Choose your preferred theme</Text>
            
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
                  onPress={() => {
                    setThemeMode(mode);
                    setShowThemeModal(false);
                    Alert.alert('Theme Changed', `Switched to ${mode} mode`);
                  }}
                  className={`flex-row items-center py-4 px-4 rounded-2xl mb-3 border-2 ${
                    themeMode === mode 
                      ? 'bg-primary/20 border-primary' 
                      : 'bg-card border-border'
                  }`}
                  activeOpacity={0.8}
                >
                  <View className={`p-2 rounded-lg ${
                    themeMode === mode ? 'bg-primary/20' : 'bg-background'
                  }`}>
                    <IconComponent 
                      size={20} 
                      color={themeMode === mode ? theme.colors.primary : theme.colors.text} 
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-text">
                      {mode === 'light' ? 'Light Mode' : mode === 'dark' ? 'Dark Mode' : 'System Default'}
                    </Text>
                    <Text className="text-xs text-textSecondary mt-1">
                      {mode === 'light' ? 'Always use light theme' : 
                       mode === 'dark' ? 'Always use dark theme' : 
                       'Follow device system settings'}
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

      {/* LANGUAGE MODAL */}
      <Modal 
        visible={showLanguageModal} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <Text className="text-lg font-semibold text-text">Language Settings</Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View className="p-5">
            <Text className="text-sm text-textSecondary mb-4">Choose your preferred language</Text>
            
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => {
                  Alert.alert('Language Changed', `App language switched to ${lang.name}`);
                  setShowLanguageModal(false);
                }}
                className={`flex-row items-center py-4 px-4 rounded-2xl mb-3 ${
                  lang.active ? 'bg-primary/20 border-2 border-primary' : 'bg-card border border-border'
                }`}
                activeOpacity={0.8}
              >
                <Text className="text-2xl mr-3">{lang.flag}</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-text">{lang.name}</Text>
                  <Text className="text-xs text-textSecondary mt-1">{lang.nativeName}</Text>
                </View>
                {lang.active && (
                  <CheckCircle2 size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}
