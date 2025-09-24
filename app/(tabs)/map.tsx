import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { useTheme } from '../../contexts/theme/ThemeContext';
import CustomHeader from '../../components/navigation/CustomHeader';
import InteractiveMap from '../../components/ui/InteractiveMap';
import RouteInfo from '../../components/ui/RouteInfo';
import {
  MapPin,
  Navigation,
  RefreshCw,
  Target,
  Route,
  Clock,
  BarChart3,
  CheckCircle2,
  Play,
  AlertTriangle,
  Zap
} from 'lucide-react-native';

export default function MapScreen() {
  const { worker, assignedTasks, activeTask } = useWorkerData();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { 
    currentLocation, 
    isTracking, 
    locationError, 
    getCurrentLocation, 
    navigateToTask 
  } = useLocationTracking();

  const [selectedRoute, setSelectedRoute] = useState<'optimized' | 'shortest'>('optimized');
  const [mapTasks, setMapTasks] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Calculate safe bottom padding for tab bar
  const tabBarHeight = 80;
  const safeBottomPadding = Math.max(insets.bottom + 65, tabBarHeight);

  useEffect(() => {
    setupMapData();
  }, [assignedTasks, currentLocation]);

  const setupMapData = () => {
    // Convert tasks to map markers
    const taskMarkers = assignedTasks.map((task, index) => ({
      lat: task.location.coordinates.lat,
      lng: task.location.coordinates.lng,
      title: `${task.type} Task`,
      description: `${task.priority === 'urgent' ? '🚨 URGENT - ' : ''}${task.wasteType} - ${task.estimatedQuantity}`,
      type: 'task' as const,
      taskId: task.id
    }));

    setMapTasks(taskMarkers);

    // Create optimized route through Jabalpur
    if (currentLocation && taskMarkers.length > 0) {
      const optimizedRoute = [
        { lat: currentLocation.latitude, lng: currentLocation.longitude },
        { lat: 23.1825, lng: 79.9870 }, // Collection Point A
        { lat: 23.1795, lng: 79.9880 }, // Collection Point B  
        { lat: 23.1835, lng: 79.9845 }, // Residential Zone
        { lat: 23.1751, lng: 79.9851 }, // Waste Processing Plant
        ...taskMarkers
      ];

      const alternateRoute = [
        { lat: currentLocation.latitude, lng: currentLocation.longitude },
        { lat: 23.1815, lng: 79.9864 }, // City Center
        { lat: 23.1795, lng: 79.9880 }, // Collection Point B
        { lat: 23.1825, lng: 79.9870 }, // Collection Point A
        { lat: 23.1751, lng: 79.9851 }, // Waste Processing Plant
      ];

      setRoutes([optimizedRoute, alternateRoute]);
    }
  };

  const todaysRoute = [
    {
      id: '1',
      address: 'Sector 4, Near Bus Stand',
      time: '09:00 AM',
      status: 'completed' as const,
      taskType: 'Organic Waste Collection',
      estimatedDuration: '30 min'
    },
    {
      id: '2', 
      address: 'Residential Zone, Block A',
      time: '10:00 AM',
      status: 'current' as const,
      taskType: 'Mixed Waste Collection',
      estimatedDuration: '45 min'
    },
    {
      id: '3',
      address: 'Commercial Area, Mall Road',
      time: '11:15 AM',
      status: 'upcoming' as const,
      taskType: 'Recyclable Waste',
      estimatedDuration: '20 min'
    },
    {
      id: '4',
      address: 'Waste Processing Plant',
      time: '12:00 PM',
      status: 'upcoming' as const,
      taskType: 'Segregation & Processing',
      estimatedDuration: '60 min'
    },
    {
      id: '5',
      address: 'Industrial Zone, Sector 7',
      time: '02:00 PM', 
      status: 'upcoming' as const,
      taskType: 'Hazardous Waste Pickup',
      estimatedDuration: '40 min'
    }
  ];

  const handleRefreshLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      Alert.alert(
        'Location Updated', 
        `New coordinates: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      );
    }
  };

  const handleTaskSelect = (taskIndex: string) => {
    const task = assignedTasks[parseInt(taskIndex)];
    if (task) {
      Alert.alert(
        '📋 Task Details',
        `${task.type} - ${task.location.address}\n\nWaste Type: ${task.wasteType}\nQuantity: ${task.estimatedQuantity}\nPriority: ${task.priority.toUpperCase()}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Navigate',
            onPress: () => navigateToTask(
              task.location.coordinates.lat,
              task.location.coordinates.lng,
              task.location.address
            )
          }
        ]
      );
    }
  };

  const handleRouteStopPress = (stopId: string) => {
    const stop = todaysRoute.find(s => s.id === stopId);
    if (stop) {
      Alert.alert(
        '📍 Route Stop',
        `${stop.address}\n\nTime: ${stop.time}\nTask: ${stop.taskType}\nDuration: ${stop.estimatedDuration}`,
        [{ text: 'OK' }]
      );
    }
  };

  const workerLocation = currentLocation ? {
    lat: currentLocation.latitude,
    lng: currentLocation.longitude,
    title: 'Your Location',
    type: 'worker' as const
  } : {
    lat: 23.1815,
    lng: 79.9864,
    title: 'Default Location',
    type: 'worker' as const
  };

  const handleMenuPress = () => console.log('Map menu pressed');
  const handleSettingsPress = () => console.log('Map settings pressed');

  return (
    <View className="flex-1 bg-background">
      <CustomHeader
        title="Route & Navigation"
        subtitle={isTracking ? 'Location tracking active' : 'Location tracking off'}
        showNotifications={false}
        showSettings={true}
        showConnectionStatus={true}
        onMenuPress={handleMenuPress}
        onSettingsPress={handleSettingsPress}
      />

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (safeBottomPadding + 20) * 2 }}
      >
        <View className="p-5">
          {/* Current Status Card */}
          <View className="bg-card rounded-2xl p-4 mb-5 shadow-sm border border-border">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <MapPin size={20} color={theme.colors.text} />
                <Text className="text-lg font-bold text-text ml-2">
                  Current Status
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleRefreshLocation}
                className="bg-primary px-3 py-2 rounded-lg flex-row items-center active:scale-95"
                activeOpacity={0.8}
              >
                <RefreshCw size={14} color="white" />
                <Text className="text-white text-xs font-semibold ml-1">Refresh</Text>
              </TouchableOpacity>
            </View>

            {currentLocation ? (
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <MapPin size={14} color={theme.colors.textSecondary} />
                  <Text className="text-text ml-2 text-sm">
                    Lat: {currentLocation.latitude.toFixed(6)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={14} color={theme.colors.textSecondary} />
                  <Text className="text-text ml-2 text-sm">
                    Lng: {currentLocation.longitude.toFixed(6)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Target size={14} color={theme.colors.textSecondary} />
                  <Text className="text-textSecondary text-xs ml-2">
                    Accuracy: ±{currentLocation.accuracy?.toFixed(0) || 'Unknown'}m
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={14} color={theme.colors.textSecondary} />
                  <Text className="text-textSecondary text-xs ml-2">
                    Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center py-4">
                <Navigation size={20} color={theme.colors.textSecondary} />
                <Text className="text-textSecondary ml-3">
                  {locationError || 'Location not available'}
                </Text>
              </View>
            )}

            {/* Duty Status Badge */}
            <View className={`flex-row items-center mt-3 p-3 rounded-lg ${
              worker?.isOnDuty ? 'bg-success/20' : 'bg-textSecondary/20'
            }`}>
              <View className={`w-2 h-2 rounded-full mr-3 ${
                worker?.isOnDuty ? 'bg-success' : 'bg-textSecondary'
              }`} />
              <Text className={`font-semibold text-sm ${
                worker?.isOnDuty ? 'text-success' : 'text-textSecondary'
              }`}>
                {worker?.isOnDuty ? 'On Duty - Tracking Active' : 'Off Duty - Limited Tracking'}
              </Text>
            </View>
          </View>

          {/* Interactive Map Section */}
          <View className="bg-card rounded-2xl p-4 mb-5 shadow-sm border border-border">
            <View className="flex-row items-center mb-4">
              <Route size={20} color={theme.colors.text} />
              <Text className="text-lg font-bold text-text ml-2">
                Live Map - Jabalpur
              </Text>
            </View>

            {/* Map Container */}
            <View className="rounded-xl overflow-hidden mb-3">
              <InteractiveMap
                currentLocation={workerLocation}
                tasks={mapTasks}
                routes={routes}
                onTaskSelect={handleTaskSelect}
                height={250}
              />
            </View>

            {/* Route Selection Buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setSelectedRoute('optimized')}
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  selectedRoute === 'optimized' 
                    ? 'bg-primary border-primary' 
                    : 'bg-background border-border'
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Target size={14} color={selectedRoute === 'optimized' ? 'white' : theme.colors.text} />
                  <Text className={`text-xs font-semibold ml-2 ${
                    selectedRoute === 'optimized' ? 'text-white' : 'text-text'
                  }`}>
                    Optimized Route
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setSelectedRoute('shortest')}
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  selectedRoute === 'shortest' 
                    ? 'bg-secondary border-secondary' 
                    : 'bg-background border-border'
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Zap size={14} color={selectedRoute === 'shortest' ? 'white' : theme.colors.text} />
                  <Text className={`text-xs font-semibold ml-2 ${
                    selectedRoute === 'shortest' ? 'text-white' : 'text-text'
                  }`}>
                    Shortest Route
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Route Timeline */}
          <View className="mb-5">
            <RouteInfo 
              routes={todaysRoute}
              onStopPress={handleRouteStopPress}
            />
          </View>

          {/* Today's Statistics */}
          <View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <View className="flex-row items-center mb-4">
              <BarChart3 size={20} color={theme.colors.text} />
              <Text className="text-lg font-bold text-text ml-2">
                Today's Statistics
              </Text>
            </View>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <CheckCircle2 size={20} color={theme.colors.success} className="mb-1" />
                <Text className="text-xl font-bold text-success mb-1">2</Text>
                <Text className="text-xs text-textSecondary text-center">Completed</Text>
              </View>
              
              <View className="items-center flex-1">
                <Play size={20} color={theme.colors.primary} className="mb-1" />
                <Text className="text-xl font-bold text-primary mb-1">1</Text>
                <Text className="text-xs text-textSecondary text-center">In Progress</Text>
              </View>
              
              <View className="items-center flex-1">
                <AlertTriangle size={20} color={theme.colors.warning} className="mb-1" />
                <Text className="text-xl font-bold text-warning mb-1">3</Text>
                <Text className="text-xs text-textSecondary text-center">Upcoming</Text>
              </View>
              
              <View className="items-center flex-1">
                <Route size={20} color={theme.colors.textSecondary} className="mb-1" />
                <Text className="text-xl font-bold text-textSecondary mb-1">12.5km</Text>
                <Text className="text-xs text-textSecondary text-center">Distance</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mt-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs text-textSecondary">Route Progress</Text>
                <Text className="text-xs font-semibold text-text">33% Complete</Text>
              </View>
              <View className="bg-background rounded-full h-2">
                <View className="bg-primary rounded-full h-2 w-1/3" />
              </View>
            </View>
          </View>

          {/* Debug Info - Remove in production */}
          <View className="mt-4 p-3 bg-textSecondary/10 rounded-lg">
            <Text className="text-xs text-textSecondary text-center">
              Safe Padding: {safeBottomPadding}px • Tab Height: {tabBarHeight}px
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
