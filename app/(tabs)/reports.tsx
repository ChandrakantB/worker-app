import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import CustomHeader from '../../components/navigation/CustomHeader';
import QRScanner from '../../components/ui/QRScanner';
import CitizenReportForm from '../../components/forms/CitizenReportForm';
import TestQRGenerator from '../../components/ui/TestQRGenerator';
import { CitizenReport, ReportFormData } from '../../types/reports';
import {
  QrCode,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Camera,
  AlertCircle,
  AlertOctagon,
  Shield
} from 'lucide-react-native';

export default function ReportsScreen() {
  const { theme } = useTheme();
  const { worker } = useWorkerData();
  const insets = useSafeAreaInsets();
  
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [scannedQRData, setScannedQRData] = useState('');
  const [submittedReports, setSubmittedReports] = useState<CitizenReport[]>([]);

  // Calculate safe bottom padding for tab bar
  const tabBarHeight = 80;
  const safeBottomPadding = Math.max(insets.bottom + 65, tabBarHeight);

  const handleQRScanned = (qrData: string) => {
    setScannedQRData(qrData);
    setShowQRScanner(false);
    setShowReportForm(true);
  };

  const handleReportSubmit = async (reportData: ReportFormData) => {
    try {
      const newReport: CitizenReport = {
        id: `report_${Date.now()}`,
        citizenId: scannedQRData,
        citizenQRData: scannedQRData,
        reportedBy: worker?.id || '',
        reportedAt: new Date().toISOString(),
        location: {
          address: reportData.location || 'Location not specified',
          coordinates: worker?.currentLocation || { lat: 23.1815, lng: 79.9864 }
        },
        violationType: reportData.violationType,
        severity: reportData.severity,
        description: reportData.description,
        evidencePhotos: reportData.photos,
        status: 'pending'
      };

      setSubmittedReports(prev => [newReport, ...prev]);
      setShowReportForm(false);
      setScannedQRData('');

      Alert.alert(
        'Report Submitted',
        'Violation report has been submitted to admin for review.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'reviewed': return theme.colors.primary;
      case 'resolved': return theme.colors.success;
      case 'dismissed': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'high': return theme.colors.danger;
      case 'critical': return '#8b0000';
      default: return theme.colors.textSecondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return CheckCircle2;
      case 'medium': return AlertCircle;
      case 'high': return AlertTriangle;
      case 'critical': return AlertOctagon;
      default: return AlertCircle;
    }
  };

  const handleMenuPress = () => console.log('Reports menu pressed');

  if (showQRScanner) {
    return (
      <QRScanner
        onQRScanned={handleQRScanned}
        onClose={() => setShowQRScanner(false)}
        isVisible={showQRScanner}
      />
    );
  }

  if (showReportForm) {
    return (
      <CitizenReportForm
        citizenQRData={scannedQRData}
        onSubmit={handleReportSubmit}
        onCancel={() => {
          setShowReportForm(false);
          setScannedQRData('');
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <CustomHeader
        title="Citizens Report"
        subtitle="Report improper waste segregation"
        showNotifications={true}
        showSettings={false}
        showConnectionStatus={false}
        onMenuPress={handleMenuPress}
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: safeBottomPadding + 20 }}
      >
        <View className="p-5">
          {/* Main QR Scanner Button */}
          <TouchableOpacity
            onPress={() => setShowQRScanner(true)}
            className="bg-danger rounded-2xl p-6 items-center mb-5 shadow-lg active:scale-[0.98]"
            activeOpacity={0.8}
          >
            <View className="bg-white/20 rounded-full p-4 mb-4">
              <QrCode size={32} color="white" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">
              Scan Citizen QR Code
            </Text>
            <Text className="text-white/80 text-sm text-center leading-5">
              Scan QR code near citizen's waste collection point to report violations
            </Text>
          </TouchableOpacity>

          {/* Test QR Generator */}
          <View className="mb-5">
            <TestQRGenerator onQRGenerated={handleQRScanned} />
          </View>

          {/* Statistics Cards */}
          <View className="flex-row gap-3 mb-6">
            <View className="bg-card rounded-2xl p-4 flex-1 items-center shadow-sm border border-border">
              <FileText size={20} color={theme.colors.text} className="mb-2" />
              <Text className="text-2xl font-bold text-text mb-1">
                {submittedReports.length}
              </Text>
              <Text className="text-xs text-textSecondary text-center">
                Total Reports
              </Text>
            </View>
            
            <View className="bg-card rounded-2xl p-4 flex-1 items-center shadow-sm border border-border">
              <Clock size={20} color={theme.colors.warning} className="mb-2" />
              <Text className="text-2xl font-bold text-warning mb-1">
                {submittedReports.filter(r => r.status === 'pending').length}
              </Text>
              <Text className="text-xs text-textSecondary text-center">
                Pending
              </Text>
            </View>
            
            <View className="bg-card rounded-2xl p-4 flex-1 items-center shadow-sm border border-border">
              <CheckCircle2 size={20} color={theme.colors.success} className="mb-2" />
              <Text className="text-2xl font-bold text-success mb-1">
                {submittedReports.filter(r => r.status === 'resolved').length}
              </Text>
              <Text className="text-xs text-textSecondary text-center">
                Resolved
              </Text>
            </View>
          </View>

          {/* Reports Section Header */}
          <View className="flex-row items-center mb-4">
            <FileText size={20} color={theme.colors.text} />
            <Text className="text-lg font-bold text-text ml-2">
              Your Reports
            </Text>
          </View>

          {/* Reports List */}
          {submittedReports.length === 0 ? (
            <View className="bg-card rounded-2xl p-6 items-center shadow-sm border border-border">
              <View className="bg-textSecondary/10 rounded-full p-4 mb-4">
                <FileText size={32} color={theme.colors.textSecondary} />
              </View>
              <Text className="text-base text-textSecondary text-center mb-2">
                No reports submitted yet
              </Text>
              <Text className="text-xs text-textSecondary text-center leading-4">
                Scan a citizen's QR code to report waste segregation violations
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {submittedReports.map((report) => {
                const SeverityIcon = getSeverityIcon(report.severity);
                return (
                  <View
                    key={report.id}
                    className="bg-card rounded-2xl p-4 shadow-sm border border-border"
                    style={{ borderLeftWidth: 4, borderLeftColor: getSeverityColor(report.severity) }}
                  >
                    {/* Report Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-base font-bold text-text mb-1">
                          {report.violationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                        <View className="flex-row items-center">
                          <User size={12} color={theme.colors.textSecondary} />
                          <Text className="text-xs text-textSecondary ml-1">
                            QR: {report.citizenQRData.substring(0, 25)}...
                          </Text>
                        </View>
                      </View>
                      <View
                        className="px-2 py-1 rounded-md"
                        style={{ backgroundColor: getReportStatusColor(report.status) }}
                      >
                        <Text className="text-white text-[10px] font-semibold">
                          {report.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Report Description */}
                    <Text className="text-sm text-text mb-3 leading-5">
                      {report.description}
                    </Text>

                    {/* Report Footer */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Calendar size={12} color={theme.colors.textSecondary} />
                        <Text className="text-xs text-textSecondary ml-1">
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center gap-3">
                        {/* Evidence Photos */}
                        {report.evidencePhotos.length > 0 && (
                          <View className="flex-row items-center">
                            <Camera size={12} color={theme.colors.primary} />
                            <Text className="text-xs text-primary ml-1 font-medium">
                              {report.evidencePhotos.length} photo{report.evidencePhotos.length !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        )}

                        {/* Severity Badge */}
                        <View className="flex-row items-center">
                          <SeverityIcon size={12} color={getSeverityColor(report.severity)} />
                          <View
                            className="px-2 py-1 rounded-md ml-1"
                            style={{ backgroundColor: getSeverityColor(report.severity) }}
                          >
                            <Text className="text-white text-[10px] font-semibold">
                              {report.severity.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Help Section */}
          <View className="bg-primary/10 rounded-2xl p-4 mt-6 border border-primary/20">
            <View className="flex-row items-center mb-3">
              <Shield size={20} color={theme.colors.primary} />
              <Text className="text-base font-bold text-text ml-2">
                Reporting Guidelines
              </Text>
            </View>
            <Text className="text-sm text-textSecondary leading-5 mb-2">
              • Only report genuine violations to maintain system integrity
            </Text>
            <Text className="text-sm text-textSecondary leading-5 mb-2">
              • Take clear photos as evidence before submitting
            </Text>
            <Text className="text-sm text-textSecondary leading-5 mb-2">
              • Provide detailed descriptions for faster resolution
            </Text>
            <Text className="text-sm text-textSecondary leading-5">
              • Reports are reviewed by supervisors within 24 hours
            </Text>
          </View>

          {/* Debug Info - Remove in production */}
          <View className="mt-4 p-3 bg-textSecondary/10 rounded-lg">
            <Text className="text-xs text-textSecondary text-center">
              Safe Padding: {safeBottomPadding}px • Tab Height: {tabBarHeight}px
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
