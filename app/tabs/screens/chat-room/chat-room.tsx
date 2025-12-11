import React, { useState, useMemo, useLayoutEffect, useCallback } from "react";
import { Platform, KeyboardAvoidingView, View } from "react-native";
import { GiftedChat, Send } from "react-native-gifted-chat";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Hooks y Utils
import { useChatRoom } from "./hooks/useChatRoom";
import { selectMediaFromGallery, uploadFileToSupabase } from "@/utils/media-helper";
import { materialColors } from "@/utils/colors";

// Componentes
import MediaViewerModal from "@/components/MediaViewerModal";
import AudioRecorder from "@/components/AudioRecorder";

// Configuración de Chat
import { 
  renderBubble, 
  renderTime, 
  renderInputToolbar, 
  createRenderActions, 
  createRenderMessageImage, 
  createRenderMessageVideo, 
  createRenderMessageAudio,
  chatStyles 
} from "@/utils/chatConfig";

export default function ChatRoom() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const { conversationId, userName } = route.params; 
  
  const { messages, onSend, onSendMedia, onSendAudio, user } = useChatRoom(conversationId);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");

  // --- GALERÍA ---
  const mediaPlaylist = useMemo(() => {
    return messages
      .filter(m => m.image || m.video || m.audio)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages]);

  const currentIndex = mediaPlaylist.findIndex(m => m._id === selectedMsgId);
  const currentMediaMsg = mediaPlaylist[currentIndex];

  const handleNext = () => {
    if (currentIndex < mediaPlaylist.length - 1) setSelectedMsgId(mediaPlaylist[currentIndex + 1]._id as string);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setSelectedMsgId(mediaPlaylist[currentIndex - 1]._id as string);
  };
  const openViewer = (id: string) => setSelectedMsgId(id);

  // --- HANDLERS ---
  useLayoutEffect(() => {
    navigation.setOptions({ title: userName || "Chat" });
  }, [navigation, userName]);

  // Memoizamos este handler para que no cambie la referencia de createRenderActions
  const handleAttachment = useCallback(async () => {
    const asset = await selectMediaFromGallery({ mediaType: 'All', quality: 0.5 });
    if (asset) onSendMedia(asset);
  }, [onSendMedia]);


  const handleSendAudio = async (uri: string, duration: number) => {
    // 2. Llamamos directamente a la función del hook que guarda en BD
    await onSendAudio(uri, duration); 
  };

  // --- RENDERIZADORES OPTIMIZADOS (La clave del NO parpadeo) ---

  // 1. Usamos useCallback sin depender de 'inputText'
  // GiftedChat inyecta el texto actual en 'props.text' automáticamente
  const renderSendOrRecord = useCallback((props: any) => {
    // Leemos el texto desde las props que nos da la librería
    const text = props.text || '';
    
    if (text.trim().length > 0) {
      return (
        <Send {...props} containerStyle={{justifyContent: 'center', marginRight: 10}}>
          <View style={chatStyles.sendButton}>
            <Ionicons name="send" size={18} color="#fff" />
          </View>
        </Send>
      );
    } else {
      return (
        <View style={{ justifyContent: 'center', marginRight: 10 }}>
          <AudioRecorder onSendAudio={handleSendAudio} />
        </View>
      );
    }
  }, [handleSendAudio]); // Solo depende de la función de audio (que ya es estable)

  // 2. Optimizamos las fábricas para que no se recreen en cada render
  const renderActions = useMemo(() => createRenderActions(handleAttachment), [handleAttachment]);
  const renderMsgImage = useMemo(() => createRenderMessageImage(openViewer), []);
  const renderMsgVideo = useMemo(() => createRenderMessageVideo(openViewer), []);
  const renderMsgAudio = useMemo(() => createRenderMessageAudio(openViewer), []);

  return (
    <SafeAreaView style={chatStyles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS === "ios"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        <GiftedChat
          // Layout
          keyboardAvoidingViewProps={{
            keyboardVerticalOffset: Platform.OS === "ios" ? 0 : 100,
            behavior: Platform.OS === "ios" ? "padding" : "height", 
            style: { flex: 1 }
          }}
          
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{ _id: user.id }}
          
          // Renderizadores
          renderBubble={renderBubble}
          renderTime={renderTime}
          renderInputToolbar={renderInputToolbar}
          
          // Renderizador ESTABLE (Magia del botón)
          renderSend={renderSendOrRecord} 
          
          renderActions={renderActions}
          renderMessageImage={renderMsgImage}
          renderMessageVideo={renderMsgVideo}
          renderMessageAudio={renderMsgAudio}
          
          // Control del Input
          // Pasamos el texto para que GiftedChat lo tenga en su estado interno
          text={inputText}
          
          // Configuración Visual del Input
          textInputProps={{
              style: chatStyles.textInput,
              placeholderTextColor: '#aaa',
              // Actualizamos nuestro estado local, pero NO recreamos los renderizadores
              onChangeText: setInputText, 
              value: inputText,
              placeholder: "Escribe un mensaje...", 
              selectionColor: materialColors.schemes.light.primary,
              blurOnSubmit: false
          }}
          
          isScrollToBottomEnabled={true} 
          scrollToBottomComponent={() => <Ionicons name="chevron-down" size={24} color="#666" />}
        />
      </KeyboardAvoidingView>

      <MediaViewerModal 
        visible={selectedMsgId !== null} 
        currentMessage={currentMediaMsg}
        onClose={() => setSelectedMsgId(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={currentIndex < mediaPlaylist.length - 1}
        hasPrev={currentIndex > 0}
        positionInfo={`${currentIndex + 1} / ${mediaPlaylist.length}`}
      />
    </SafeAreaView>
  );
}