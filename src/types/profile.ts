// src/types/profile.ts

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
  created_at: string;
  updated_at: string;
};
