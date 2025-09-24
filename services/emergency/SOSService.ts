import { Alert } from 'react-native';
import * as Location from 'expo-location';

export interface EmergencyData {
  workerId: string;
  workerName: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
  };
  timestamp: number;
  emergencyType: 'general' | 'medical' | 'safety' | 'equipment';
  description?: string;
  deviceInfo: {
    platform: string;
    battery?: number;
  };
}

export class SOSService {
  static async sendEmergencyAlert(workerId: string, workerName: string, type: 'general' | 'medical' | 'safety' | 'equipment' = 'general'): Promise<boolean> {
    try {
      console.log('🚨 Sending SOS alert...');

      // Get current location
      const location = await this.getCurrentLocation();
      
      const emergencyData: EmergencyData = {
        workerId,
        workerName,
        location: location || {
          latitude: 23.1815,
          longitude: 79.9864,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        emergencyType: type,
        deviceInfo: {
          platform: 'mobile'
        }
      };

      // In real app, send to emergency services API
      await this.simulateEmergencyCall(emergencyData);
      return true;
    } catch (error) {
      console.error('SOS Service error:', error);
      return false;
    }
  }

  private static async getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy?: number; timestamp: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted for emergency');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      };
    } catch (error) {
      console.error('Emergency location error:', error);
      return null;
    }
  }

  private static async simulateEmergencyCall(data: EmergencyData): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🚨 Emergency Alert Sent:', {
      worker: data.workerName,
      location: `${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`,
      time: new Date(data.timestamp).toLocaleString(),
      type: data.emergencyType
    });

    // In real implementation:
    // - Send to emergency services API
    // - Alert all supervisors via push notification
    // - Log in emergency database
    // - Trigger automatic response protocols
  }

  static getEmergencyContacts() {
    return {
      supervisor: '+91-9876543210',
      emergency: '108', // Indian emergency number
      police: '100',
      fire: '101',
      medical: '102'
    };
  }
}
