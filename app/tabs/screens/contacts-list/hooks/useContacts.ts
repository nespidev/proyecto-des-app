import { useState, useEffect, useContext } from "react";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";

export function useContacts() {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;
  const viewMode = state.viewMode; // Usamos el modo de vista actual

  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchContacts();
  }, [user, viewMode]); // Recargamos si cambia el modo

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      // Logica dinamica basada en el MODO, no solo el rol
      const amIProfessional = viewMode === 'professional';
      
      const myColumn = amIProfessional ? 'professional_id' : 'client_id';
      const theirColumn = amIProfessional ? 'client_id' : 'professional_id';

      //  Consultamos la tabla 'contracts' (donde están las relaciones comerciales)
      // Usamos la sintaxis de Supabase para hacer JOIN con la columna especifica
      const { data: rawData, error } = await supabase
        .from('contracts') 
        .select(`
          ${theirColumn}, 
          other_user:profiles!${theirColumn} (
            id,
            nombre, 
            apellido, 
            avatar_url, 
            rol
          )
        `)
        .eq(myColumn, user.id);

      if (error) throw error;

      //  Filtramos duplicados (puedes tener varios contratos con la misma persona)
      const uniqueContactsMap = new Map();
      
      rawData?.forEach((item: any) => {
        const profile = item.other_user;
        // Solo agregamos si tenemos datos del perfil y no está repetido
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
      // Verificar si ya existe chat (Misma logica que antes)
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_a.eq.${user.id},participant_b.eq.${otherUserId}),and(participant_a.eq.${otherUserId},participant_b.eq.${user.id})`)
        .maybeSingle(); // Usamos maybeSingle para no lanzar error si no existe

      if (existing) return existing.id;

      // Si no existe, crear
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