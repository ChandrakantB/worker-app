import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface CameraPhoto {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  type?: string;
}

export class CameraService {
  
  static async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraPermission.granted && mediaLibraryPermission.granted;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  static async takePhoto(): Promise<CameraPhoto | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Camera and media library permissions are required to take photos.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        base64: asset.base64,
        width: asset.width,
        height: asset.height,
        type: asset.type,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  static async pickFromGallery(): Promise<CameraPhoto | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Media library permission is required to select photos.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        base64: asset.base64,
        width: asset.width,
        height: asset.height,
        type: asset.type,
      };
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
      return null;
    }
  }

  static showImagePickerAlert(): Promise<CameraPhoto | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Photo',
        'Choose how you want to add a photo',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const photo = await this.takePhoto();
              resolve(photo);
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              const photo = await this.pickFromGallery();
              resolve(photo);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ]
      );
    });
  }
}
