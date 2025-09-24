import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useTheme } from '../../contexts/theme/ThemeContext';

interface QRScannerProps {
  onQRScanned: (data: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

export default function QRScanner({ onQRScanned, onClose, isVisible }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      // Accept ANY QR code - no validation
      onQRScanned(data);
    }
  };

  if (!isVisible) return null;

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text, textAlign: 'center', marginBottom: 20 }}>
          Camera permission is required to scan QR codes
        </Text>
        <TouchableOpacity 
          onPress={getCameraPermissions}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Scan Any QR Code</Text>
            <View style={{ width: 30 }} />
          </View>

          <View style={styles.scanFrame}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              📱 Point camera at any QR code
            </Text>
            <Text style={styles.instructionSubText}>
              Any QR code will work for testing
            </Text>
            
            {scanned && (
              <TouchableOpacity 
                onPress={() => setScanned(false)}
                style={[styles.button, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  title: { color: 'white', fontSize: 18, fontWeight: '600' },
  scanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#3b82f6',
    borderWidth: 4,
    top: -100,
    left: -100,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    right: -100,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -100,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: -100,
    right: -100,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructions: { padding: 20, alignItems: 'center' },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
});
