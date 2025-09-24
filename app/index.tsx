import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useWorkerData } from '../contexts/worker/WorkerDataContext';

export default function RootIndex() {
  const { worker } = useWorkerData();

  useEffect(() => {
    // Small delay to let context initialize
    const timer = setTimeout(() => {
      if (worker) {
        // User is logged in, redirect to tabs
        router.replace('/(tabs)');
      } else {
        // User is not logged in, redirect to login
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [worker]);

  // Show loading screen while checking authentication
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-primary text-2xl font-bold">
        Bin2Win Worker
      </Text>
      <Text className="text-textSecondary mt-2">
        Loading...
      </Text>
    </View>
  );
}
