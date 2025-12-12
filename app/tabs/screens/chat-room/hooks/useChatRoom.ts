import { useState, useEffect, useContext, useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import { uploadFileToSupabase } from "@/utils/media-helper";

// Extendemos la interfaz para soportar la propiedad 'file' sin errores de TypeScript
export interface ICustomMessage extends IMessage {
  file?: {
    url: string;
    type: string;
    name?: string;
  };
}

export function useChatRoom(conversationId: string) {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;
  const [messages, setMessages] = useState<ICustomMessage[]>([]);

  // 1. CARGAR MENSAJES Y SUSCRIPCIÓN REALTIME
  useEffect(() => {
    if (!conversationId) return;

    // Helper para extraer el nombre del archivo de la URL
    // Esto es CRUCIAL para que el PDF se vea al recargar el chat
    const getFileNameFromUrl = (url: string) => {
        try {
            const decoded = decodeURIComponent(url);
            const fullName = decoded.split('/').pop() || "Documento";
            return fullName;
        } catch (e) {
            return "Documento";
        }
    };

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) console.log("Error fetching messages:", error);

      if (data) {
        setMessages(
          data.map((msg: any) => ({
            _id: msg.id,
            text: msg.media_type === 'text' ? msg.content : '',
            createdAt: new Date(msg.created_at),
            user: { _id: msg.sender_id },
            image: msg.media_type === 'image' ? msg.content : undefined,
            video: msg.media_type === 'video' ? msg.content : undefined,
            audio: msg.media_type === 'audio' ? msg.content : undefined,
            
            // Reconstruimos el objeto file con el nombre extraído
            file: msg.media_type === 'document' ? { 
                url: msg.content, 
                type: 'document',
                name: getFileNameFromUrl(msg.content) 
            } : undefined
          }))
        );
      }
    };

    fetchMessages();
    
    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversation_id=eq.${conversationId}` 
      }, (payload) => {
        const newMessage = payload.new;
        // Solo agregamos si no es nuestro (los nuestros los agregamos optimísticamente en onSend)
        if (newMessage.sender_id !== user.id) {
          setMessages((previousMessages) => GiftedChat.append(previousMessages, [{
            _id: newMessage.id,
            text: newMessage.media_type === 'text' ? newMessage.content : '',
            createdAt: new Date(newMessage.created_at),
            user: { _id: newMessage.sender_id },
            image: newMessage.media_type === 'image' ? newMessage.content : undefined,
            video: newMessage.media_type === 'video' ? newMessage.content : undefined,
            audio: newMessage.media_type === 'audio' ? newMessage.content : undefined,
            // Aplicamos la misma lógica para archivos en tiempo real
            file: newMessage.media_type === 'document' ? { 
                url: newMessage.content, 
                type: 'document',
                name: getFileNameFromUrl(newMessage.content) 
            } : undefined
          }] as ICustomMessage[]));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };

  }, [conversationId]);

  // 2. ENVIAR TEXTO
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

  // 3. ENVIAR FOTOS/VIDEOS
  const onSendMedia = async (asset: any) => {
      if (!asset) return;
      
      const tempId = Math.random().toString();
      const tempMsg: ICustomMessage = {
        _id: tempId, text: '', createdAt: new Date(), user: { _id: user.id },
        image: asset.type === 'video' ? undefined : asset.uri,
        video: asset.type === 'video' ? asset.uri : undefined,
      };
      setMessages((prev) => GiftedChat.append(prev, [tempMsg]));

      try {
        const uri = asset.uri;
        const fileExt = uri.split('.').pop() || 'jpg';
        const path = `chat/${conversationId}/${Date.now()}.${fileExt}`;
        
        let mime = asset.mimeType;
        if (!mime) {
             mime = asset.type === 'video' ? `video/${fileExt}` : `image/${fileExt}`;
        }

        const publicUrl = await uploadFileToSupabase('chat-media', path, uri, mime);
        
        if (publicUrl) {
            const type = asset.type === 'video' || (asset.mediaType === 'videos') ? 'video' : 'image';
            
            await supabase.from('messages').insert({ 
                conversation_id: conversationId, 
                sender_id: user.id, 
                content: publicUrl, 
                media_type: type 
            });
            
            await supabase.from('conversations').update({ 
                last_message: type === 'video' ? '🎥 Video' : '📷 Foto', 
                last_message_at: new Date().toISOString() 
            }).eq('id', conversationId);
        }
      } catch (e) { console.error("Error enviando media:", e); }
  };

  // 4. ENVIAR AUDIO (Notas de voz)
  const onSendAudio = async (uri: string, durationMs: number) => {
    const tempMsg: ICustomMessage = {
      _id: Math.random().toString(),
      text: '', createdAt: new Date(), user: { _id: user.id },
      audio: uri, 
    };
    setMessages((prev) => GiftedChat.append(prev, [tempMsg]));

    try {
        const path = `chat/${conversationId}/${Date.now()}.m4a`;
        const publicUrl = await uploadFileToSupabase('chat-media', path, uri, 'audio/m4a');

        if (publicUrl) {
            await supabase.from('messages').insert({
                conversation_id: conversationId, sender_id: user.id, content: publicUrl, media_type: 'audio'
            });
            await supabase.from('conversations').update({
                last_message: '🎤 Mensaje de voz', last_message_at: new Date().toISOString()
            }).eq('id', conversationId);
        }
    } catch (e) { console.error("Error enviando audio:", e); }
  };

  // 5. ENVIAR DOCUMENTO (Archivos y Audios externos)
  const onSendDocument = async (doc: { uri: string, name: string, mimeType: string }) => {
      // Detectar si es un audio externo (ej. MP3 seleccionado del explorador)
      const isAudioFile = doc.mimeType.startsWith('audio/');
      
      const tempMsg: ICustomMessage = {
          _id: Math.random().toString(), 
          text: '', 
          createdAt: new Date(), 
          user: { _id: user.id },
      };

      if (isAudioFile) {
          tempMsg.audio = doc.uri; 
      } else {
          // Asignación correcta con el tipo obligatorio
          tempMsg.file = { 
              url: doc.uri, 
              name: doc.name,
              type: 'document' 
          }; 
      }
      
      setMessages((prev) => GiftedChat.append(prev, [tempMsg]));

      try {
          // Limpiamos el nombre para que sea seguro en la URL
          const safeName = doc.name.replace(/[^a-zA-Z0-9.]/g, "_");
          const path = `chat/${conversationId}/${Date.now()}_${safeName}`;
          
          const publicUrl = await uploadFileToSupabase('chat-media', path, doc.uri, doc.mimeType);

          if (publicUrl) {
              const mediaType = isAudioFile ? 'audio' : 'document';
              
              await supabase.from('messages').insert({
                  conversation_id: conversationId, 
                  sender_id: user.id, 
                  content: publicUrl, 
                  media_type: mediaType
              });

              const label = isAudioFile ? '🎵 Archivo de Audio' : '📄 Archivo adjunto';
              await supabase.from('conversations').update({
                  last_message: label, last_message_at: new Date().toISOString()
              }).eq('id', conversationId);
          }
      } catch (e) { console.error("Error enviando documento:", e); }
  };

  return { messages, onSend, onSendMedia, onSendAudio, onSendDocument, user };
}