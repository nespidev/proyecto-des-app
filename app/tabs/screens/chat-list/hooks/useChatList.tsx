import { useState, useCallback, useContext } from "react";
import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "@/shared/context/auth-context";

export function useChatList() {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      setLoading(true);
      // Consultamos la VISTA, no la tabla. La vista ya filtra por auth.uid()
      const { data, error } = await supabase
        .from('conversations_view') 
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (err) {
      console.error("Error cargando chats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Recargar cada vez que entramos a la pantalla
  useFocusEffect(
    useCallback(() => {
      if (user) fetchChats();
    }, [user])
  );

  return { chats, loading, refreshChats: fetchChats };
}