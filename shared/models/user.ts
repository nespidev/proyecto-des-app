export interface IUser {
  // --- Datos Base (Tabla profiles) ---
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'client' | 'professional';
  avatar_url?: string | null;
  telefono?: string | null;
  
  // --- Geolocalización (Tabla profiles - Futuro Mapa) ---
  latitud?: number | null;
  longitud?: number | null;
  direccion_legible?: string | null;
  ciudad?: string | null;

  // --- Datos Físicos (Tabla profiles - Solo Alumnos) ---
  peso?: number | null;
  altura?: number | null;
  fecha_actualizacion_peso?: string | null;
  fecha_nacimiento?: string | null;

  // --- Datos Profesionales (Tabla professionals - Solo Coach) ---
  titulo?: string | null;       // Ej: Nutricionista
  especialidad?: string | null; // Ej: Keto
  bio?: string | null;          // Descripción larga
  modalidad?: string | null;    // Online/Presencial
  puntuacion?: number | null;   // Rating (ej: 4.8)
  anios_experiencia?: number | null;
}

export class User implements IUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'client' | 'professional';
  avatar_url?: string | null;
  telefono?: string | null;

  latitud?: number | null;
  longitud?: number | null;
  direccion_legible?: string | null;
  ciudad?: string | null;

  peso?: number | null;
  altura?: number | null;
  fecha_actualizacion_peso?: string | null;
  fecha_nacimiento?: string | null;

  titulo?: string | null;
  especialidad?: string | null;
  bio?: string | null;
  modalidad?: string | null;
  puntuacion?: number | null;
  anios_experiencia?: number | null;

  constructor(data: IUser) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.email = data.email;
    this.rol = data.rol;
    this.avatar_url = data.avatar_url;
    this.telefono = data.telefono;
    
    // Geo
    this.latitud = data.latitud;
    this.longitud = data.longitud;
    this.direccion_legible = data.direccion_legible;
    this.ciudad = data.ciudad;

    // Físicos
    this.peso = data.peso;
    this.altura = data.altura;
    this.fecha_actualizacion_peso = data.fecha_actualizacion_peso;
    this.fecha_nacimiento = data.fecha_nacimiento;

    // Profesional
    this.titulo = data.titulo;
    this.especialidad = data.especialidad;
    this.bio = data.bio;
    this.modalidad = data.modalidad;
    this.puntuacion = data.puntuacion;
    this.anios_experiencia = data.anios_experiencia;
  }
}