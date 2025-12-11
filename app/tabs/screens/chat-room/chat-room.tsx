import React, { useState, useMemo, useLayoutEffect } from "react";
import { View, Platform, KeyboardAvoidingView } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { materialColors } from "@/utils/colors";
import { useChatRoom } from "./hooks/useChatRoom";
import { selectMediaFromGallery } from "@/utils/media-helper";
import { Ionicons } from "@expo/vector-icons";
import MediaViewerModal from "@/components/MediaViewerModal";
import { 
  renderBubble, renderTime, renderInputToolbar, renderSend, 
  createRenderActions, createRenderMessageImage, createRenderMessageVideo, createRenderMessageAudio,
  chatStyles 
} from "@/utils/chatConfig";

export default function ChatRoom() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight(); 
  const { conversationId, userName } = route.params; 
  
  const { messages, onSend, onSendMedia, user } = useChatRoom(conversationId);
  
  // Estado: ID del mensaje seleccionado para el visor
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);

  //  GENERAR PLAYLIST (Logica de negocio)
  const mediaPlaylist = useMemo(() => {
    return messages
      .filter(m => m.image || m.video || m.audio)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages]);

  const currentIndex = mediaPlaylist.findIndex(m => m._id === selectedMsgId);
  const currentMediaMsg = mediaPlaylist[currentIndex];

  useLayoutEffect(() => {
    navigation.setOptions({ title: userName || "Chat" });
  }, [navigation, userName]);


  const handleNext = () => {
    if (currentIndex < mediaPlaylist.length - 1) setSelectedMsgId(mediaPlaylist[currentIndex + 1]._id as string);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setSelectedMsgId(mediaPlaylist[currentIndex - 1]._id as string);
  };

  const handleAttachment = async () => {
    const asset = await selectMediaFromGallery({ mediaType: 'All', quality: 0.5 });
    if (asset) onSendMedia(asset);
  };

  const openViewer = (id: string) => setSelectedMsgId(id);

  return (
    <SafeAreaView style={chatStyles.container} edges={['bottom', 'left', 'right']}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{ _id: user.id }}

          keyboardAvoidingViewProps={{
          keyboardVerticalOffset: Platform.OS === "ios" ? 0 : 100,
          behavior: Platform.OS === "ios" ? "padding" : "height", 
          style: { flex: 1 }
        }}
          renderBubble={renderBubble}
          renderTime={renderTime}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          
          renderActions={createRenderActions(handleAttachment)}
          renderMessageImage={createRenderMessageImage(openViewer)}
          renderMessageVideo={createRenderMessageVideo(openViewer)}
          renderMessageAudio={createRenderMessageAudio(openViewer)}
          
          textInputProps={{
              style: chatStyles.textInput,
              placeholderTextColor: '#aaa',
              placeholder: "Escribe un mensaje...", 
              selectionColor: materialColors.schemes.light.primary,
              blurOnSubmit: false
          }}
          isScrollToBottomEnabled={true} 
          scrollToBottomComponent={() => <Ionicons name="chevron-down" size={24} color="#666" />}
        />

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