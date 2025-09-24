import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export class LocationService {
  private static watchPositionSubscription: Location.LocationSubscription | null = null;
  private static locationCallback: ((location: LocationData) => void) | null = null;

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to track your position during tasks.',
          [
            { text: 'OK' }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Unable to get current location. Please try again.');
      return null;
    }
  }

  static async startLocationTracking(
    onLocationUpdate: (location: LocationData) => void
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      // Stop existing tracking if any
      this.stopLocationTracking();

      this.locationCallback = onLocationUpdate;

      this.watchPositionSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 50, // Update when moved 50 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          
          if (this.locationCallback) {
            this.locationCallback(locationData);
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Location Tracking Error', 'Unable to start location tracking.');
      return false;
    }
  }

  static stopLocationTracking(): void {
    if (this.watchPositionSubscription) {
      this.watchPositionSubscription.remove();
      this.watchPositionSubscription = null;
    }
    this.locationCallback = null;
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static async openMapsNavigation(
    destinationLat: number,
    destinationLng: number,
    destinationLabel?: string
  ): Promise<void> {
    try {
      const currentLocation = await this.getCurrentLocation();
      if (!currentLocation) {
        Alert.alert('Error', 'Unable to get current location for navigation.');
        return;
      }

      const url = `https://www.google.com/maps/dir/${currentLocation.latitude},${currentLocation.longitude}/${destinationLat},${destinationLng}`;
      
      // For now, we'll show the URL - in a real app, you'd use Linking.openURL
      Alert.alert(
        'Navigation',
        `Navigate to ${destinationLabel || 'destination'}?\n\nDistance: ${Math.round(
          this.calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            destinationLat,
            destinationLng
          )
        )} meters`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Maps', 
            onPress: () => {
              // In a real app: Linking.openURL(url);
              console.log('Opening navigation to:', url);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error opening maps navigation:', error);
      Alert.alert('Navigation Error', 'Unable to open navigation.');
    }
  }
}
