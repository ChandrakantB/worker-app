import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { CameraService, CameraPhoto } from '../../services/camera/CameraService';
import { OfflineService } from '../../services/offline/OfflineService';

interface PhotoPickerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  title?: string;
  taskId?: string;
}

export default function PhotoPicker({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5, 
  title = "Photos",
  taskId = "current_task"
}: PhotoPickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can only add up to ${maxPhotos} photos.`);
      return;
    }

    setIsLoading(true);
    try {
      const photo = await CameraService.showImagePickerAlert();
      if (photo) {
        const newPhotos = [...photos, photo.uri];
        onPhotosChange(newPhotos);
        
        // Store photo offline for later sync
        if (title.toLowerCase().includes('completion') || title.toLowerCase().includes('task')) {
          await OfflineService.storeOfflinePhoto(taskId, photo.uri);
        }
      }
    } catch (error) {
      console.error('Error adding photo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newPhotos = photos.filter((_, i) => i !== index);
            onPhotosChange(newPhotos);
          },
        },
      ]
    );
  };

  return (
    <View className="bg-card rounded-lg p-4 border border-border">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-text text-lg font-semibold">{title}</Text>
        <Text className="text-textSecondary text-sm">
          {photos.length}/{maxPhotos}
        </Text>
      </View>

      {photos.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {photos.map((photoUri, index) => (
            <View key={index} className="mr-3">
              <Image 
                source={{ uri: photoUri }} 
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity 
                onPress={() => handleRemovePhoto(index)}
                className="absolute -top-2 -right-2 bg-danger w-6 h-6 rounded-full items-center justify-center"
              >
                <Text className="text-white text-xs font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity 
        onPress={handleAddPhoto}
        disabled={isLoading || photos.length >= maxPhotos}
        className={`border-2 border-dashed border-primary rounded-lg py-4 items-center ${
          photos.length >= maxPhotos ? 'opacity-50' : ''
        }`}
      >
        <Text className="text-primary text-4xl mb-2">📷</Text>
        <Text className="text-primary font-medium">
          {isLoading ? 'Adding Photo...' : 'Add Photo'}
        </Text>
        <Text className="text-textSecondary text-sm mt-1">
          Tap to take photo or select from gallery
        </Text>
      </TouchableOpacity>
    </View>
  );
}
