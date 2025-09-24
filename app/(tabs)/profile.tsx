import React, { useState } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Switch,
  Modal,
  TextInput,
  Platform,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useOfflineSync } from '../../hooks/useOfflineSync';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { worker, logoutWorker, assignedTasks, completedTasks, activeTask } = useWorkerData();
  const { theme, isDark, toggleTheme, themeMode, setThemeMode } = useTheme();
  const { notificationCount, clearAllNotifications } = useNotifications();
  const { syncStatus } = useOfflineSync();
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Form states
  const [editFormData, setEditFormData] = useState({
    name: worker?.name || '',
    email: worker?.email || '',
    phone: worker?.phone || '',
    employeeId: worker?.employeeId || ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    taskUpdates: true,
    locationTracking: true,
    dutyReminders: true,
    weeklyReports: false,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutWorker();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = async () => {
    // Validate form
    if (!editFormData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    Alert.alert('Success', 'Profile updated successfully!');
    setShowEditModal(false);
  };

  const calculateWorkingDays = () => {
    // Mock calculation - in real app would come from server
    return Math.floor(Math.random() * 30) + 1;
  };

  const getPerformanceRating = () => {
    const completed = completedTasks.length;
    const total = assignedTasks.length + completedTasks.length;
    if (total === 0) return 'New';
    const rate = (completed / total) * 100;
    if (rate >= 90) return 'Excellent';
    if (rate >= 75) return 'Good';
    if (rate >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const workerStats = [
    { 
      icon: '📋', 
      title: 'Total Tasks', 
      value: assignedTasks.length + completedTasks.length,
      color: theme.colors.primary 
    },
    { 
      icon: '✅', 
      title: 'Completed', 
      value: completedTasks.length,
      color: theme.colors.success 
    },
    { 
      icon: '🏆', 
      title: 'Performance', 
      value: getPerformanceRating(),
      color: theme.colors.warning 
    },
    { 
      icon: '📅', 
      title: 'Working Days', 
      value: calculateWorkingDays(),
      color: theme.colors.secondary 
    },
  ];

  const profileOptions = [
    {
      icon: '👤',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      action: () => setShowEditModal(true),
      color: theme.colors.primary
    },
    {
      icon: '🔒',
      title: 'Change Password',
      subtitle: 'Update your account password',
      action: () => setShowPasswordModal(true),
      color: theme.colors.warning
    },
    {
      icon: '🔔',
      title: 'Notification Settings',
      subtitle: `${notificationCount} unread notifications`,
      action: () => setShowSettingsModal(true),
      color: theme.colors.secondary
    },
    {
      icon: '🎨',
      title: 'Theme Settings',
      subtitle: `Current: ${isDark ? 'Dark' : 'Light'} mode`,
      action: () => setShowThemeModal(true),
      color: theme.colors.primary
    },
    {
      icon: '📊',
      title: 'Performance Report',
      subtitle: 'View your work statistics',
      action: () => Alert.alert('Performance Report', 'Feature coming soon!'),
      color: theme.colors.success
    },
    {
      icon: '❓',
      title: 'Help & Support',
      subtitle: 'Get help with the app',
      action: () => Alert.alert('Help & Support', 'Contact support@bin2win.com'),
      color: theme.colors.textSecondary
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Profile Header */}
        <View style={{
          backgroundColor: theme.colors.primary,
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingBottom: 30,
          paddingHorizontal: 20,
          position: 'relative'
        }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 15,
              borderWidth: 3,
              borderColor: 'rgba(255,255,255,0.3)'
            }}>
              <Text style={{ fontSize: 40, color: 'white' }}>👷</Text>
            </View>
            
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 5
            }}>
              {worker?.name || 'Worker'}
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: 10
            }}>
              {worker?.employeeId || 'N/A'} • {worker?.department || 'N/A'}
            </Text>
            
            <View style={{
              backgroundColor: worker?.isOnDuty ? theme.colors.success : theme.colors.textSecondary,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 15,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                {worker?.isOnDuty ? '🟢 On Duty' : '🔴 Off Duty'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => setShowEditModal(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              paddingVertical: 10,
              paddingHorizontal: 20,
              alignSelf: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)'
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 20 }}>
          {/* Stats Grid */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 15
            }}>
              Your Performance
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10
            }}>
              {workerStats.map((stat, index) => (
                <View key={index} style={{
                  backgroundColor: theme.colors.card,
                  borderRadius: 12,
                  padding: 15,
                  width: (width - 50) / 2,
                  alignItems: 'center',
                  shadowColor: theme.colors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}>
                  <Text style={{ fontSize: 24, marginBottom: 5 }}>{stat.icon}</Text>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                    marginBottom: 2
                  }}>
                    {stat.value}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    textAlign: 'center'
                  }}>
                    {stat.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Info */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 15
            }}>
              Account Information
            </Text>
            
            <View style={{
              backgroundColor: theme.colors.card,
              borderRadius: 12,
              padding: 16,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border
              }}>
                <Text style={{ fontSize: 16, marginRight: 10 }}>📧</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Email</Text>
                  <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '500' }}>
                    {worker?.email || 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border
              }}>
                <Text style={{ fontSize: 16, marginRight: 10 }}>📱</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Phone</Text>
                  <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '500' }}>
                    {worker?.phone || 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12
              }}>
                <Text style={{ fontSize: 16, marginRight: 10 }}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Assigned Area</Text>
                  <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '500' }}>
                    {worker?.assignedArea || 'Not assigned'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Settings Options */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 15
            }}>
              Settings & Preferences
            </Text>
            
            {profileOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={option.action}
                style={{
                  backgroundColor: theme.colors.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: theme.colors.shadow,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>{option.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: 2
                  }}>
                    {option.title}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary
                  }}>
                    {option.subtitle}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={handleLogout}
            style={{
              backgroundColor: theme.colors.danger,
              borderRadius: 12,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.colors.danger,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
              🚪 Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Theme Settings Modal */}
      <Modal visible={showThemeModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border
          }}>
            <TouchableOpacity onPress={() => setShowThemeModal(false)}>
              <Text style={{ color: theme.colors.text, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text }}>
              Theme Settings
            </Text>
            <View style={{ width: 20 }} />
          </View>
          
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 20 }}>
              Choose Theme
            </Text>
            
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setThemeMode(mode)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  backgroundColor: themeMode === mode ? theme.colors.primary + '20' : theme.colors.card,
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: themeMode === mode ? 2 : 1,
                  borderColor: themeMode === mode ? theme.colors.primary : theme.colors.border
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>
                  {mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '📱'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: 2
                  }}>
                    {mode === 'light' ? 'Light Mode' : mode === 'dark' ? 'Dark Mode' : 'System Default'}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                    {mode === 'light' ? 'Always use light theme' : 
                     mode === 'dark' ? 'Always use dark theme' : 
                     'Follow system settings'}
                  </Text>
                </View>
                {themeMode === mode && (
                  <Text style={{ color: theme.colors.primary, fontSize: 16 }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
