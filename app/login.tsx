import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useWorkerData } from '../contexts/worker/WorkerDataContext';
import { Worker } from '../types';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWorker } = useWorkerData();

  const handleLogin = async () => {
    if (!employeeId || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Mock authentication - replace with actual API call
      const mockWorker: Worker = {
        id: 'worker-001',
        name: 'John Doe',
        email: 'john.doe@bin2win.com',
        phone: '+91 9876543210',
        employeeId: employeeId,
        department: 'driver',
        assignedArea: 'Sector 4, Jabalpur',
        isOnDuty: false,
        currentLocation: {
          lat: 23.1815,
          lng: 79.9864
        },
        vehicle: {
          id: 'vehicle-001',
          type: 'Truck',
          capacity: 1000
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await loginWorker(mockWorker);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background justify-center p-6">
      <View className="items-center mb-8">
        <Text className="text-primary text-3xl font-bold">
          Bin2Win
        </Text>
        <Text className="text-textSecondary text-lg mt-2">
          Worker Portal
        </Text>
      </View>

      <View className="bg-card rounded-lg p-6 border border-border">
        <Text className="text-text text-xl font-semibold mb-4">
          Login to Continue
        </Text>

        <View className="mb-4">
          <Text className="text-textSecondary mb-2">Employee ID</Text>
          <TextInput
            className="bg-background border border-border rounded-lg px-4 py-3 text-text"
            placeholder="Enter your Employee ID"
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <Text className="text-textSecondary mb-2">Password</Text>
          <TextInput
            className="bg-background border border-border rounded-lg px-4 py-3 text-text"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className={`bg-primary rounded-lg py-4 ${isLoading ? 'opacity-50' : ''}`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
