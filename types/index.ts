export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: 'driver' | 'segregator' | 'supervisor';
  assignedArea: string;
  isOnDuty: boolean;
  currentLocation: {
    lat: number;
    lng: number;
  };
  vehicle?: {
    id: string;
    type: string;
    capacity: number;
  };
}

export interface Task {
  id: string;
  type: 'collection' | 'segregation' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedBy: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    landmark: string;
  };
  wasteType: string;
  estimatedQuantity: string;
  specialInstructions: string;
  assignedAt: string;
  dueDate: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  referencePhotos: string[];
  completionPhotos: string[];
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'verified';
  completionNotes?: string;
}

export type TaskStatus = 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'verified';
export type WorkerDepartment = 'driver' | 'segregator' | 'supervisor';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkerContextType {
  worker: Worker | null;
  assignedTasks: Task[];
  activeTask: Task | null;
  completedTasks: Task[];
  loginWorker: (worker: Worker) => void;
  logoutWorker: () => void;
  updateWorkerStatus: (isOnDuty: boolean) => void;
  acceptTask: (taskId: string) => void;
  completeTask: (taskId: string, completionData: any) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateLocation: (location: { lat: number; lng: number }) => void;
}
