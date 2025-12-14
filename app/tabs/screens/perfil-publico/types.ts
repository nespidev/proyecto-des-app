export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  total_sessions: number;
  validity_days: number;
  is_active: boolean;
}