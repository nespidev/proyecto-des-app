import React, { useState, useMemo, useLayoutEffect, useCallback } from "react";
import { Platform, KeyboardAvoidingView, View } from "react-native";
import { GiftedChat, Send } from "react-native-gifted-chat";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Hooks y Utils
import { useChatRoom } from "./hooks/useChatRoom";
import { selectMediaFromGallery, takeMediaFromCamera, pickDocument } from "@/utils/media-helper";
import { materialColors } from "@/utils/colors";

// Componentes
import MediaViewerModal from "@/components/MediaViewerModal";
import AudioRecorder from "@/components/AudioRecorder";
import AttachmentModal from "@/components/AttachmentModal";

// Configuración de Chat
import { 
  renderBubble, 
  renderTime, 
  renderInputToolbar, 
  createRenderActions, 
  createRenderMessageImage, 
  createRenderMessageVideo, 
  createRenderMessageAudio,
  renderCustomView, // <--- Asegúrate de que esto esté importado
  chatStyles 
} from "@/utils/chatConfig";

export default function ChatRoom() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const { conversationId, userName } = route.params; 
  
  const { messages, onSend, onSendMedia, onSendAudio, onSendDocument, user } = useChatRoom(conversationId);
  
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isAttachmentVisible, setAttachmentVisible] = useState(false);

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

  useLayoutEffect(() => {
    navigation.setOptions({ title: userName || "Chat" });
  }, [navigation, userName]);

  const handleAttachmentPress = useCallback(() => {
    setAttachmentVisible(true);
  }, []);

  const handleOptionSelect = async (option: 'camera_photo' | 'camera_video' | 'gallery' | 'document') => {
    setAttachmentVisible(false);

    try {
        switch (option) {
            case 'gallery':
                const galleryAsset = await selectMediaFromGallery();
                if (galleryAsset) onSendMedia(galleryAsset);
                break;
            case 'camera_photo':
                const photoAsset = await takeMediaFromCamera(false); 
                if (photoAsset) onSendMedia(photoAsset);
                break;
            case 'camera_video':
                const videoAsset = await takeMediaFromCamera(true); 
                if (videoAsset) onSendMedia(videoAsset);
                break;
            case 'document':
                const doc = await pickDocument();
                if (doc) {
                    onSendDocument({
                        uri: doc.uri,
                        name: doc.fileName, 
                        mimeType: doc.mimeType
                    });
                }
                break;
        }
    } catch (e) {
        console.log("Error seleccionando media:", e);
    }
  };

  const handleSendAudio = async (uri: string, duration: number) => {
    await onSendAudio(uri, duration);
  };

  const renderSendOrRecord = useCallback((props: any) => {
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
  }, [handleSendAudio]);

  const renderActions = useMemo(() => createRenderActions(handleAttachmentPress), [handleAttachmentPress]);
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
          keyboardAvoidingViewProps={{
            keyboardVerticalOffset: Platform.OS === "ios" ? 0 : 100,
            behavior: Platform.OS === "ios" ? "padding" : "height", 
            style: { flex: 1 }
          }}
          
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{ _id: user.id }}
          
          renderBubble={renderBubble}
          renderTime={renderTime}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSendOrRecord}
          
          renderActions={renderActions}
          renderMessageImage={renderMsgImage}
          renderMessageVideo={renderMsgVideo}
          renderMessageAudio={renderMsgAudio}
          renderCustomView={renderCustomView}
          
          text={inputText}
          textInputProps={{
              style: chatStyles.textInput,
              placeholderTextColor: '#aaa',
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

      <AttachmentModal 
        visible={isAttachmentVisible} 
        onClose={() => setAttachmentVisible(false)}
        onOptionSelect={handleOptionSelect}
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