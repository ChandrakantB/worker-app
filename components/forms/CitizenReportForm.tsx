import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { ViolationType, ReportFormData } from '../../types/reports';
import PhotoPicker from '../ui/PhotoPicker';

interface CitizenReportFormProps {
  citizenQRData: string;
  onSubmit: (reportData: ReportFormData) => void;
  onCancel: () => void;
}

export default function CitizenReportForm({ citizenQRData, onSubmit, onCancel }: CitizenReportFormProps) {
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState<ReportFormData>({
    violationType: 'improper_segregation',
    severity: 'medium',
    description: '',
    photos: [],
    location: ''
  });

  const violationTypes = [
    { key: 'improper_segregation', label: 'Improper Segregation', icon: '🗂️', color: theme.colors.warning },
    { key: 'contamination', label: 'Cross Contamination', icon: '☢️', color: theme.colors.danger },
    { key: 'overflowing_bin', label: 'Overflowing Bin', icon: '🗑️', color: theme.colors.warning },
    { key: 'wrong_bin_usage', label: 'Wrong Bin Usage', icon: '❌', color: theme.colors.danger },
    { key: 'hazardous_mixing', label: 'Hazardous Mixing', icon: '⚠️', color: theme.colors.danger },
    { key: 'no_segregation', label: 'No Segregation', icon: '🚫', color: theme.colors.danger },
    { key: 'dirty_containers', label: 'Dirty Containers', icon: '🧽', color: theme.colors.warning },
    { key: 'illegal_dumping', label: 'Illegal Dumping', icon: '🚮', color: theme.colors.danger }
  ];

  const severityLevels = [
    { key: 'low', label: 'Low', color: theme.colors.success, description: 'Minor violation, education needed' },
    { key: 'medium', label: 'Medium', color: theme.colors.warning, description: 'Moderate violation, warning issued' },
    { key: 'high', label: 'High', color: theme.colors.danger, description: 'Serious violation, penalty required' },
    { key: 'critical', label: 'Critical', color: '#8b0000', description: 'Severe violation, immediate action' }
  ];

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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{
        backgroundColor: theme.colors.danger,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={{ color: 'white', fontSize: 16 }}>✕ Cancel</Text>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            🚨 Report Violation
          </Text>
          <View style={{ width: 60 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Citizen Info */}
        <View style={{
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.primary
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
            👤 Reporting Against
          </Text>
          <Text style={{ color: theme.colors.text, marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Citizen ID:</Text> {citizenInfo.displayName}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            📍 {citizenInfo.area}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 8 }}>
            QR: {citizenQRData.substring(0, 20)}...
          </Text>
        </View>

        {/* Violation Type Selection */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 }}>
            🗂️ Violation Type
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {violationTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                onPress={() => setFormData({ ...formData, violationType: type.key as ViolationType })}
                style={{
                  backgroundColor: formData.violationType === type.key ? type.color : theme.colors.card,
                  borderRadius: 8,
                  padding: 12,
                  borderWidth: 2,
                  borderColor: formData.violationType === type.key ? type.color : theme.colors.border,
                  minWidth: '45%',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 16, marginBottom: 4 }}>{type.icon}</Text>
                <Text style={{
                  color: formData.violationType === type.key ? 'white' : theme.colors.text,
                  fontSize: 12,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Severity Selection */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 }}>
            ⚠️ Severity Level
          </Text>
          {severityLevels.map((level) => (
            <TouchableOpacity
              key={level.key}
              onPress={() => setFormData({ ...formData, severity: level.key as any })}
              style={{
                backgroundColor: formData.severity === level.key ? level.color + '20' : theme.colors.card,
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                borderWidth: 2,
                borderColor: formData.severity === level.key ? level.color : theme.colors.border,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: level.color,
                marginRight: 12
              }} />
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
              {formData.severity === level.key && (
                <Text style={{ color: level.color, fontSize: 16 }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Location Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
            📍 Specific Location
          </Text>
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
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
            📝 Detailed Description
          </Text>
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
            title="📸 Evidence Photos (Required)"
            maxPhotos={5}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: theme.colors.danger,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            🚨 Submit Violation Report
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
