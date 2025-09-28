import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Camera, MapPin, X, Upload, CheckCircle2 } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

interface TaskCompletionModalProps {
  visible: boolean;
  task: any;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export default function TaskCompletionModal({ visible, task, onComplete, onCancel }: TaskCompletionModalProps) {
  const { theme } = useTheme();
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    if (visible) {
      requestLocationPermission();
      setPhotos([]);
      setNotes('');
      setLocation(null);
    }
  }, [visible]);

  const requestLocationPermission = async () => {
    let status;
    if (Platform.OS === 'android') {
      const { status: androidStatus } = await Location.requestForegroundPermissionsAsync();
      status = androidStatus;
    } else {
      const { status: iosStatus } = await Location.requestForegroundPermissionsAsync();
      status = iosStatus;
    }
    setLocationPermissionGranted(status === 'granted');
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Location permission is required to capture your current location with the photo'
      );
    }
  };

  const capturePhoto = async () => {
    if (locationPermissionGranted === false) {
      Alert.alert('Permission denied', 'Location permission is needed before taking photo.');
      return;
    }
    setIsCapturing(true);
    try {
      let photoPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!photoPermission.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take a photo.');
        setIsCapturing(false);
        return;
      }

      const photoResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: false,
      });

      if (!photoResult.cancelled) {
        // After capturing photo get current location
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          maximumAge: 0,
          timeout: 10000,
        });
        const userLoc = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setLocation(userLoc);
        setPhotos((prev) => [...prev, photoResult.uri]);
        Alert.alert('Photo Captured!', 'Photo and location saved successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo or location.');
    }
    setIsCapturing(false);
  };

  const handleSubmit = () => {
    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please take at least one photo as proof of completion');
      return;
    }
    if (!location) {
      Alert.alert('Location Required', 'Location verification is required for task completion');
      return;
    }

    const completionData = {
      taskId: task.id,
      photos,
      location,
      notes: notes.trim() || 'Task completed successfully',
      completedAt: new Date().toISOString(),
      workerLocation: location,
    };

    onComplete(completionData);
  };

  if (!visible || !task) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text }}>
            Complete Task
          </Text>
          <TouchableOpacity onPress={onCancel}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Task Info */}
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}
            >
              Task Details
            </Text>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>
              📍 {task.location?.address}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>
              🗑️ {task.wasteType} • {task.estimatedQuantity}
            </Text>
            <Text style={{ color: theme.colors.textSecondary }}>{task.description}</Text>
          </View>

          {/* Photo Capture Section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
              Completion Proof
            </Text>

            <TouchableOpacity
              onPress={capturePhoto}
              disabled={isCapturing}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 24,
                paddingVertical: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isCapturing ? 0.5 : 1,
                marginBottom: 12,
              }}
              activeOpacity={0.8}
            >
              <Camera size={24} color="white" />
              <Text
                style={{
                  color: 'white',
                  fontWeight: '700',
                  marginLeft: 8,
                  fontSize: 16,
                }}
              >
                {isCapturing ? 'Capturing...' : 'Take Photo'}
              </Text>
            </TouchableOpacity>

            {photos.length > 0 && (
              <View
                style={{
                  backgroundColor: theme.colors.card,
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Photos Captured ({photos.length})
                </Text>
                {photos.map((uri, idx) => (
                  <View
                    key={idx}
                    style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}
                  >
                    <CheckCircle2 size={18} color={theme.colors.success} />
                    <Text
                      style={{ marginLeft: 8, color: theme.colors.textSecondary, flex: 1 }}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {uri}
                    </Text>
                    <Image
                      source={{ uri }}
                      style={{ width: 40, height: 40, borderRadius: 8, marginLeft: 8 }}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Location Section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
              Location Verification
            </Text>
            {location ? (
              <View
                style={{
                  backgroundColor: theme.colors.success + '20',
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.success + '80',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={18} color={theme.colors.success} />
                  <Text style={{ color: theme.colors.success, marginLeft: 8, fontWeight: '600' }}>
                    Location Verified
                  </Text>
                </View>
                <Text style={{ color: theme.colors.textSecondary, marginTop: 4, fontSize: 14 }}>
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: theme.colors.warning + '20',
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.warning + '80',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={18} color={theme.colors.warning} />
                  <Text style={{ color: theme.colors.warning, marginLeft: 8, fontWeight: '600' }}>
                    Location Required
                  </Text>
                </View>
                <Text style={{ color: theme.colors.textSecondary, marginTop: 4, fontSize: 14 }}>
                  Take a photo to capture location automatically
                </Text>
              </View>
            )}
          </View>

          {/* Notes Section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
              Additional Notes
            </Text>
            <TextInput
              placeholder="Add any additional notes about the task completion..."
              placeholderTextColor={theme.colors.textSecondary}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: 16,
                color: theme.colors.text,
                minHeight: 100,
                textAlignVertical: 'top',
                fontSize: 16,
              }}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: theme.colors.success,
              borderRadius: 24,
              paddingVertical: 16,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
            activeOpacity={0.8}
          >
            <Upload size={24} color="white" />
            <Text
              style={{
                color: 'white',
                fontWeight: '800',
                fontSize: 18,
                marginLeft: 8,
              }}
            >
              Submit Completion Report
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: 12,
              textAlign: 'center',
              lineHeight: 18,
            }}
          >
            Your report will be sent to admin for approval. You will be notified once approved.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
