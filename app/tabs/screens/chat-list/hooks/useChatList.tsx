import { useState, useCallback, useContext, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "@/shared/context/auth-context";

export function useChatList() {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;
  const viewMode = state.viewMode;

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      setLoading(true);
      
      // Consultamos la vista
      let query = supabase
        .from('conversations_view') 
        .select('*')
        .order('last_message_at', { ascending: false });


      // Si estoy en modo professional, quiero ver chats donde mi rol es 'professional'
      // Si estoy en modo client, quiero ver chats donde mi rol es 'client'
      if (viewMode) {
        query = query.eq('relationship_role', viewMode);
      }

      const { data, error } = await query;

      if (error) throw error;
      setChats(data || []);
    } catch (err) {
      console.error("Error cargando chats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Agregamos viewMode a las dependencias para recargar al cambiar el switch
  useFocusEffect(
    useCallback(() => {
      if (user) fetchChats();
    }, [user, viewMode]) 
  );

  return { chats, loading, refreshChats: fetchChats };
}