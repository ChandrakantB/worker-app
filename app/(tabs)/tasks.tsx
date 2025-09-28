import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/theme/ThemeContext';
import CustomHeader from '../../components/navigation/CustomHeader';
import TaskCompletionModal from '../../components/modals/TaskCompletionModal';
import {
  ClipboardList,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  User,
  Trash2,
  Target,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

// Utility function to get 'x days ago' string for recent dates
function getDaysAgo(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

// Mock citizen reports with realistic recent dates
const mockCitizenReports = [
  {
    id: '1',
    reportedBy: 'Priya Sharma',
    location: {
      address: 'Sector 4, Near Bus Stand, Jabalpur',
      coordinates: { lat: 23.1825, lng: 79.987 },
    },
    wasteType: 'Mixed Waste',
    description: 'Overflowing garbage bin, needs immediate attention',
    priority: 'high',
    reportedAt: getDaysAgo(1.5), // 1.5 days ago
    estimatedQuantity: '2-3 bags',
    status: 'assigned',
    images: ['citizen_report_1.jpg'],
  },
  {
    id: '2',
    reportedBy: 'Rajesh Kumar',
    location: {
      address: 'Residential Zone, Block A, Jabalpur',
      coordinates: { lat: 23.1795, lng: 79.988 },
    },
    wasteType: 'Organic Waste',
    description: 'Food waste scattered around collection point',
    priority: 'urgent',
    reportedAt: getDaysAgo(1), // 1 day ago
    estimatedQuantity: '1-2 bags',
    status: 'assigned',
    images: ['citizen_report_2.jpg'],
  },
  {
    id: '3',
    reportedBy: 'Anjali Verma',
    location: {
      address: 'Commercial Area, Mall Road, Jabalpur',
      coordinates: { lat: 23.1835, lng: 79.9845 },
    },
    wasteType: 'Recyclable',
    description: 'Plastic bottles and containers not collected',
    priority: 'medium',
    reportedAt: getDaysAgo(2), // 2 days ago
    estimatedQuantity: '1 bag',
    status: 'assigned',
    images: [],
  },
];

// Mock completed tasks with realistic recent dates
const mockCompletedTasks = [
  {
    id: '4',
    reportedBy: 'Suresh Patel',
    location: {
      address: 'Industrial Zone, Sector 7, Jabalpur',
      coordinates: { lat: 23.1751, lng: 79.9851 },
    },
    wasteType: 'Mixed Waste',
    description: 'Large waste accumulation near factory',
    priority: 'high',
    reportedAt: getDaysAgo(3), 
    completedAt: getDaysAgo(2),
    approvedAt: getDaysAgo(1.5),
    status: 'approved',
    workerProof: {
      images: ['before_clean_4.jpg', 'after_clean_4.jpg'],
      location: { lat: 23.1751, lng: 79.9851 },
      completedBy: 'Vikrant Kumar',
      notes: 'Cleared all waste, area sanitized',
    },
  },
  {
    id: '5',
    reportedBy: 'Meera Singh',
    location: {
      address: 'Residential Colony, Phase 2, Jabalpur',
      coordinates: { lat: 23.181, lng: 79.9825 },
    },
    wasteType: 'Organic Waste',
    description: 'Garden waste and food scraps',
    priority: 'medium',
    reportedAt: getDaysAgo(4),
    completedAt: getDaysAgo(3),
    approvedAt: getDaysAgo(1.7),
    status: 'approved',
    workerProof: {
      images: ['before_clean_5.jpg', 'after_clean_5.jpg'],
      location: { lat: 23.181, lng: 79.9825 },
      completedBy: 'Vikrant Kumar',
      notes: 'Organic waste properly segregated and collected',
    },
  },
];

// Haversine formula to calculate distance between two geo points (in meters)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TasksScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'completed'>('reports');
  const [citizenReports, setCitizenReports] = useState(mockCitizenReports);
  const [completedTasks, setCompletedTasks] = useState(mockCompletedTasks);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null);

  // Safe padding for bottom tab bar
  const tabBarHeight = 80;
  const safeBottomPadding = Math.max(insets.bottom + 65, tabBarHeight);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Request location permissions based on platform
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      setLocationPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === 'granted');
    }
  };

  // Fetch user's current location
  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      return { lat: location.coords.latitude, lng: location.coords.longitude };
    } catch (error) {
      Alert.alert('Error', 'Could not access your location. Make sure location services are enabled.');
      return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return theme.colors.danger;
      case 'high':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.primary;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Target;
      case 'low':
        return CheckCircle2;
      default:
        return Target;
    }
  };

  // When user presses submit proof button
  const handlePressSubmitProof = async (task: any) => {
    if (locationPermissionGranted === false) {
      Alert.alert('Location Permission Required', 'Please enable location permissions to submit proof.');
      return;
    }

    const location = await getCurrentLocation();
    if (!location) return;

    setUserLocation(location);
    setSelectedTask(task);
    setShowCompletionModal(true);
  };

  // Handle task completion with real photo capture, location verification inside modal
  const handleTaskCompletion = async (completionData: { photos: string[]; notes: string }) => {
    if (!selectedTask || !userLocation) return;

    const distance = getDistanceMeters(
      selectedTask.location.coordinates.lat,
      selectedTask.location.coordinates.lng,
      userLocation.lat,
      userLocation.lng
    );

    const MAX_DISTANCE_METERS = 50;
    if (distance > MAX_DISTANCE_METERS) {
      Alert.alert(
        'Location Mismatch',
        `Your location differs by more than ${MAX_DISTANCE_METERS} meters. Penalties may apply.`,
        [
          { text: 'Cancel Submission', style: 'cancel' },
          {
            text: 'Proceed',
            style: 'destructive',
            onPress: () => finalizeTaskCompletion(completionData, distance),
          },
        ]
      );
    } else {
      finalizeTaskCompletion(completionData, distance);
    }
  };

  // Update state and notify after finalizing task completion
  const finalizeTaskCompletion = (
    completionData: { photos: string[]; notes: string },
    distance: number
  ) => {
    const updatedReports = citizenReports.map((report) =>
      report.id === selectedTask.id
        ? {
            ...report,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            workerProof: {
              images: completionData.photos,
              location: userLocation,
              notes: completionData.notes || 'Task completed successfully',
              distanceFromReportLocation: distance,
            },
          }
        : report
    );
    setCitizenReports(updatedReports);
    setShowCompletionModal(false);
    setSelectedTask(null);
    setUserLocation(null);

    Alert.alert('Task Submitted', 'Your task completion report was submitted for admin approval.');
  };

  // Formatting how long ago
  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Less than 1 hour ago';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  // Component to render citizen report cards with Submit Proof button
  const CitizenReportCard = ({ report }: { report: any }) => {
    const PriorityIcon = getPriorityIcon(report.priority);

    return (
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 3,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <User size={16} color={theme.colors.primary} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.text,
                marginLeft: 8,
              }}
            >
              Reported by {report.reportedBy}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: getPriorityColor(report.priority) + '20',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <PriorityIcon size={14} color={getPriorityColor(report.priority)} />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: getPriorityColor(report.priority),
                marginLeft: 4,
                textTransform: 'uppercase',
              }}
            >
              {report.priority}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
          <MapPin size={16} color={theme.colors.textSecondary} style={{ marginTop: 2 }} />
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              marginLeft: 8,
              flex: 1,
              lineHeight: 18,
            }}
          >
            {report.location.address}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Trash2 size={16} color={theme.colors.textSecondary} />
          <Text style={{ fontSize: 14, color: theme.colors.text, marginLeft: 8 }}>
            {report.wasteType} • {report.estimatedQuantity}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 12,
            lineHeight: 18,
            fontStyle: 'italic',
          }}
        >
          "{report.description}"
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 4 }}>
              {getTimeSince(report.reportedAt)}
            </Text>
          </View>

          {report.status === 'assigned' ? (
            <TouchableOpacity
              onPress={() => handlePressSubmitProof(report)}
              style={{
                backgroundColor: theme.colors.success,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              activeOpacity={0.8}
            >
              <Camera size={16} color="white" />
              <Text style={{ color: 'white', fontWeight: '700', marginLeft: 8, fontSize: 14 }}>
                Submit Proof
              </Text>
            </TouchableOpacity>
          ) : report.status === 'pending' ? (
            <View
              style={{
                backgroundColor: theme.colors.warning + '40',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: theme.colors.warning, fontWeight: '700', fontSize: 12 }}>
                PENDING APPROVAL
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const CompletedTaskCard = ({ task }: { task: any }) => (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <CheckCircle2 size={16} color={theme.colors.success} />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.text,
              marginLeft: 8,
            }}
          >
            {task.reportedBy}
          </Text>
        </View>
        <View style={{ backgroundColor: theme.colors.success + '20', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: theme.colors.success, fontWeight: '700', fontSize: 12 }}>APPROVED</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
        <MapPin size={16} color={theme.colors.textSecondary} style={{ marginTop: 2 }} />
        <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginLeft: 8, flex: 1, lineHeight: 18 }}>
          {task.location.address}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Trash2 size={16} color={theme.colors.textSecondary} />
        <Text style={{ fontSize: 14, color: theme.colors.text, marginLeft: 8 }}>{task.wasteType}</Text>
      </View>

      <View style={{ backgroundColor: theme.colors.background, borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Camera size={14} color={theme.colors.primary} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text, marginLeft: 8 }}>Completion Proof</Text>
        </View>
        <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>
          📸 {task.workerProof.images.length} photos submitted
        </Text>
        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
          📍 Location verified • {task.workerProof.notes}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
          Completed: {getTimeSince(task.completedAt)}
        </Text>
        <Text style={{ color: theme.colors.success, fontWeight: '600', fontSize: 12 }}>
          Approved: {getTimeSince(task.approvedAt)}
        </Text>
      </View>
    </View>
  );

  const handleMenuPress = () => console.log('Tasks menu pressed');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Navbar consistent with dashboard */}
      <CustomHeader
        title="My Tasks"
        subtitle="Citizen reports and completed work"
        showNotifications={true}
        showSettings={false}
        showConnectionStatus={true}
        onMenuPress={handleMenuPress}
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      {/* Tab Selector */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.colors.card,
          marginHorizontal: 20,
          marginTop: 20,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('reports')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 20,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: activeTab === 'reports' ? theme.colors.primary : 'transparent',
          }}
          activeOpacity={0.8}
        >
          <ClipboardList size={18} color={activeTab === 'reports' ? 'white' : theme.colors.textSecondary} />
          <Text
            style={{
              marginLeft: 8,
              fontWeight: '700',
              color: activeTab === 'reports' ? 'white' : theme.colors.textSecondary,
              fontSize: 14,
            }}
          >
            Citizen Reports ({citizenReports.filter((r) => r.status === 'assigned').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 20,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: activeTab === 'completed' ? theme.colors.success : 'transparent',
          }}
          activeOpacity={0.8}
        >
          <CheckCircle2 size={18} color={activeTab === 'completed' ? 'white' : theme.colors.textSecondary} />
          <Text
            style={{
              marginLeft: 8,
              fontWeight: '700',
              color: activeTab === 'completed' ? 'white' : theme.colors.textSecondary,
              fontSize: 14,
            }}
          >
            Completed ({completedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: safeBottomPadding + 20,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
      >
        {activeTab === 'reports' ? (
          citizenReports.length === 0 ? (
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <ClipboardList size={32} color={theme.colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginBottom: 8, textAlign: 'center' }}>
                No citizen reports
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>
                Reports from your assigned area will appear here
              </Text>
            </View>
          ) : (
            citizenReports.map((report) => <CitizenReportCard key={report.id} report={report} />)
          )
        ) : completedTasks.length === 0 ? (
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <CheckCircle2 size={32} color={theme.colors.success} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginBottom: 8, textAlign: 'center' }}>
              No completed tasks yet
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>
              Completed and approved tasks will appear here
            </Text>
          </View>
        ) : (
          completedTasks.map((task) => <CompletedTaskCard key={task.id} task={task} />)
        )}
      </ScrollView>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        visible={showCompletionModal}
        task={selectedTask}
        onComplete={handleTaskCompletion}
        onCancel={() => {
          setShowCompletionModal(false);
          setSelectedTask(null);
          setUserLocation(null);
        }}
      />
    </View>
  );
}
