export interface ProfesionalCard {
  id: string;
  nombre: string;
  avatar_url: string | null;
  titulo: string;
  especialidad: string;
  bio: string;
  precio: number;
  puntuacion: number;
  modalidad: string;
  ubicacion: string;
  latitud?: number;
  longitud?: number;
}

export interface FilterState {
  modalidad: string[];
  maxDistancia: string;
  maxPrecio: string;
  minRating: number;
  profesion: string;
}