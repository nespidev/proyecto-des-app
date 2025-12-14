// --- TIPOS INTERNOS DEL JSON (Workout) ---
export interface IExercise {
  name: string;
  sets: string;   // String para permitir rangos: "3-4"
  reps: string;   // String para "10-12" o "Fallo"
  weight?: string;
  notes?: string;
  video_url?: string; // Futuro: link a video
}

export interface IWorkoutDay {
  dayName: string; // Ej: "Día A - Pecho/Espalda"
  exercises: IExercise[];
}

// --- TIPOS INTERNOS DEL JSON (Diet) ---
export interface IMealFood {
  name: string;     // Ej: "Pechuga de pollo"
  quantity: string; // Ej: "200g"
}

export interface IMeal {
  time: string; // Ej: "Desayuno" o "08:00"
  foods: IMealFood[];
}

export interface IDietDay {
  dayName: string; // Ej: "Lunes a Viernes" o "Día Alto Carb"
  meals: IMeal[];
}

// --- MODELO PRINCIPAL DE LA DB ---
export interface IPlan {
  id?: string; // Opcional al crear
  client_id: string;
  professional_id: string;
  type: 'workout' | 'diet';
  title: string;
  description?: string;
  content: IWorkoutDay[] | IDietDay[]; // <--- Aquí vive la magia del JSONB
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}