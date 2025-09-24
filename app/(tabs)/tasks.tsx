import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Task } from '../../types';
import TaskDetailModal from '../../components/modals/TaskDetailModal';

export default function TasksScreen() {
  const { assignedTasks, activeTask, completedTasks } = useWorkerData();
  const { theme, workerColors } = useTheme();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const closeTaskDetail = () => {
    setModalVisible(false);
    setSelectedTask(null);
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

  const TaskCard = ({ task }: { task: Task }) => (
    <TouchableOpacity 
      onPress={() => openTaskDetail(task)}
      className="bg-card rounded-lg p-4 mb-3 border border-border"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-text font-semibold text-lg">
          {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
        </Text>
        <View className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
          <Text className="text-white text-xs font-medium">
            {task.status.toUpperCase().replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      <Text className="text-textSecondary mb-2">
        📍 {task.location.address}
      </Text>
      
      <Text className="text-textSecondary mb-2">
        🗑️ {task.wasteType} ({task.estimatedQuantity})
      </Text>
      
      <View className="flex-row items-center justify-between">
        <View className={`px-3 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
          <Text className="text-white text-sm font-medium">
            {task.priority.toUpperCase()}
          </Text>
        </View>
        <Text className="text-textSecondary text-sm">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-4 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">
          My Tasks
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Active Task Section */}
        {activeTask && (
          <View className="mb-6">
            <Text className="text-text text-lg font-semibold mb-3">
              🔄 Active Task
            </Text>
            <TaskCard task={activeTask} />
          </View>
        )}

        {/* Task Stats */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-card rounded-lg p-3 flex-1 mr-2 border border-border">
            <Text className="text-primary text-xl font-bold">
              {assignedTasks.length}
            </Text>
            <Text className="text-textSecondary text-sm">
              Assigned
            </Text>
          </View>
          <View className="bg-card rounded-lg p-3 flex-1 ml-2 border border-border">
            <Text className="text-success text-xl font-bold">
              {completedTasks.length}
            </Text>
            <Text className="text-textSecondary text-sm">
              Completed
            </Text>
          </View>
        </View>

        {/* Assigned Tasks */}
        <View className="mb-6">
          <Text className="text-text text-lg font-semibold mb-3">
            📋 Assigned Tasks ({assignedTasks.length})
          </Text>
          
          {assignedTasks.length === 0 ? (
            <View className="bg-card rounded-lg p-6 border border-border">
              <Text className="text-textSecondary text-center">
                No tasks assigned at the moment
              </Text>
            </View>
          ) : (
            assignedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </View>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View className="mb-6">
            <Text className="text-text text-lg font-semibold mb-3">
              ✅ Recently Completed ({completedTasks.length})
            </Text>
            {completedTasks.slice(0, 3).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Task Detail Modal */}
      <TaskDetailModal 
        visible={modalVisible}
        task={selectedTask}
        onClose={closeTaskDetail}
      />
    </View>
  );
}
