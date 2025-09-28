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
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import CustomHeader from '../../components/navigation/CustomHeader';
import {
  User,
  Edit3,
  Lock,
  Bell,
  Palette,
  BarChart3,
  HelpCircle,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Award,
  CheckCircle2,
  Calendar,
  ClipboardList,
  Sun,
  Moon,
  Smartphone,
  ChevronRight,
  X,
  Shield,
  Settings
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { worker, logoutWorker, assignedTasks, completedTasks, activeTask } = useWorkerData();
  const { theme, isDark, toggleTheme, themeMode, setThemeMode } = useTheme();
  const { notificationCount, clearAllNotifications } = useNotifications();
  const { syncStatus } = useOfflineSync();
  const insets = useSafeAreaInsets();
  
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

  // Calculate safe bottom padding for tab bar
  const tabBarHeight = 80;
  const safeBottomPadding = Math.max(insets.bottom + 65, tabBarHeight) + 50;

  const handleLogout = () => {
    Alert.alert(
      'Logout Confirmation',
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
    if (!editFormData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }
    Alert.alert('Success', 'Profile updated successfully!');
    setShowEditModal(false);
  };

  const handleLanguagePress = () => {
    Alert.alert('Language Settings', 'Language selection feature coming soon!');
  };

  const handleThemePress = () => {
    setShowThemeModal(true);
  };

  const calculateWorkingDays = () => {
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
      icon: ClipboardList, 
      title: 'Total Tasks', 
      value: assignedTasks.length + completedTasks.length,
      color: theme.colors.primary 
    },
    { 
      icon: CheckCircle2, 
      title: 'Completed', 
      value: completedTasks.length,
      color: theme.colors.success 
    },
    { 
      icon: Award, 
      title: 'Performance', 
      value: getPerformanceRating(),
      color: theme.colors.warning 
    },
    { 
      icon: Calendar, 
      title: 'Working Days', 
      value: calculateWorkingDays(),
      color: theme.colors.secondary 
    },
  ];

  const profileOptions = [
    {
      icon: Edit3,
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      action: () => setShowEditModal(true),
      color: theme.colors.primary
    },
    {
      icon: Lock,
      title: 'Change Password',
      subtitle: 'Update your account password',
      action: () => setShowPasswordModal(true),
      color: theme.colors.warning
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: `${notificationCount} unread notifications`,
      action: () => setShowSettingsModal(true),
      color: theme.colors.secondary
    },
    {
      icon: Palette,
      title: 'Appearance',
      subtitle: `Current: ${isDark ? 'Dark' : 'Light'} mode`,
      action: () => setShowThemeModal(true),
      color: theme.colors.primary
    },
    {
      icon: BarChart3,
      title: 'Performance Report',
      subtitle: 'View your work statistics',
      action: () => Alert.alert('Performance Report', 'Feature coming soon!'),
      color: theme.colors.success
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help with the app',
      action: () => Alert.alert('Help & Support', 'Contact support@bin2win.com'),
      color: theme.colors.textSecondary
    }
  ];

  const handleMenuPress = () => console.log('Profile menu pressed');

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <CustomHeader
        title="Profile"
        subtitle="Manage your account"
        showNotifications={false}
        showSettings={false}
        showConnectionStatus={false}
        onMenuPress={handleMenuPress}
      />

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: safeBottomPadding }}
      >
        {/* Enhanced Profile Header */}
        <View style={{
          backgroundColor: theme.colors.primary,
          paddingTop: 32,
          paddingBottom: 32,
          paddingHorizontal: 20,
          position: 'relative'
        }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              borderWidth: 3,
              borderColor: 'rgba(255,255,255,0.3)'
            }}>
              <User size={40} color="white" />
            </View>
            
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 4
            }}>
              {worker?.name || 'Worker Name'}
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: 12
            }}>
              {worker?.employeeId || 'EMP001'} • {worker?.department || 'Sanitation'}
            </Text>
            
            <View style={{
              backgroundColor: worker?.isOnDuty ? theme.colors.success : theme.colors.textSecondary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'white',
                marginRight: 8
              }} />
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '600'
              }}>
                {worker?.isOnDuty ? 'On Duty' : 'Off Duty'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => setShowEditModal(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 25,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignSelf: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
              flexDirection: 'row',
              alignItems: 'center'
            }}
            activeOpacity={0.8}
          >
            <Edit3 size={16} color="white" />
            <Text style={{
              color: 'white',
              fontWeight: '600',
              marginLeft: 8
            }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 20 }}>
          {/* Stats Grid */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 16
            }}>
              Your Performance
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              {workerStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <View 
                    key={index} 
                    style={{
                      backgroundColor: theme.colors.card,
                      borderRadius: 16,
                      padding: 16,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 4,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      width: (width - 60) / 2,
                      marginBottom: 12
                    }}
                  >
                    <IconComponent size={24} color={stat.color} style={{ marginBottom: 8 }} />
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: theme.colors.text,
                      marginBottom: 4
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
                );
              })}
            </View>
          </View>

          {/* Account Information */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 16
            }}>
              Account Information
            </Text>
            
            <View style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border
              }}>
                <Mail size={16} color={theme.colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary
                  }}>
                    Email
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.text,
                    fontWeight: '500'
                  }}>
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
                <Phone size={16} color={theme.colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary
                  }}>
                    Phone
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.text,
                    fontWeight: '500'
                  }}>
                    {worker?.phone || 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12
              }}>
                <MapPin size={16} color={theme.colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary
                  }}>
                    Assigned Area
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.text,
                    fontWeight: '500'
                  }}>
                    {worker?.assignedArea || 'Not assigned'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Settings Options */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 16
            }}>
              Settings & Preferences
            </Text>
            
            {profileOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={option.action}
                  style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 4,
                    borderWidth: 1,
                    borderColor: theme.colors.border
                  }}
                  activeOpacity={0.8}
                >
                  <IconComponent size={20} color={option.color} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 4
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
                  <ChevronRight size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={handleLogout}
            style={{
              backgroundColor: theme.colors.danger,
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
            activeOpacity={0.8}
          >
            <LogOut size={20} color="white" />
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 8
            }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Theme Settings Modal */}
      <Modal visible={showThemeModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: theme.background }}>
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
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.colors.text
            }}>
              Appearance Settings
            </Text>
            <View style={{ width: 20 }} />
          </View>
          
          <View style={{ padding: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: 20
            }}>
              Choose Theme
            </Text>
            
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const getIcon = () => {
                switch (mode) {
                  case 'light': return Sun;
                  case 'dark': return Moon;
                  case 'system': return Smartphone;
                  default: return Sun;
                }
              };
              const IconComponent = getIcon();

              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    marginBottom: 8,
                    borderWidth: 2,
                    borderColor: themeMode === mode ? theme.colors.primary : theme.colors.border,
                    backgroundColor: themeMode === mode ? theme.colors.primary + '20' : theme.colors.card
                  }}
                  activeOpacity={0.8}
                >
                  <IconComponent 
                    size={20} 
                    color={themeMode === mode ? theme.colors.primary : theme.colors.text} 
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 4
                    }}>
                      {mode === 'light' ? 'Light Mode' : 
                       mode === 'dark' ? 'Dark Mode' : 
                       'System Default'}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: theme.colors.textSecondary
                    }}>
                      {mode === 'light' ? 'Always use light theme' : 
                       mode === 'dark' ? 'Always use dark theme' : 
                       'Follow system settings'}
                    </Text>
                  </View>
                  {themeMode === mode && (
                    <CheckCircle2 size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border
          }}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.colors.text
            }}>
              Edit Profile
            </Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Text style={{
                color: theme.colors.primary,
                fontWeight: '600'
              }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={{ flex: 1, padding: 20 }}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 50) }}
          >
            <View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: theme.colors.text,
                  marginBottom: 8
                }}>
                  Name
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    padding: 16,
                    color: theme.colors.text
                  }}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: theme.colors.text,
                  marginBottom: 8
                }}>
                  Email
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    padding: 16,
                    color: theme.colors.text
                  }}
                  value={editFormData.email}
                  onChangeText={(text) => setEditFormData({ ...editFormData, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: theme.colors.text,
                  marginBottom: 8
                }}>
                  Phone
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    padding: 16,
                    color: theme.colors.text
                  }}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: theme.colors.text,
                  marginBottom: 8
                }}>
                  Employee ID
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    padding: 16,
                    color: theme.colors.text,
                    opacity: 0.6
                  }}
                  value={editFormData.employeeId}
                  placeholder="Employee ID (Read-only)"
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={false}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
