export type CoordinatorApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface CoordinatorApplication {
  id: string;
  user_id: string;
  college_id: string;
  full_name: string;
  whatsapp_number: string;
  email: string;
  reason: string;
  college_id_photo_url: string;
  selfie_url: string;
  status: CoordinatorApplicationStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

