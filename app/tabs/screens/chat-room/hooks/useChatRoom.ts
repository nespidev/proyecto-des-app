import { useState, useEffect, useContext, useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import { uploadFileToSupabase } from "@/utils/media-helper";

export function useChatRoom(conversationId: string) {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;
  const [messages, setMessages] = useState<IMessage[]>([]);

  // 1. Cargar mensajes iniciales + Suscripción Realtime
  useEffect(() => {
    if (!conversationId) return;

    // Carga inicial
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
            text: msg.content,
            createdAt: new Date(msg.created_at),
            user: { _id: msg.sender_id },
            image: msg.media_type === 'image' ? msg.content : undefined,
            video: msg.media_type === 'video' ? msg.content : undefined,
          }))
        );
      }
    };

    fetchMessages();

    // Suscripción a NUEVOS mensajes
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversation_id=eq.${conversationId}` 
      }, (payload) => {
        const newMessage = payload.new;
        // Solo agregamos si NO fui yo quien lo envió (GiftedChat ya agrega el mío localmente)
        if (newMessage.sender_id !== user.id) {
          setMessages((previousMessages) => GiftedChat.append(previousMessages, [{
            _id: newMessage.id,
            text: newMessage.content,
            createdAt: new Date(newMessage.created_at),
            user: { _id: newMessage.sender_id },
            image: newMessage.media_type === 'image' ? newMessage.content : undefined,
          }]));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // 2. Enviar Mensaje (Texto)
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    
    const msg = newMessages[0];
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: msg.text,
      media_type: 'text'
    });

    // Actualizar último mensaje en la conversación (para la lista)
    if (!error) {
      await supabase.from('conversations').update({
        last_message: msg.text,
        last_message_at: new Date().toISOString()
      }).eq('id', conversationId);
    }
  }, [conversationId, user.id]);

  // 3. Enviar Foto/Video
  const onSendMedia = async (asset: any) => {
    if (!asset) return;
    
    // Simular mensaje local mientras sube
    const tempId = Math.random().toString();
    const tempMsg: IMessage = {
      _id: tempId,
      text: '',
      createdAt: new Date(),
      user: { _id: user.id },
      image: asset.uri, // Mostramos local
    };
    setMessages((prev) => GiftedChat.append(prev, [tempMsg]));

    // Subir a Supabase
    try {
        const fileExt = asset.uri.split('.').pop();
        const path = `chat/${conversationId}/${Date.now()}.${fileExt}`;
        const mime = asset.type === 'video' ? `video/${fileExt}` : `image/${fileExt}`;
        
        const publicUrl = await uploadFileToSupabase('chat-media', path, asset.uri, mime);
        
        if (publicUrl) {
            // Guardar en BD
            await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: publicUrl,
                media_type: asset.type === 'video' ? 'video' : 'image'
            });
            
            // Actualizar vista previa conversación
            await supabase.from('conversations').update({
                last_message: asset.type === 'video' ? '🎥 Video' : '📷 Foto',
                last_message_at: new Date().toISOString()
            }).eq('id', conversationId);
        }
    } catch (e) {
        console.error("Error enviando media", e);
    }
  };

  return { messages, onSend, onSendMedia, user };
}