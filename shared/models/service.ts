export interface IService {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  modality?: 'Presencial' | 'Remoto';
  total_sessions?: number; 
  validity_days?: number;
}