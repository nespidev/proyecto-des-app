import { useState, useContext } from "react";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import { FilterState, ProfesionalCard } from "../types";

const PAGE_SIZE = 10;

export function useProfessionals() {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;

  const [list, setList] = useState<ProfesionalCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialState, setIsInitialState] = useState(true);

  const fetchPro = async (pageNumber: number, query: string, filters: FilterState, isNewSearch: boolean = false) => {
    const hasFilters = filters.modalidad.length > 0 || filters.maxPrecio !== "" || filters.minRating > 0 || filters.profesion !== "" || filters.maxDistancia !== "";
    
    if (query.trim() === "" && !hasFilters) {
      setList([]);
      setIsInitialState(true);
      return;
    }

    setIsInitialState(false);
    
    if (isNewSearch) {
      setList([]); // Limpiamos la lista visualmente para evitar datos viejos
      setLoading(true);
      setLoadingMore(false); // Apagamos el spinner de abajo
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let modalityFilterToSend: string[] | null = null;
      if (filters.modalidad.length > 0) {
        const wantsRemoto = filters.modalidad.includes('Remoto');
        const wantsPresencial = filters.modalidad.includes('Presencial');
        if (wantsRemoto && wantsPresencial) {
          modalityFilterToSend = ['Híbrido'];
        } else {
          modalityFilterToSend = filters.modalidad;
        }
      }

      const rpcParams = {
        user_lat: user?.latitud || null,
        user_long: user?.longitud || null,
        max_dist_km: filters.maxDistancia ? parseFloat(filters.maxDistancia) : null,
        search_text: query.trim() !== "" ? query.trim() : null,
        modality_filter: modalityFilterToSend,
        min_rating: filters.minRating > 0 ? filters.minRating : null,
        max_price: filters.maxPrecio ? parseFloat(filters.maxPrecio) : null,
        profesion_filter: filters.profesion || null,
        page_offset: pageNumber * PAGE_SIZE,
        page_limit: PAGE_SIZE
      };

      const { data, error } = await supabase.rpc('search_professionals', rpcParams);

      if (error) throw error;

      if (data) {
        const formatted: ProfesionalCard[] = data.map((item: any) => ({
          id: item.id,
          nombre: `${item.nombre} ${item.apellido}`,
          avatar_url: item.avatar_url,
          titulo: item.titulo || "Profesional",
          especialidad: item.especialidad || "General",
          bio: item.bio || "",
          precio: item.precio || 0,
          puntuacion: item.puntuacion || 5.0,
          modalidad: item.modalidad || "Remoto",
          ubicacion: item.direccion_legible || "Sin ubicación",
          ciudad: item.ciudad || "Sin ciudad",
          latitud: item.latitud,
          longitud: item.longitud,
        }));

        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }

        if (isNewSearch) {
          setList(formatted);
        } else {
          setList(prevList => {
            const existingIds = new Set(prevList.map(p => p.id));
            const uniqueNewItems = formatted.filter(p => !existingIds.has(p.id));
            return [...prevList, ...uniqueNewItems];
          });
        }
      }
    } catch (err) {
      console.error("Error buscando profesionales:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const search = (query: string, filters: FilterState) => {
    fetchPro(0, query, filters, true);
  };

  const loadMore = (query: string, filters: FilterState) => {
    if (!hasMore || loadingMore || isInitialState) return;
    const nextPage = Math.ceil(list.length / PAGE_SIZE);
    fetchPro(nextPage, query, filters, false);
  };

  return {
    list,
    loading,
    loadingMore,
    isInitialState,
    search,
    loadMore,
    userLocationAvailable: !!(user?.latitud && user?.longitud)
  };
}