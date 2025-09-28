// Reports.tsx (Updated with improved navigation and success handling)
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import CustomHeader from '../../components/navigation/CustomHeader';
import QRScanner from '../../components/ui/QRScanner';
import CitizenReportForm from '../../components/forms/CitizenReportForm';
import { CitizenReport, ReportFormData } from '../../types/reports';
import {
  QrCode,
  FileText,
  Clock,
  CheckCircle2,
  User,
  Shield,
  Camera as CameraIcon,
} from 'lucide-react-native';

export default function Reports() {
  const { theme } = useTheme();
  const { worker } = useWorkerData();

  const insets = useSafeAreaInsets();
  const [showScanner, setShowScanner] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [reports, setReports] = useState<CitizenReport[]>([]);

  const tabBarHeight = 80;
  const safePadding = Math.max(insets.bottom + 65, tabBarHeight) + 50;

  function handleQRScanned(data: string) {
    setScannedData(data);
    setShowScanner(false);
    setShowReportForm(true);
  }

  async function handleReportSubmit(formData: ReportFormData) {
    try {
      if (!formData.description.trim()) {
        Alert.alert('Validation Error', 'Please enter a description');
        return;
      }
      
      const newReport: CitizenReport = {
        id: `report_${Date.now()}`,
        citizenId: scannedData,
        citizenQRData: scannedData,
        reportedBy: worker?.id ?? '',
        reportedAt: new Date().toISOString(),
        violationType: formData.violationType,
        severity: formData.severity,
        description: formData.description,
        evidencePhotos: formData.photos,
        status: 'pending',
        location: {
          address: formData.location || 'Location not specified',
          coordinates: worker?.currentLocation ?? { lat: 23.181, lng: 79.986 },
        },
      };
      
      // Add report to list
      setReports((old) => [newReport, ...old]);
      
      // Close form and reset state
      setShowReportForm(false);
      setScannedData('');
      
      // Show success message
      Alert.alert(
        'Report Submitted Successfully',
        `Report for QR code ${scannedData.substring(0, 10)}... has been submitted for review.`,
        [{ 
          text: 'OK',
          onPress: () => {
            // Optional: Scroll to top to show new report
            console.log('Report added successfully');
          }
        }]
      );
    } catch (error) {
      Alert.alert('Submission Error', 'Failed to submit report. Please try again.');
    }
  }

  function handleReportCancel() {
    setShowReportForm(false);
    setScannedData('');
    // No alert needed, just return to reports screen
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'reviewed': return theme.colors.primary;
      case 'resolved': return theme.colors.success;
      case 'dismissed': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'low': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'high': return theme.colors.danger;
      case 'critical': return '#8b0000';
      default: return theme.colors.textSecondary;
    }
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case 'low': return CheckCircle2;
      case 'medium': return Clock;
      case 'high': return CameraIcon;
      case 'critical': return CameraIcon;
      default: return Clock;
    }
  }

  if (showScanner) {
    return (
      <QRScanner
        isVisible={showScanner}
        onScanned={handleQRScanned}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  if (showReportForm) {
    return (
      <CitizenReportForm
        citizenQRData={scannedData}
        onSubmit={handleReportSubmit}
        onCancel={handleReportCancel}
        // Add 50px bottom padding for submit button visibility
        extraBottomPadding={50}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <CustomHeader
        title="Citizens Report"
        subtitle="Report improper waste segregation"
        showNotifications
        onMenuPress={() => console.log('Menu Clicked')}
        onNotificationPress={() => console.log('Notifications Clicked')}
      />
      
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: safePadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* Scan QR Button */}
        <TouchableOpacity
          onPress={() => setShowScanner(true)}
          style={{
            backgroundColor: theme.colors.danger,
            borderRadius: 24,
            padding: 24,
            alignItems: 'center',
            marginBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
          activeOpacity={0.8}
        >
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 50,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <QrCode size={32} color="white" />
          </View>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 6 }}>
            Scan Citizen QR Code
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' }}>
            Scan a QR code near citizen's waste point to report violations.
          </Text>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          <StatCard
            label="Total Reports"
            count={reports.length}
            icon={<FileText size={20} color={theme.colors.text} />}
            color={theme.colors.text}
          />
          <StatCard
            label="Pending"
            count={reports.filter((r) => r.status === 'pending').length}
            icon={<Clock size={20} color={theme.colors.warning} />}
            color={theme.colors.warning}
          />
          <StatCard
            label="Resolved"
            count={reports.filter((r) => r.status === 'resolved').length}
            icon={<CheckCircle2 size={20} color={theme.colors.success} />}
            color={theme.colors.success}
          />
        </View>

        {/* Reports List */}
        {reports.length === 0 ? (
          <NoReports theme={theme} />
        ) : (
          reports.map((report) => (
            <ReportItem
              key={report.id}
              report={report}
              theme={theme}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
              getSeverityIcon={getSeverityIcon}
            />
          ))
        )}

        {/* Guidelines */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: theme.colors.primary + '20',
            padding: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.colors.primary + '50',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Shield size={24} color={theme.colors.primary} />
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.colors.text, marginLeft: 12 }}>
              Reporting Guidelines
            </Text>
          </View>
          <Text style={{ marginBottom: 8, color: theme.colors.textSecondary }}>
            • Only report genuine violations to maintain system integrity
          </Text>
          <Text style={{ marginBottom: 8, color: theme.colors.textSecondary }}>
            • Take clear photos as evidence before submitting
          </Text>
          <Text style={{ marginBottom: 8, color: theme.colors.textSecondary }}>
            • Provide detailed descriptions for faster resolution
          </Text>
          <Text style={{ color: theme.colors.textSecondary }}>
            • Reports are reviewed by supervisors within 24 hours
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, count, icon, color }: { label: string; count: number; icon: JSX.Element; color: string }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 20,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      {icon}
      <Text style={{ fontSize: 26, color, fontWeight: 'bold', marginTop: 8 }}>{count}</Text>
      <Text style={{ color: '#666', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function NoReports({ theme }: { theme: any }) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginBottom: 60,
      }}
    >
      <FileText size={60} color={theme.colors.textSecondary} style={{ marginBottom: 20 }} />
      <Text style={{ fontSize: 18, color: theme.colors.textSecondary, marginBottom: 15, textAlign: 'center' }}>
        No reports submitted yet
      </Text>
      <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
        Scan a QR code near a citizen's waste point to report violations.
      </Text>
    </View>
  );
}

function ReportItem({ report, theme, getSeverityColor, getStatusColor, getSeverityIcon }: any) {
  const SeverityIcon = getSeverityIcon(report.severity);

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 6,
        borderLeftColor: getSeverityColor(report.severity),
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ maxWidth: '75%', marginRight: 20 }}>
          <Text style={{ color: '#333', fontSize: 20, fontWeight: 'bold' }}>
            {report.violationType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <User size={14} color="#999" />
            <Text style={{ marginLeft: 7, fontSize: 14, color: '#999' }} numberOfLines={1}>
              QR: {report.citizenQRData}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: getStatusColor(report.status),
            borderRadius: 10,
            paddingVertical: 5,
            paddingHorizontal: 15,
            justifyContent: 'center',
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
            {report.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={{ color: '#555', fontSize: 16, marginBottom: 14, lineHeight: 23 }}>
        {report.description}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Clock size={16} color="#999" />
          <Text style={{ marginLeft: 8, fontSize: 14, color: '#999' }}>
            {new Date(report.reportedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {report.evidencePhotos.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CameraIcon size={16} color={theme.colors.primary} />
              <Text
                style={{
                  marginLeft: 8,
                  color: theme.colors.primary,
                  fontWeight: '600',
                  fontSize: 14,
                }}
              >
                {report.evidencePhotos.length} photo{report.evidencePhotos.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SeverityIcon size={16} color={getSeverityColor(report.severity)} />
            <View
              style={{
                backgroundColor: getSeverityColor(report.severity),
                borderRadius: 12,
                paddingVertical: 3,
                paddingHorizontal: 10,
                marginLeft: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                {report.severity.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
