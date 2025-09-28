import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Platform, PermissionsAndroid } from 'react-native';
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

  // State for selected route type, map markers, and route data
  const [selectedRoute, setSelectedRoute] = useState<'optimized' | 'shortest'>('optimized');
  const [mapTasks, setMapTasks] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Calculate safe bottom padding to accommodate tab and navigation bars
  const tabBarHeight = 80;
  const safeBottomPadding = Math.max(insets.bottom + 65, tabBarHeight);

  useEffect(() => {
    prepareMapData();
  }, [assignedTasks, currentLocation]);

  // Prepare map markers and route data for display
  const prepareMapData = () => {
    // Map tasks to markers with coordinates and info for map rendering
    const taskMarkers = assignedTasks.map((task) => ({
      lat: task.location.coordinates.lat,
      lng: task.location.coordinates.lng,
      title: `${task.type} Task`,
      description: `${task.priority === 'urgent' ? '🚨 URGENT - ' : ''}${task.wasteType} - ${task.estimatedQuantity}`,
      type: 'task' as const,
      taskId: task.id
    }));
    setMapTasks(taskMarkers);

    // Define example optimized and shortest routes with starting point at current user location
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

  // Example hardcoded route timeline for today's tasks
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
    } else {
      Alert.alert('Error', 'Unable to refresh location.');
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

  // Define worker's current location marker for map
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (safeBottomPadding + 20) * 2 }}
      >
        <View style={{ padding: 20 }}>
          {/* Current Status */}
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={20} color={theme.colors.text} />
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, marginLeft: 8 }}>
                  Current Status
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleRefreshLocation}
                style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.8}
              >
                <RefreshCw size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8, fontSize: 14 }}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {currentLocation ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MapPin size={16} color={theme.colors.textSecondary} />
                  <Text style={{ color: theme.colors.text, marginLeft: 8, fontSize: 14 }}>
                    Lat: {currentLocation.latitude.toFixed(6)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MapPin size={16} color={theme.colors.textSecondary} />
                  <Text style={{ color: theme.colors.text, marginLeft: 8, fontSize: 14 }}>
                    Lng: {currentLocation.longitude.toFixed(6)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Target size={16} color={theme.colors.textSecondary} />
                  <Text style={{ color: theme.colors.textSecondary, marginLeft: 8, fontSize: 12 }}>
                    Accuracy: ±{currentLocation.accuracy?.toFixed(0) || 'Unknown'}m
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock size={16} color={theme.colors.textSecondary} />
                  <Text style={{ color: theme.colors.textSecondary, marginLeft: 8, fontSize: 12 }}>
                    Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 20 }}>
                <Navigation size={20} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary, marginLeft: 12, fontSize: 14 }}>
                  {locationError || 'Location not available'}
                </Text>
              </View>
            )}

            {/* Duty Status Badge */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
              padding: 12,
              borderRadius: 24,
              backgroundColor: worker?.isOnDuty ? theme.colors.success + '20' : theme.colors.textSecondary + '20'
            }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                marginRight: 12,
                backgroundColor: worker?.isOnDuty ? theme.colors.success : theme.colors.textSecondary
              }} />
              <Text style={{
                fontWeight: '600',
                fontSize: 14,
                color: worker?.isOnDuty ? theme.colors.success : theme.colors.textSecondary
              }}>
                {worker?.isOnDuty ? 'On Duty - Tracking Active' : 'Off Duty - Limited Tracking'}
              </Text>
            </View>
          </View>

          {/* Map Section */}
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Route size={20} color={theme.colors.text} />
              <Text style={{ fontWeight: '700', fontSize: 18, color: theme.colors.text, marginLeft: 10 }}>
                Live Map - Jabalpur
              </Text>
            </View>

            <View style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16 }}>
              <InteractiveMap
                currentLocation={workerLocation}
                tasks={mapTasks}
                routes={routes}
                onTaskSelect={handleTaskSelect}
                height={250}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setSelectedRoute('optimized')}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selectedRoute === 'optimized' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selectedRoute === 'optimized' ? theme.colors.primary : theme.colors.background,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                activeOpacity={0.8}
              >
                <Target size={16} color={selectedRoute === 'optimized' ? 'white' : theme.colors.text} />
                <Text style={{
                  fontWeight: '600',
                  color: selectedRoute === 'optimized' ? 'white' : theme.colors.text,
                  fontSize: 14,
                  marginLeft: 8
                }}>
                  Optimized Route
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedRoute('shortest')}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selectedRoute === 'shortest' ? theme.colors.secondary : theme.colors.border,
                  backgroundColor: selectedRoute === 'shortest' ? theme.colors.secondary : theme.colors.background,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                activeOpacity={0.8}
              >
                <Zap size={16} color={selectedRoute === 'shortest' ? 'white' : theme.colors.text} />
                <Text style={{
                  fontWeight: '600',
                  color: selectedRoute === 'shortest' ? 'white' : theme.colors.text,
                  fontSize: 14,
                  marginLeft: 8
                }}>
                  Shortest Route
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Route Timeline */}
          <View style={{ marginBottom: 20 }}>
            <RouteInfo
              routes={todaysRoute}
              onStopPress={handleRouteStopPress}
            />
          </View>

          {/* Today's Statistics */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 6,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <BarChart3 size={20} color={theme.colors.text} />
              <Text style={{ fontWeight: '700', fontSize: 18, color: theme.colors.text, marginLeft: 10 }}>
                Today's Statistics
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{alignItems: 'center', flex: 1}}>
                <CheckCircle2 size={24} color={theme.colors.success} style={{ marginBottom: 6 }} />
                <Text style={{ fontWeight: '700', fontSize: 22, color: theme.colors.success, marginBottom: 6 }}>2</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>Completed</Text>
              </View>

              <View style={{alignItems: 'center', flex: 1}}>
                <Play size={24} color={theme.colors.primary} style={{ marginBottom: 6 }} />
                <Text style={{ fontWeight: '700', fontSize: 22, color: theme.colors.primary, marginBottom: 6 }}>1</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>In Progress</Text>
              </View>

              <View style={{alignItems: 'center', flex: 1}}>
                <AlertTriangle size={24} color={theme.colors.warning} style={{ marginBottom: 6 }} />
                <Text style={{ fontWeight: '700', fontSize: 22, color: theme.colors.warning, marginBottom: 6 }}>3</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>Upcoming</Text>
              </View>

              <View style={{alignItems: 'center', flex: 1}}>
                <Route size={24} color={theme.colors.textSecondary} style={{ marginBottom: 6 }} />
                <Text style={{ fontWeight: '700', fontSize: 22, color: theme.colors.textSecondary, marginBottom: 6 }}>12.5km</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>Distance</Text>
              </View>
            </View>

            {/* Route Progress Bar */}
            <View style={{ marginTop: 16 }}>
              <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:4}}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Route Progress</Text>
                <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 12 }}>33% Complete</Text>
              </View>
              <View style={{ backgroundColor: theme.colors.background, height: 8, borderRadius: 20 }}>
                <View style={{ backgroundColor: theme.colors.primary, height: 8, width: '33%', borderRadius: 20 }} />
              </View>
            </View>
          </View>

          {/* Debug info for safe padding and tab bar height */}
          
        </View>
      </ScrollView>
    </View>
  );
}
