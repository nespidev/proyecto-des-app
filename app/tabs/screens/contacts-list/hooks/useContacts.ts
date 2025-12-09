import { useState, useEffect, useContext } from "react";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";

export function useContacts() {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      // Determinamos qué columna buscar según el rol
      // Si soy Pro, busco mis clientes. Si soy Cliente, busco mis profesionales.
      const myColumn = user.rol === 'professional' ? 'professional_id' : 'client_id';
      const theirColumn = user.rol === 'professional' ? 'client_id' : 'professional_id';

      // 1. Buscamos IDs únicos en la tabla de contratos
      const { data: contracts, error } = await supabase
        .from('plans') // O 'contracts' si usas esa tabla
        .select(`${theirColumn}, profiles!${theirColumn}(*)`)
        .eq(myColumn, user.id);

      if (error) throw error;

      // 2. Filtramos duplicados (por si tienes varios planes con la misma persona)
      const uniqueContactsMap = new Map();
      contracts?.forEach((c: any) => {
        const profile = c.profiles; // Los datos del otro
        if (profile && !uniqueContactsMap.has(profile.id)) {
          uniqueContactsMap.set(profile.id, profile);
        }
      });

      setContacts(Array.from(uniqueContactsMap.values()));

    } catch (err) {
      console.error("Error cargando contactos:", err);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (otherUserId: string) => {
    try {
      // 1. Verificar si ya existe chat
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_a.eq.${user.id},participant_b.eq.${otherUserId}),and(participant_a.eq.${otherUserId},participant_b.eq.${user.id})`)
        .single();

      if (existing) return existing.id;

      // 2. Si no existe, crear
      const { data: newChat, error } = await supabase
        .from('conversations')
        .insert({
          participant_a: user.id,
          participant_b: otherUserId,
          last_message: 'Nueva conversación',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return newChat.id;

    } catch (err) {
      console.error("Error iniciando chat:", err);
      return null;
    }
  };

  return { contacts, loading, startConversation };
}