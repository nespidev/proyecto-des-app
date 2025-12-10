import React, { useState, useLayoutEffect } from "react";
import { View, Platform, KeyboardAvoidingView, StatusBar } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { materialColors } from "@/utils/colors";
import { useChatRoom } from "./hooks/useChatRoom";
import { selectMediaFromGallery } from "@/utils/media-helper";
import { Ionicons } from "@expo/vector-icons";
import MediaViewerModal from "@/components/MediaVieweModal";
import { 
  renderBubble, renderTime, renderInputToolbar, renderSend, renderMessageAudio,
  createRenderActions, createRenderMessageImage, createRenderMessageVideo,
  chatStyles 
} from "@/utils/chatConfig";

export default function ChatRoom() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight(); 
  const { conversationId, userName } = route.params; 
  
  const { messages, onSend, onSendMedia, user } = useChatRoom(conversationId);
  const [mediaViewer, setMediaViewer] = useState<{ uri: string, type: 'image' | 'video' } | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: userName || "Chat" });
  }, [navigation, userName]);

  const handleAttachment = async () => {
    const asset = await selectMediaFromGallery({ mediaType: 'All', quality: 0.5 });
    if (asset) onSendMedia(asset);
  };

  // Callbacks para abrir el visor
  const onImagePress = (uri: string) => setMediaViewer({ uri, type: 'image' });
  const onVideoPress = (uri: string) => setMediaViewer({ uri, type: 'video' });

  return (
    <SafeAreaView style={chatStyles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS === "ios"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{ _id: user.id }}
          
          // Renderizadores estaticos
          renderBubble={renderBubble}
          renderTime={renderTime}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          renderMessageAudio={renderMessageAudio}
          
          // Renderizadores dinamicos (Fabricas)
          renderActions={createRenderActions(handleAttachment)}
          renderMessageImage={createRenderMessageImage(onImagePress)}
          renderMessageVideo={createRenderMessageVideo(onVideoPress)}
          
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
      </KeyboardAvoidingView>

      <MediaViewerModal 
        visible={mediaViewer !== null} 
        media={mediaViewer} 
        onClose={() => setMediaViewer(null)} 
      />
    </SafeAreaView>
  );
}