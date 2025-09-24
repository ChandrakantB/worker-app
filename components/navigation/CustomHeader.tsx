import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import {
  Bell, Settings, Menu, Wifi, WifiOff, Clock, Languages, Sun, Moon
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
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { notificationCount } = useNotifications();
  const { isOnline } = useOfflineSync();

  // FIXED: Proper spacing to show system time above
  const getHeaderPadding = () => {
    if (Platform.OS === 'ios') {
      // iOS: Respect safe area for notch/dynamic island
      return insets.top > 0 ? insets.top + 8 : 48;
    } else if (Platform.OS === 'android') {
      // Android: Leave space for system status bar
      return (StatusBar.currentHeight || 24) + 8;
    }
    return 8; // Web
  };

  const headerPadding = getHeaderPadding();

  const getCurrentTime = () => new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
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
          {onMenuPress && (
            <TouchableOpacity 
              onPress={onMenuPress} 
              className="mr-4 p-2 rounded-lg active:bg-border"
              activeOpacity={0.7}
            >
              <Menu size={22} color={theme.colors.text} />
            </TouchableOpacity>
          )}
          
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
            <View className="items-center p-1">
              {isOnline ? (
                <Wifi size={18} color={theme.colors.success} />
              ) : (
                <WifiOff size={18} color={theme.colors.danger} />
              )}
            </View>
          )}

          {showLanguageToggle && onLanguagePress && (
            <TouchableOpacity 
              onPress={onLanguagePress} 
              className="p-2 rounded-lg active:bg-border"
              activeOpacity={0.7}
            >
              <Languages size={16} color={theme.colors.text} />
            </TouchableOpacity>
          )}

          {showThemeToggle && onThemePress && (
            <TouchableOpacity 
              onPress={onThemePress} 
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

          {showNotifications && onNotificationPress && (
            <TouchableOpacity 
              onPress={onNotificationPress} 
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

          {showSettings && onSettingsPress && (
            <TouchableOpacity 
              onPress={onSettingsPress} 
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

        {showConnectionStatus && (
          <View 
            className={`flex-row items-center px-2 py-1 rounded-lg ${
              isOnline ? 'bg-success/20' : 'bg-danger/20'
            }`}
          >
            <View 
              className={`w-1 h-1 rounded-full mr-1 ${
                isOnline ? 'bg-success' : 'bg-danger'
              }`} 
            />
            <Text 
              className={`text-[10px] font-semibold ${
                isOnline ? 'text-success' : 'text-danger'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        )}
      </View>

      {/* Debug - Shows system status bar info */}
      {__DEV__ && (
        <View className="bg-blue-100 px-2 py-1">
          <Text className="text-xs text-blue-600 text-center">
            Header Padding: {headerPadding}px | Status Height: {StatusBar.currentHeight || 0}px | Safe Top: {insets.top}px
          </Text>
        </View>
      )}
    </View>
  );
}
