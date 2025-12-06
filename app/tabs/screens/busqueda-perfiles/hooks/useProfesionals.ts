import { useState, useEffect, useContext } from "react";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import { FilterState, ProfesionalCard } from "../types";

export function useProfessionals() {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;

  const [allProfessionals, setAllProfessionals] = useState<ProfesionalCard[]>([]);
  const [filteredList, setFilteredList] = useState<ProfesionalCard[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select(`*, profiles (nombre, apellido, avatar_url, latitud, longitud)`);

      if (error) throw error;

      if (data) {
        const formatted: ProfesionalCard[] = data.map((item: any) => ({
          id: item.id,
          nombre: `${item.profiles.nombre} ${item.profiles.apellido}`,
          avatar_url: item.profiles.avatar_url,
          titulo: item.titulo || "Profesional",
          especialidad: item.especialidad || "General",
          bio: item.bio || "Sin descripción.",
          precio: item.precio || 0,
          puntuacion: item.puntuacion || 5.0,
          modalidad: item.modalidad || "Remoto",
          ubicacion: item.ubicacion || "Sin especificar",
          latitud: item.profiles.latitud,
          longitud: item.profiles.longitud,
        }));
        setAllProfessionals(formatted);
        setFilteredList(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (searchQuery: string, filters: FilterState) => {
    let result = allProfessionals;

    // 1. Texto
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(lowerQuery) || 
        p.especialidad.toLowerCase().includes(lowerQuery) ||
        p.titulo.toLowerCase().includes(lowerQuery) ||
        p.bio.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Modalidad
    if (filters.modalidad && filters.modalidad.length > 0) {
      const wantsRemoto = filters.modalidad.includes('Remoto');
      const wantsPresencial = filters.modalidad.includes('Presencial');

      // Si quiere AMBOS, solo mostramos Hibridos
      if (wantsRemoto && wantsPresencial) {
        result = result.filter(p => p.modalidad === 'Híbrido');
      } 
      // Si quiere SOLO Remoto
      else if (wantsRemoto) {
        result = result.filter(p => p.modalidad === 'Remoto' || p.modalidad === 'Híbrido');
      }
      // Si quiere SOLO Presencial
      else if (wantsPresencial) {
        result = result.filter(p => p.modalidad === 'Presencial' || p.modalidad === 'Híbrido');
      }
    }

    // 3. Profesión
    if (filters.profesion.trim() !== "") {
      result = result.filter(p => p.titulo.toLowerCase().includes(filters.profesion.toLowerCase()));
    }

    // 4. Precio
    if (filters.maxPrecio !== "") {
      const maxPrice = parseFloat(filters.maxPrecio);
      if (!isNaN(maxPrice)) result = result.filter(p => p.precio <= maxPrice);
    }

    // 5. Rating
    if (filters.minRating > 0) {
      result = result.filter(p => p.puntuacion >= filters.minRating);
    }

    // 6. Distancia
    if (filters.maxDistancia !== "") {
      const maxDist = parseFloat(filters.maxDistancia);
      if (!isNaN(maxDist) && user?.latitud && user?.longitud) {
        result = result.filter(p => {
          if (!p.latitud || !p.longitud) return false;
          const dist = getDistanceFromLatLonInKm(user.latitud, user.longitud, p.latitud, p.longitud);
          return dist <= maxDist;
        });
      }
    }

    setFilteredList(result);
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  return {
    filteredList,
    loading,
    refreshData: fetchProfessionals,
    applyFilters,
    userLocationAvailable: !!(user?.latitud && user?.longitud)
  };
}