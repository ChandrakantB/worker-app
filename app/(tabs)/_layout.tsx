import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, View } from 'react-native';

// Simple icon component since we don't have IconSymbol
const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
  const getIconText = (iconName: string) => {
    switch (iconName) {
      case 'house.fill': return '🏠';
      case 'list.clipboard.fill': return '📋';
      case 'map.fill': return '🗺️';
      case 'person.crop.circle.fill': return '👤';
      default: return '📱';
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, color: focused ? color : '#666' }}>
        {getIconText(name)}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6', // Primary blue color
        tabBarInactiveTintColor: '#6b7280', // Gray color
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: Platform.select({
            ios: 85,
            default: 65,
          }),
          paddingBottom: Platform.select({
            ios: 20,
            default: 10,
          }),
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="list.clipboard.fill" color={color} focused={focused} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="map.fill" color={color} focused={focused} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person.crop.circle.fill" color={color} focused={focused} />
          ),
        }}
      />
      
    </Tabs>
  );
}
