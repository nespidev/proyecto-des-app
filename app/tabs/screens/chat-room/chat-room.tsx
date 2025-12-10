import React from "react";
import { View, StyleSheet, Platform, KeyboardAvoidingView, StatusBar } from "react-native";
import { 
  GiftedChat, 
  Send, 
  Actions, 
  Bubble, 
  BubbleProps, 
  IMessage,
  InputToolbar,
  InputToolbarProps,
  Time,
  TimeProps
} from "react-native-gifted-chat";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { materialColors } from "@/utils/colors";
import { useChatRoom } from "./hooks/useChatRoom";
import { Ionicons } from "@expo/vector-icons";
import { selectMediaFromGallery } from "@/utils/media-helper";

export default function ChatRoom() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { conversationId, userName } = route.params; 
  
  const { messages, onSend, onSendMedia, user } = useChatRoom(conversationId);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: userName || "Chat" });
  }, [navigation, userName]);

  const handleAttachment = async () => {
    const asset = await selectMediaFromGallery({ mediaType: 'Images', quality: 0.5 });
    if (asset) onSendMedia(asset);
  };

  // --- RENDERIZADORES ---
  const renderActions = (props: any) => (
    <Actions
      {...props}
      containerStyle={styles.actionsContainer}
      icon={() => <Ionicons name="add" size={28} color={materialColors.schemes.light.primary} />}
      onPressActionButton={handleAttachment}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={{justifyContent: 'center'}}>
      <View style={styles.sendButton}>
        <Ionicons name="send" size={18} color="#fff" />
      </View>
    </Send>
  );

  const renderBubble = (props: BubbleProps<IMessage>) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: materialColors.schemes.light.primary },
        left: { backgroundColor: '#fff' },
      }}
      textStyle={{
        right: { color: '#fff' },
        left: { color: '#000' },
      }}
    />
  );

  const renderTime = (props: TimeProps<IMessage>) => (
    <Time
      {...props}
      timeTextStyle={{
        right: { color: '#eee' }, 
        left: { color: '#aaa' },  
      }}
    />
  );

  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => (
    <InputToolbar 
      {...props} 
      containerStyle={styles.inputToolbar} 
      primaryStyle={{ alignItems: 'center' }}
    />
  );

  // --- ESTRUCTURA CORREGIDA ---
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <GiftedChat
        keyboardAvoidingViewProps={{
          keyboardVerticalOffset: Platform.OS === "ios" ? 0 : 100,
          behavior: Platform.OS === "ios" ? "padding" : "height", style: { flex: 1 }
        }}
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: user.id }}
        
        renderActions={renderActions}
        renderSend={renderSend}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderTime={renderTime} 
        
        textInputProps={{
            style: styles.textInput,
            placeholderTextColor: '#aaa',
            placeholder: "Escribe un mensaje...", 
            selectionColor: materialColors.schemes.light.primary
        }}
        
        isScrollToBottomEnabled={true} 
        scrollToBottomComponent={() => (
            <Ionicons name="chevron-down" size={24} color="#666" />
        )}
        
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F2'
  },
  keyboardContainer: {
    flex: 1
  },
  inputToolbar: {
    backgroundColor: '#F2F2F2',
    borderTopWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    color: '#333',
    flex: 1,
    height: 40,
    lineHeight: 20
  },
  actionsContainer: {
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40
  },
  sendButton: {
    backgroundColor: materialColors.schemes.light.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4
  }
});