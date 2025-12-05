export interface IUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'client' | 'professional';
  avatar_url?: string | null;
  telefono?: string | null;
  // ---campos para profesionales ---
  titulo?: string | null;       // Profesion (ej Nutricionista)
  especialidad?: string | null; // El nicho (ej Keto)
}

export class User implements IUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'client' | 'professional';
  avatar_url?: string | null;
  telefono?: string | null;
  titulo?: string | null;
  especialidad?: string | null;

  constructor(
    id: string, 
    nombre: string, 
    apellido: string, 
    email: string, 
    rol: 'client' | 'professional', 
    avatar_url?: string | null,
    telefono?: string | null,
    titulo?: string | null,
    especialidad?: string | null
  ) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.rol = rol;
    this.avatar_url = avatar_url;
    this.telefono = telefono;
    this.titulo = titulo;
    this.especialidad = especialidad;
  }
}