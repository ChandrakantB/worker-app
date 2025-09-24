import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  Image
} from 'react-native';
import { Task } from '../../types';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import PhotoPicker from '../ui/PhotoPicker';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}

export default function TaskDetailModal({ visible, task, onClose }: TaskDetailModalProps) {
  const { acceptTask, updateTaskStatus, completeTask } = useWorkerData();
  const { navigateToTask } = useLocationTracking();
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  if (!task) return null;

  const handleAcceptTask = () => {
    Alert.alert(
      'Accept Task',
      'Are you sure you want to accept this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            acceptTask(task.id);
            onClose();
          }
        }
      ]
    );
  };

  const handleStartTask = () => {
    updateTaskStatus(task.id, 'in_progress');
    Alert.alert('Task Started', 'You can now work on this task.');
    onClose();
  };

  const handleCompleteTask = () => {
    if (!completionNotes.trim()) {
      Alert.alert('Error', 'Please add completion notes');
      return;
    }

    if (completionPhotos.length === 0) {
      Alert.alert('Error', 'Please add at least one completion photo');
      return;
    }

    Alert.alert(
      'Complete Task',
      'Are you sure you want to mark this task as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            completeTask(task.id, {
              notes: completionNotes,
              photos: completionPhotos
            });
            setCompletionNotes('');
            setCompletionPhotos([]);
            onClose();
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-danger';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-primary';
      case 'low': return 'bg-success';
      default: return 'bg-textSecondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-warning';
      case 'accepted': return 'bg-primary';
      case 'in_progress': return 'bg-inProgress';
      case 'completed': return 'bg-success';
      default: return 'bg-textSecondary';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="bg-primary px-4 pt-12 pb-4 flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Task Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-white text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Task Type & Priority */}
          <View className="bg-card rounded-lg p-4 mb-4 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-text text-xl font-bold">
                {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
              </Text>
              <View className={`px-3 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                <Text className="text-white text-sm font-medium">
                  {task.priority.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View className={`px-3 py-1 rounded-full self-start ${getStatusColor(task.status)}`}>
              <Text className="text-white text-sm font-medium">
                {task.status.toUpperCase().replace('_', ' ')}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View className="bg-card rounded-lg p-4 mb-4 border border-border">
            <Text className="text-text text-lg font-semibold mb-2">📍 Location</Text>
            <Text className="text-text mb-1">{task.location.address}</Text>
            <Text className="text-textSecondary mb-2">{task.location.landmark}</Text>
            <Text className="text-textSecondary text-sm">
              Coordinates: {task.location.coordinates.lat.toFixed(4)}, {task.location.coordinates.lng.toFixed(4)}
            </Text>
          </View>

          {/* Task Details */}
          <View className="bg-card rounded-lg p-4 mb-4 border border-border">
            <Text className="text-text text-lg font-semibold mb-3">🗑️ Task Details</Text>
            <View className="mb-2">
              <Text className="text-textSecondary">Waste Type:</Text>
              <Text className="text-text font-medium">{task.wasteType}</Text>
            </View>
            <View className="mb-2">
              <Text className="text-textSecondary">Estimated Quantity:</Text>
              <Text className="text-text font-medium">{task.estimatedQuantity}</Text>
            </View>
            {task.specialInstructions && (
              <View className="mb-2">
                <Text className="text-textSecondary">Special Instructions:</Text>
                <Text className="text-text">{task.specialInstructions}</Text>
              </View>
            )}
          </View>

          {/* Timeline */}
          <View className="bg-card rounded-lg p-4 mb-4 border border-border">
            <Text className="text-text text-lg font-semibold mb-3">⏰ Timeline</Text>
            <View className="mb-2">
              <Text className="text-textSecondary">Assigned:</Text>
              <Text className="text-text">{new Date(task.assignedAt).toLocaleString()}</Text>
            </View>
            <View className="mb-2">
              <Text className="text-textSecondary">Due Date:</Text>
              <Text className="text-text">{new Date(task.dueDate).toLocaleString()}</Text>
            </View>
            {task.acceptedAt && (
              <View className="mb-2">
                <Text className="text-textSecondary">Accepted:</Text>
                <Text className="text-text">{new Date(task.acceptedAt).toLocaleString()}</Text>
              </View>
            )}
            {task.startedAt && (
              <View className="mb-2">
                <Text className="text-textSecondary">Started:</Text>
                <Text className="text-text">{new Date(task.startedAt).toLocaleString()}</Text>
              </View>
            )}
          </View>

          {/* Reference Photos (if available) */}
          {task.referencePhotos.length > 0 && (
            <View className="bg-card rounded-lg p-4 mb-4 border border-border">
              <Text className="text-text text-lg font-semibold mb-3">📸 Reference Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {task.referencePhotos.map((photo, index) => (
                  <Image 
                    key={index}
                    source={{ uri: photo }} 
                    className="w-24 h-24 rounded-lg mr-2"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Completion Section (for in_progress tasks) */}
          {task.status === 'in_progress' && (
            <>
              {/* Completion Notes */}
              <View className="bg-card rounded-lg p-4 mb-4 border border-border">
                <Text className="text-text text-lg font-semibold mb-3">📝 Completion Notes</Text>
                <TextInput
                  className="bg-background border border-border rounded-lg p-3 text-text min-h-[100px]"
                  placeholder="Add notes about the task completion..."
                  value={completionNotes}
                  onChangeText={setCompletionNotes}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Completion Photos */}
              <View className="mb-4">
                <PhotoPicker
                  photos={completionPhotos}
                  onPhotosChange={setCompletionPhotos}
                  maxPhotos={5}
                  title="📸 Completion Photos (Required)"
                />
              </View>
            </>
          )}

          {/* Completed Task Photos */}
          {task.status === 'completed' && task.completionPhotos.length > 0 && (
            <View className="bg-card rounded-lg p-4 mb-4 border border-border">
              <Text className="text-text text-lg font-semibold mb-3">✅ Completion Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {task.completionPhotos.map((photo, index) => (
                  <Image 
                    key={index}
                    source={{ uri: photo }} 
                    className="w-24 h-24 rounded-lg mr-2"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View className="p-4 bg-background border-t border-border">
          {/* Navigate Button - Show for all non-completed tasks */}
          {task.status !== 'completed' && (
            <TouchableOpacity 
              className="bg-secondary rounded-lg py-4 mb-2"
              onPress={() => navigateToTask(
                task.location.coordinates.lat,
                task.location.coordinates.lng,
                task.location.address
              )}
            >
              <Text className="text-white text-center font-semibold text-lg">
                🧭 Navigate to Task
              </Text>
            </TouchableOpacity>
          )}

          {task.status === 'assigned' && (
            <TouchableOpacity 
              className="bg-primary rounded-lg py-4 mb-2"
              onPress={handleAcceptTask}
            >
              <Text className="text-white text-center font-semibold text-lg">
                ✅ Accept Task
              </Text>
            </TouchableOpacity>
          )}

          {task.status === 'accepted' && (
            <TouchableOpacity 
              className="bg-inProgress rounded-lg py-4 mb-2"
              onPress={handleStartTask}
            >
              <Text className="text-white text-center font-semibold text-lg">
                🚀 Start Task
              </Text>
            </TouchableOpacity>
          )}

          {task.status === 'in_progress' && (
            <TouchableOpacity 
              className={`bg-success rounded-lg py-4 mb-2 ${
                !completionNotes.trim() || completionPhotos.length === 0 ? 'opacity-50' : ''
              }`}
              onPress={handleCompleteTask}
              disabled={!completionNotes.trim() || completionPhotos.length === 0}
            >
              <Text className="text-white text-center font-semibold text-lg">
                ✅ Complete Task
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            className="bg-textSecondary rounded-lg py-4"
            onPress={onClose}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
