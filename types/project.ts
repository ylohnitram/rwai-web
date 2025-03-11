export type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export type Project = {
  id: string;
  name: string;
  type: string;
  blockchain: string;
  roi: number;
  description: string;
  tvl: string;
  auditUrl?: string;
  website: string;
  approved: boolean;  // Legacy field, kept for backwards compatibility
  status: ProjectStatus;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // New fields for enhanced admin workflow
  review_notes?: string;
  reviewer_id?: string;
  reviewed_at?: string;
  audit_document_path?: string;
  whitepaper_document_path?: string; // Add this line
  contact_email?: string;

  audit_url?: string;
  whitepaper_url?: string;
};

export type ProjectReview = {
  id: string;
  status: ProjectStatus;
  review_notes?: string;
  reviewer_id?: string;
  reviewed_at?: string;
};

export type Notification = {
  id: string;
  user_id: string;
  project_id: string;
  message: string;
  type: 'approval' | 'rejection' | 'changes_requested' | 'system';
  read: boolean;
  created_at: string;
};
