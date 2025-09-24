import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Worker, Task, TaskStatus, WorkerContextType } from '../../types';
import { OfflineService } from '../../services/offline/OfflineService';

const WORKER_STORAGE_KEY = 'worker_data';

const WorkerDataContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored worker data on app start
  useEffect(() => {
    loadStoredWorkerData();
    // Initialize offline service
    OfflineService.initialize();
  }, []);

  const loadStoredWorkerData = async () => {
    try {
      const storedWorker = await SecureStore.getItemAsync(WORKER_STORAGE_KEY);
      if (storedWorker) {
        const workerData = JSON.parse(storedWorker);
        setWorker(workerData);
        loadWorkerTasks(workerData.id);
      }
    } catch (error) {
      console.error('Error loading worker data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWorker = async (workerData: Worker) => {
    try {
      setWorker(workerData);
      await SecureStore.setItemAsync(WORKER_STORAGE_KEY, JSON.stringify(workerData));
      
      // Store worker data offline
      await OfflineService.storeOfflineData('worker', workerData);
      
      loadWorkerTasks(workerData.id);
    } catch (error) {
      console.error('Error storing worker data:', error);
    }
  };

  const logoutWorker = async () => {
    try {
      await SecureStore.deleteItemAsync(WORKER_STORAGE_KEY);
      setWorker(null);
      setAssignedTasks([]);
      setActiveTask(null);
      setCompletedTasks([]);
      
      // Clear offline data on logout
      await OfflineService.clearOfflineData();
    } catch (error) {
      console.error('Error clearing worker data:', error);
    }
  };

  const updateWorkerStatus = async (isOnDuty: boolean) => {
    if (worker) {
      const updatedWorker = { ...worker, isOnDuty };
      setWorker(updatedWorker);
      
      try {
        await SecureStore.setItemAsync(WORKER_STORAGE_KEY, JSON.stringify(updatedWorker));
        
        // Queue for offline sync
        await OfflineService.addToQueue({
          action: 'task_update',
          data: {
            workerId: worker.id,
            isOnDuty,
            timestamp: Date.now(),
          },
        });
      } catch (error) {
        console.error('Error updating worker status:', error);
      }
    }
  };

  const acceptTask = async (taskId: string) => {
    const task = assignedTasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = {
        ...task,
        status: 'accepted' as TaskStatus,
        acceptedAt: new Date().toISOString()
      };
      
      setAssignedTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      setActiveTask(updatedTask);

      // Store offline and queue for sync
      await OfflineService.storeOfflineData(`task_${taskId}`, updatedTask);
      await OfflineService.addToQueue({
        action: 'task_update',
        data: {
          taskId,
          status: 'accepted',
          acceptedAt: updatedTask.acceptedAt,
          workerId: worker?.id,
        },
      });
    }
  };

  const completeTask = async (taskId: string, completionData: any) => {
    const task = assignedTasks.find(t => t.id === taskId);
    if (task) {
      const completedTask = {
        ...task,
        status: 'completed' as TaskStatus,
        completedAt: new Date().toISOString(),
        completionPhotos: completionData.photos || [],
        completionNotes: completionData.notes || ''
      };
      
      setAssignedTasks(prev => prev.filter(t => t.id !== taskId));
      setCompletedTasks(prev => [...prev, completedTask]);
      setActiveTask(null);

      // Store completed task offline
      await OfflineService.storeOfflineData(`completed_task_${taskId}`, completedTask);
      
      // Queue task completion for sync
      await OfflineService.addToQueue({
        action: 'task_completion',
        data: {
          taskId,
          completionData: {
            notes: completionData.notes,
            photos: completionData.photos,
            completedAt: completedTask.completedAt,
          },
          workerId: worker?.id,
        },
      });

      // Queue photo uploads separately
      if (completionData.photos && completionData.photos.length > 0) {
        for (const photo of completionData.photos) {
          await OfflineService.storeOfflinePhoto(taskId, photo);
          await OfflineService.addToQueue({
            action: 'photo_upload',
            data: {
              taskId,
              photoUri: photo,
              uploadedAt: Date.now(),
            },
          });
        }
      }
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const updatedTasks = assignedTasks.map(t => 
      t.id === taskId ? { ...t, status } : t
    );
    setAssignedTasks(updatedTasks);
    
    if (status === 'in_progress') {
      const task = assignedTasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = { ...task, status, startedAt: new Date().toISOString() };
        setActiveTask(updatedTask);
        
        // Store offline and queue for sync
        await OfflineService.storeOfflineData(`task_${taskId}`, updatedTask);
        await OfflineService.addToQueue({
          action: 'task_update',
          data: {
            taskId,
            status: 'in_progress',
            startedAt: updatedTask.startedAt,
            workerId: worker?.id,
          },
        });
      }
    }
  };

  const updateLocation = async (location: { lat: number; lng: number }) => {
    if (worker) {
      const updatedWorker = { ...worker, currentLocation: location };
      setWorker(updatedWorker);
      
      try {
        await SecureStore.setItemAsync(WORKER_STORAGE_KEY, JSON.stringify(updatedWorker));
        
        // Queue location update for sync (throttled to avoid too many updates)
        await OfflineService.addToQueue({
          action: 'location_update',
          data: {
            workerId: worker.id,
            location,
            timestamp: Date.now(),
          },
        });
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
  };

  const loadWorkerTasks = async (workerId: string) => {
    // Try to load from offline storage first
    const offlineTasks = await OfflineService.getOfflineData('tasks');
    
    if (offlineTasks && offlineTasks.data) {
      console.log('📱 Loading tasks from offline storage');
      setAssignedTasks(offlineTasks.data);
    } else {
      // Load mock data if no offline data
      const mockTasks: Task[] = [
        {
          id: '1',
          type: 'collection',
          priority: 'high',
          assignedTo: workerId,
          assignedBy: 'admin1',
          location: {
            address: 'Sector 4, Jabalpur',
            coordinates: { lat: 23.1815, lng: 79.9864 },
            landmark: 'Near Bus Stand'
          },
          wasteType: 'Organic',
          estimatedQuantity: '50kg',
          specialInstructions: 'Handle with care',
          assignedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          referencePhotos: [],
          completionPhotos: [],
          status: 'assigned'
        },
        {
          id: '2',
          type: 'segregation',
          priority: 'medium',
          assignedTo: workerId,
          assignedBy: 'admin1',
          location: {
            address: 'Waste Processing Plant',
            coordinates: { lat: 23.1751, lng: 79.9851 },
            landmark: 'Main Gate'
          },
          wasteType: 'Mixed',
          estimatedQuantity: '100kg',
          specialInstructions: 'Separate into 3 categories',
          assignedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          referencePhotos: [],
          completionPhotos: [],
          status: 'assigned'
        }
      ];
      
      setAssignedTasks(mockTasks);
      
      // Store tasks offline for future use
      await OfflineService.storeOfflineData('tasks', mockTasks);
    }
  };

  const contextValue: WorkerContextType = {
    worker,
    assignedTasks,
    activeTask,
    completedTasks,
    loginWorker,
    logoutWorker,
    updateWorkerStatus,
    acceptTask,
    completeTask,
    updateTaskStatus,
    updateLocation
  };

  // Don't render children until we've checked for stored data
  if (isLoading) {
    return null;
  }

  return (
    <WorkerDataContext.Provider value={contextValue}>
      {children}
    </WorkerDataContext.Provider>
  );
};

export const useWorkerData = () => {
  const context = useContext(WorkerDataContext);
  if (context === undefined) {
    throw new Error('useWorkerData must be used within a WorkerDataProvider');
  }
  return context;
};
