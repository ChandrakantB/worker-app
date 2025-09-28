import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { ViolationType, ReportFormData } from '../../types/reports';
import PhotoPicker from '../ui/PhotoPicker';
import {
  X,
  AlertTriangle,
  User,
  MapPin,
  FileText,
  Camera,
  Trash2,
  AlertCircle,
  XCircle,
  Ban,
  Droplets,
  Zap,
  CheckCircle
} from 'lucide-react-native';

interface CitizenReportFormProps {
  citizenQRData: string;
  onSubmit: (reportData: ReportFormData) => void;
  onCancel: () => void;
  extraBottomPadding?: number;
}

export default function CitizenReportForm({ 
  citizenQRData, 
  onSubmit, 
  onCancel, 
  extraBottomPadding = 0 
}: CitizenReportFormProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState<ReportFormData>({
    violationType: 'improper_segregation',
    severity: 'medium',
    description: '',
    photos: [],
    location: ''
  });

  const violationTypes = [
    { key: 'improper_segregation', label: 'Improper Segregation', icon: FileText, color: theme.colors.warning },
    { key: 'contamination', label: 'Cross Contamination', icon: Droplets, color: theme.colors.danger },
    { key: 'overflowing_bin', label: 'Overflowing Bin', icon: Trash2, color: theme.colors.warning },
    { key: 'wrong_bin_usage', label: 'Wrong Bin Usage', icon: XCircle, color: theme.colors.danger },
    { key: 'hazardous_mixing', label: 'Hazardous Mixing', icon: Zap, color: theme.colors.danger },
    { key: 'no_segregation', label: 'No Segregation', icon: Ban, color: theme.colors.danger },
    { key: 'dirty_containers', label: 'Dirty Containers', icon: AlertCircle, color: theme.colors.warning },
    { key: 'illegal_dumping', label: 'Illegal Dumping', icon: AlertTriangle, color: theme.colors.danger }
  ];

  const severityLevels = [
    { key: 'low', label: 'Low', color: theme.colors.success, description: 'Minor violation, education needed', icon: CheckCircle },
    { key: 'medium', label: 'Medium', color: theme.colors.warning, description: 'Moderate violation, warning issued', icon: AlertCircle },
    { key: 'high', label: 'High', color: theme.colors.danger, description: 'Serious violation, penalty required', icon: AlertTriangle },
    { key: 'critical', label: 'Critical', color: '#8b0000', description: 'Severe violation, immediate action', icon: XCircle }
  ];

  // Calculate total bottom padding: safe area + tab bar + extra padding
  const totalBottomPadding = Math.max(insets.bottom + 80 + extraBottomPadding + 50, 130);

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please provide a description of the violation');
      return;
    }

    if (formData.photos.length === 0) {
      Alert.alert('Error', 'Please add at least one photo as evidence');
      return;
    }

    Alert.alert(
      'Submit Report',
      'Are you sure you want to report this violation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit Report', 
          style: 'destructive',
          onPress: () => onSubmit(formData)
        }
      ]
    );
  };

  // Extract citizen info from any QR data
  const getCitizenInfo = (qrData: string) => {
    let citizenId = 'Unknown';
    let area = 'Jabalpur Area';
    
    if (qrData.startsWith('BIN2WIN_CITIZEN_')) {
      citizenId = qrData.replace('BIN2WIN_CITIZEN_', '');
    } else if (qrData.includes('citizen')) {
      citizenId = qrData.substring(qrData.indexOf('citizen') + 7, qrData.indexOf('citizen') + 15);
    } else {
      // Use first 8 characters of any QR code as citizen ID
      citizenId = qrData.substring(0, 8).toUpperCase();
    }
    
    return {
      id: citizenId,
      displayName: `Citizen ${citizenId}`,
      area: 'Sector 4, Jabalpur'
    };
  };

  const citizenInfo = getCitizenInfo(citizenQRData);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: theme.colors.danger,
        paddingTop: Math.max(insets.top + 10, 50),
        paddingBottom: 20,
        paddingHorizontal: 20
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={onCancel}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <X size={20} color="white" />
            <Text style={{ color: 'white', fontSize: 16, marginLeft: 8 }}>Cancel</Text>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AlertTriangle size={20} color="white" />
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
              Report Violation
            </Text>
          </View>
          
          <View style={{ width: 60 }} />
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          padding: 20, 
          paddingBottom: totalBottomPadding 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Citizen Info */}
        <View style={{
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.primary
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <User size={18} color={theme.colors.text} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
              Reporting Against
            </Text>
          </View>
          
          <Text style={{ color: theme.colors.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Citizen ID:</Text> {citizenInfo.displayName}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={12} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
              {citizenInfo.area}
            </Text>
          </View>
          
          <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
            QR: {citizenQRData.substring(0, 20)}...
          </Text>
        </View>

        {/* Violation Type Selection */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <FileText size={18} color={theme.colors.text} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
              Violation Type
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {violationTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = formData.violationType === type.key;
              
              return (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => setFormData({ ...formData, violationType: type.key as ViolationType })}
                  style={{
                    backgroundColor: isSelected ? type.color : theme.colors.card,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? type.color : theme.colors.border,
                    minWidth: '45%',
                    alignItems: 'center'
                  }}
                >
                  <IconComponent 
                    size={20} 
                    color={isSelected ? 'white' : type.color} 
                    style={{ marginBottom: 8 }} 
                  />
                  <Text style={{
                    color: isSelected ? 'white' : theme.colors.text,
                    fontSize: 12,
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Severity Selection */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <AlertTriangle size={18} color={theme.colors.text} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
              Severity Level
            </Text>
          </View>
          
          {severityLevels.map((level) => {
            const IconComponent = level.icon;
            const isSelected = formData.severity === level.key;
            
            return (
              <TouchableOpacity
                key={level.key}
                onPress={() => setFormData({ ...formData, severity: level.key as any })}
                style={{
                  backgroundColor: isSelected ? level.color + '20' : theme.colors.card,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor: isSelected ? level.color : theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <IconComponent size={20} color={level.color} style={{ marginRight: 12 }} />
                
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 2
                  }}>
                    {level.label}
                  </Text>
                  <Text style={{
                    color: theme.colors.textSecondary,
                    fontSize: 12
                  }}>
                    {level.description}
                  </Text>
                </View>
                
                {isSelected && (
                  <CheckCircle size={20} color={level.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Location Input */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={18} color={theme.colors.text} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
              Specific Location
            </Text>
          </View>
          
          <TextInput
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
            placeholder="e.g., Near Building A, Ground Floor, Bin #3"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <FileText size={18} color={theme.colors.text} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
              Detailed Description
            </Text>
          </View>
          
          <TextInput
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              minHeight: 100,
              textAlignVertical: 'top'
            }}
            placeholder="Describe the violation in detail..."
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
          />
        </View>

        {/* Photo Evidence */}
        <View style={{ marginBottom: 30 }}>
          <PhotoPicker
            photos={formData.photos}
            onPhotosChange={(photos) => setFormData({ ...formData, photos })}
            title="Evidence Photos (Required)"
            maxPhotos={5}
            titleIcon={<Camera size={18} color={theme.colors.text} />}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: theme.colors.danger,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          <AlertTriangle size={20} color="white" />
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
            Submit Violation Report
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
