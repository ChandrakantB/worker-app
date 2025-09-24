import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';

interface TestQRGeneratorProps {
  onQRGenerated: (qrData: string) => void;
}

export default function TestQRGenerator({ onQRGenerated }: TestQRGeneratorProps) {
  const { theme } = useTheme();

  const generateTestQR = (type: string) => {
    const qrCodes = {
      'citizen1': 'BIN2WIN_CITIZEN_C001_SECTOR4_JAB',
      'citizen2': 'BIN2WIN_CITIZEN_C002_SECTOR5_JAB', 
      'citizen3': 'BIN2WIN_CITIZEN_C003_RESIDENTIAL_JAB',
      'random': `TEST_QR_${Date.now()}`,
      'url': 'https://bin2win.com/citizen/12345',
      'phone': 'tel:+919876543210'
    };
    
    const qrData = qrCodes[type as keyof typeof qrCodes];
    onQRGenerated(qrData);
  };

  return (
    <View style={{
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20
    }}>
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 12
      }}>
        🧪 Test QR Codes (Development)
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[
          { key: 'citizen1', label: 'Citizen 1' },
          { key: 'citizen2', label: 'Citizen 2' },
          { key: 'citizen3', label: 'Citizen 3' },
          { key: 'random', label: 'Random QR' },
          { key: 'url', label: 'URL QR' },
          { key: 'phone', label: 'Phone QR' }
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => generateTestQR(item.key)}
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 6
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={{
        color: theme.colors.textSecondary,
        fontSize: 10,
        marginTop: 8,
        textAlign: 'center'
      }}>
        Tap any button to simulate scanning that QR code
      </Text>
    </View>
  );
}
