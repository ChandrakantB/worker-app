import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/theme/ThemeContext';
import {
  LayoutDashboard, ClipboardList, Map, AlertTriangle, User
} from 'lucide-react-native';

interface TabIconProps {
  name: string;
  color: string;
  focused: boolean;
}

function TabIcon({ name, color, focused }: TabIconProps) {
  const iconSize = focused ? 24 : 20;
  const iconProps = { 
    size: iconSize, 
    color, 
    strokeWidth: focused ? 2.5 : 2 
  };

  const icons = {
    index: LayoutDashboard,
    tasks: ClipboardList,
    map: Map,
    reports: AlertTriangle,
    profile: User,
  };

  const IconComponent = icons[name as keyof typeof icons] || LayoutDashboard;
  return <IconComponent {...iconProps} />;
}

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // ULTIMATE Android fix - calculate based on screen size
  const getTabBarConfig = () => {
    if (Platform.OS === 'android') {
      // Android: Extra high values to ensure visibility
      return {
        height: 85,
        paddingBottom: 28,
        paddingTop: 12,
        elevation: 100, // Maximum possible elevation
        contentPadding: 100,
        position: 'absolute' as const,
        bottom: 0,
        // Force above everything
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.8,
        shadowRadius: 16,
      };
    } else if (Platform.OS === 'ios') {
      // iOS: Proper safe area handling
      const safeBottom = Math.max(insets.bottom, 0);
      return {
        height: 65 + safeBottom,
        paddingBottom: safeBottom + 16,
        paddingTop: 8,
        elevation: 0,
        contentPadding: 75 + safeBottom,
        position: 'absolute' as const,
        bottom: 0,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      };
    }
    // Web fallback
    return {
      height: 70,
      paddingBottom: 16,
      paddingTop: 8,
      elevation: 0,
      contentPadding: 80,
      position: 'absolute' as const,
      bottom: 0,
    };
  };

  const tabConfig = getTabBarConfig();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: tabConfig.paddingTop,
          paddingBottom: tabConfig.paddingBottom,
          paddingHorizontal: 4,
          height: tabConfig.height,
          position: tabConfig.position,
          bottom: tabConfig.bottom,
          left: 0,
          right: 0,
          elevation: tabConfig.elevation,
          zIndex: 999999, // Maximum z-index
          shadowColor: tabConfig.shadowColor,
          shadowOffset: tabConfig.shadowOffset,
          shadowOpacity: tabConfig.shadowOpacity,
          shadowRadius: tabConfig.shadowRadius,
          // Android-specific overrides
          ...(Platform.OS === 'android' && {
            borderTopWidth: 2,
            borderTopColor: theme.colors.primary,
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          paddingHorizontal: 1,
          borderRadius: 8,
          marginHorizontal: 1,
          minHeight: 50,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'android' ? 9 : 10,
          fontWeight: '700',
          marginTop: 1,
          letterSpacing: 0.1,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarHideOnKeyboard: Platform.OS === 'android',
        sceneContainerStyle: {
          paddingBottom: tabConfig.contentPadding,
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="index" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="tasks" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="map" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="reports" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
