import { useEffect } from 'react';
import { router } from 'expo-router';
import { useWorkerData } from '../contexts/worker/WorkerDataContext';

export const useAuthRedirect = () => {
  const { worker } = useWorkerData();

  useEffect(() => {
    if (worker) {
      // User is logged in, redirect to tabs
      router.replace('/(tabs)');
    } else {
      // User is not logged in, redirect to login
      router.replace('/login');
    }
  }, [worker]);

  return { worker };
};
