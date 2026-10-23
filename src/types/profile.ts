// src/types/profile.ts

import type { CoBrandingConfig } from '../features/smart-debito/types';

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  company_name: string | null;
  role: string | null;
  job_title: string | null;
  nif: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  plan: 'free' | 'plus' | 'pro' | 'ultra' | 'enterprise';
  credits?: number;
  co_branding?: CoBrandingConfig;
  created_at: string;
  updated_at: string;
};

export interface PendingRegistrationData {
  firstName?: string;
  lastName?: string;
  email: string;
  companyName?: string;
  isRegistration?: boolean;
}
