export interface CitizenReport {
  id: string;
  citizenId: string;
  citizenQRData: string;
  reportedBy: string; // worker ID
  reportedAt: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  violationType: ViolationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidencePhotos: string[];
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  pointsDeducted?: number;
  resolutionDate?: string;
}

export type ViolationType = 
  | 'improper_segregation'
  | 'contamination'
  | 'overflowing_bin'
  | 'wrong_bin_usage'
  | 'hazardous_mixing'
  | 'no_segregation'
  | 'dirty_containers'
  | 'illegal_dumping';

export interface ReportFormData {
  violationType: ViolationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  photos: string[];
  location: string;
}
