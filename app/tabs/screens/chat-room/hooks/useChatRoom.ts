import { useState, useEffect, useContext, useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import { uploadFileToSupabase } from "@/utils/media-helper";

export function useChatRoom(conversationId: string) {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;
  const [messages, setMessages] = useState<IMessage[]>([]);

  // 1. CARGAR MENSAJES (Mapeando el audio)
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (data) {
        setMessages(
          data.map((msg: any) => ({
            _id: msg.id,
            text: msg.media_type === 'text' ? msg.content : '',
            createdAt: new Date(msg.created_at),
            user: { _id: msg.sender_id },
            image: msg.media_type === 'image' ? msg.content : undefined,
            video: msg.media_type === 'video' ? msg.content : undefined,
            audio: msg.media_type === 'audio' ? msg.content : undefined, // <--- ESTO FALTABA
          }))
        );
      }
    };

    fetchMessages();

    // SUSCRIPCIÓN REALTIME
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversation_id=eq.${conversationId}` 
      }, (payload) => {
        const newMessage = payload.new;
        if (newMessage.sender_id !== user.id) {
          setMessages((previousMessages) => GiftedChat.append(previousMessages, [{
            _id: newMessage.id,
            text: newMessage.media_type === 'text' ? newMessage.content : '',
            createdAt: new Date(newMessage.created_at),
            user: { _id: newMessage.sender_id },
            image: newMessage.media_type === 'image' ? newMessage.content : undefined,
            video: newMessage.media_type === 'video' ? newMessage.content : undefined,
            audio: newMessage.media_type === 'audio' ? newMessage.content : undefined,
          }]));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // ... (onSend y onSendMedia se mantienen igual) ...
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages((prev) => GiftedChat.append(prev, newMessages));
    const msg = newMessages[0];
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId, sender_id: user.id, content: msg.text, media_type: 'text'
    });
    if (!error) {
      await supabase.from('conversations').update({ last_message: msg.text, last_message_at: new Date().toISOString() }).eq('id', conversationId);
    }
  }, [conversationId, user.id]);

  const onSendMedia = async (asset: any) => {
      // ... (Tu lógica existente para fotos/videos)
      // Asegúrate de que use 'chat-media' como bucket
      if (!asset) return;
      // ...
      try {
        const fileExt = asset.uri.split('.').pop();
        const path = `chat/${conversationId}/${Date.now()}.${fileExt}`;
        const mime = asset.type === 'video' ? `video/${fileExt}` : `image/${fileExt}`;
        const publicUrl = await uploadFileToSupabase('chat-media', path, asset.uri, mime);
        if (publicUrl) {
            const type = asset.type === 'video' ? 'video' : 'image';
            await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, content: publicUrl, media_type: type });
            await supabase.from('conversations').update({ last_message: type === 'video' ? '🎥 Video' : '📷 Foto', last_message_at: new Date().toISOString() }).eq('id', conversationId);
        }
      } catch (e) { console.error(e); }
  };

  // 2. NUEVA FUNCIÓN: ENVIAR AUDIO
  // Esta es la pieza que conecta la grabación con la base de datos
  const onSendAudio = async (uri: string, durationMs: number) => {
    console.log("Procesando audio para enviar:", uri);

    // A. Feedback visual inmediato (Optimistic UI)
    const tempMsg: IMessage = {
      _id: Math.random().toString(),
      text: '',
      createdAt: new Date(),
      user: { _id: user.id },
      audio: uri, 
    };
    setMessages((prev) => GiftedChat.append(prev, [tempMsg]));

    try {
        // B. Subir archivo
        const fileExt = 'm4a';
        const path = `chat/${conversationId}/${Date.now()}.m4a`;
        const publicUrl = await uploadFileToSupabase('chat-media', path, uri, 'audio/m4a');

        if (publicUrl) {
            console.log("Audio subido a Supabase:", publicUrl);

            // C. Guardar en BD (ESTO ES LO QUE FALTABA)
            const { error } = await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: publicUrl,
                media_type: 'audio'
            });

            if (error) throw error;

            // D. Actualizar último mensaje
            await supabase.from('conversations').update({
                last_message: '🎤 Mensaje de voz',
                last_message_at: new Date().toISOString()
            }).eq('id', conversationId);
            
            console.log("Mensaje de audio guardado exitosamente");
        } else {
            console.error("Error: uploadFileToSupabase devolvió null");
        }
    } catch (e) {
        console.error("Error crítico enviando audio:", e);
    }
  };

  return { messages, onSend, onSendMedia, onSendAudio, user };
}