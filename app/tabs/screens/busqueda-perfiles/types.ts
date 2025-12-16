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
  ciudad: string;
  latitud?: number;
  longitud?: number;
}

export interface FilterState {
  modalidad: string[];
  maxDistancia: string;
  maxPrecio: string;
  minRating: number;
  profesion: string;
  searchLat?: number | null; 
  searchLong?: number | null;
}