import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { LocationService } from '../../services/location/LocationService';
import InteractiveMap from '../../components/ui/InteractiveMap';
import RouteInfo from '../../components/ui/RouteInfo';

export default function MapScreen() {
  const { worker, assignedTasks, activeTask } = useWorkerData();
  const { theme } = useTheme();
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
        { lat: currentLocation.latitude, lng: currentLocation.longitude }, // Start at worker location
        { lat: 23.1825, lng: 79.9870 }, // Collection Point A
        { lat: 23.1795, lng: 79.9880 }, // Collection Point B  
        { lat: 23.1835, lng: 79.9845 }, // Residential Zone
        { lat: 23.1751, lng: 79.9851 }, // Waste Processing Plant
        ...taskMarkers // Include all task locations
      ];

      const alternateRoute = [
        { lat: currentLocation.latitude, lng: currentLocation.longitude }, // Start at worker location
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
      Alert.alert('Location Updated', `New coordinates: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
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
        [
          { text: 'OK' }
        ]
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: theme.colors.primary,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        paddingHorizontal: 20
      }}>
        <Text style={{
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 5
        }}>
          🗺️ Route & Navigation
        </Text>
        <Text style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: 16
        }}>
          {isTracking ? '📍 Location tracking active' : '📍 Location tracking off'}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Current Status Card */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
                📍 Current Status
              </Text>
              <TouchableOpacity 
                onPress={handleRefreshLocation}
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8
                }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>📡 Refresh</Text>
              </TouchableOpacity>
            </View>

            {currentLocation ? (
              <>
                <Text style={{ color: theme.colors.text, marginBottom: 4 }}>
                  📍 Lat: {currentLocation.latitude.toFixed(6)}
                </Text>
                <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
                  📍 Lng: {currentLocation.longitude.toFixed(6)}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Accuracy: ±{currentLocation.accuracy?.toFixed(0) || 'Unknown'}m
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </Text>
              </>
            ) : (
              <Text style={{ color: theme.colors.textSecondary }}>
                {locationError || 'Location not available'}
              </Text>
            )}

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12,
              padding: 8,
              backgroundColor: worker?.isOnDuty ? theme.colors.success + '20' : theme.colors.textSecondary + '20',
              borderRadius: 8
            }}>
              <Text style={{
                color: worker?.isOnDuty ? theme.colors.success : theme.colors.textSecondary,
                fontWeight: '600'
              }}>
                {worker?.isOnDuty ? '🟢 On Duty - Tracking Active' : '🔴 Off Duty - Limited Tracking'}
              </Text>
            </View>
          </View>

          {/* Interactive Map */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 16
            }}>
              🗺️ Live Map - Jabalpur
            </Text>

            <InteractiveMap
              currentLocation={workerLocation}
              tasks={mapTasks}
              routes={routes}
              onTaskSelect={handleTaskSelect}
              height={250}
            />

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 12,
              gap: 8
            }}>
              <TouchableOpacity
                onPress={() => setSelectedRoute('optimized')}
                style={{
                  flex: 1,
                  backgroundColor: selectedRoute === 'optimized' ? theme.colors.primary : theme.colors.background,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.border
                }}
              >
                <Text style={{
                  color: selectedRoute === 'optimized' ? 'white' : theme.colors.text,
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: '600'
                }}>
                  🎯 Optimized Route
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setSelectedRoute('shortest')}
                style={{
                  flex: 1,
                  backgroundColor: selectedRoute === 'shortest' ? theme.colors.secondary : theme.colors.background,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.border
                }}
              >
                <Text style={{
                  color: selectedRoute === 'shortest' ? 'white' : theme.colors.text,
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: '600'
                }}>
                  ⚡ Shortest Route
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Route Timeline */}
          <RouteInfo 
            routes={todaysRoute}
            onStopPress={handleRouteStopPress}
          />

          {/* Map Statistics */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 16
            }}>
              📊 Today's Stats
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.success }}>2</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Completed</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.primary }}>1</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>In Progress</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.warning }}>3</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Upcoming</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.textSecondary }}>12.5km</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Distance</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
