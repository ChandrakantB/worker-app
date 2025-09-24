import { useEffect, useState } from 'react';
import { LocationService, LocationData } from '../services/location/LocationService';
import { useWorkerData } from '../contexts/worker/WorkerDataContext';

export const useLocationTracking = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { worker, updateLocation } = useWorkerData();

  useEffect(() => {
    // Start tracking when worker is on duty
    if (worker?.isOnDuty && !isTracking) {
      startTracking();
    }
    
    // Stop tracking when worker goes off duty
    if (!worker?.isOnDuty && isTracking) {
      stopTracking();
    }

    // Cleanup on unmount
    return () => {
      if (isTracking) {
        LocationService.stopLocationTracking();
      }
    };
  }, [worker?.isOnDuty]);

  const startTracking = async () => {
    try {
      setLocationError(null);
      setIsTracking(true);

      const success = await LocationService.startLocationTracking((location) => {
        setCurrentLocation(location);
        updateLocation({ lat: location.latitude, lng: location.longitude });
      });

      if (!success) {
        setIsTracking(false);
        setLocationError('Failed to start location tracking');
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setIsTracking(false);
      setLocationError('Location tracking error');
    }
  };

  const stopTracking = () => {
    LocationService.stopLocationTracking();
    setIsTracking(false);
    setCurrentLocation(null);
  };

  const getCurrentLocation = async () => {
    try {
      setLocationError(null);
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        updateLocation({ lat: location.latitude, lng: location.longitude });
        return location;
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setLocationError('Failed to get location');
    }
    return null;
  };

  const navigateToTask = async (taskLat: number, taskLng: number, taskAddress?: string) => {
    await LocationService.openMapsNavigation(taskLat, taskLng, taskAddress);
  };

  return {
    currentLocation,
    isTracking,
    locationError,
    startTracking,
    stopTracking,
    getCurrentLocation,
    navigateToTask,
  };
};
