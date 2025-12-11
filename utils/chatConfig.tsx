import React from "react";
import { StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { 
  Bubble, InputToolbar, Send, Actions, Time,
  BubbleProps, IMessage, InputToolbarProps, TimeProps,
  MessageImageProps, MessageVideoProps, MessageAudioProps
} from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";
import { materialColors } from "@/utils/colors";

// --- IMPORTAMOS LOS COMPONENTES DE LA FASE 2 ---
// Ajusta estas rutas si decidiste guardar los archivos en otra carpeta
import AudioPlayer from "@/components/AudioPlayer";
import VideoThumbnail from "@/components/VideoThumbnail";

// --- Renderizadores Estáticos ---

export const renderBubble = (props: BubbleProps<IMessage>) => (
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

export const renderTime = (props: TimeProps<IMessage>) => (
  <Time 
    {...props} 
    timeTextStyle={{ 
      right: { color: '#eee' }, 
      left: { color: '#aaa' } 
    }} 
  />
);

export const renderInputToolbar = (props: InputToolbarProps<IMessage>) => (
  <InputToolbar 
    {...props} 
    containerStyle={styles.inputToolbar} 
    primaryStyle={{ alignItems: 'center' }} 
  />
);

export const renderSend = (props: any) => (
  <Send {...props} containerStyle={{justifyContent: 'center'}}>
    <View style={styles.sendButton}>
      <Ionicons name="send" size={18} color="#fff" />
    </View>
  </Send>
);

// Renderizador estático de Audio (sin expansión)
export const renderMessageAudio = (props: MessageAudioProps<IMessage>) => {
    if (!props.currentMessage?.audio) return null;
    return <AudioPlayer uri={props.currentMessage.audio} minimal />;
};

// --- Renderizadores Dinámicos ("Fábricas" con callbacks) ---

export const createRenderActions = (onAttachment: () => void) => (props: any) => (
  <Actions
    {...props}
    containerStyle={styles.actionsContainer}
    icon={() => <Ionicons name="add" size={28} color={materialColors.schemes.light.primary} />}
    onPressActionButton={onAttachment}
  />
);

export const createRenderMessageImage = (onPress: (id: string) => void) => (props: MessageImageProps<IMessage>) => {
  if (!props.currentMessage?.image) return null;
  return (
    <TouchableOpacity onPress={() => onPress(props.currentMessage!._id as string)} style={{ padding: 2 }}>
      <Image
        source={{ uri: props.currentMessage.image }}
        style={styles.mediaThumb}
      />
    </TouchableOpacity>
  );
};

// VIDEO: Usamos VideoThumbnail (expo-video)
export const createRenderMessageVideo = (onPress: (id: string) => void) => (props: MessageVideoProps<IMessage>) => {
  if (!props.currentMessage?.video) return null;
  return (
    <VideoThumbnail 
      uri={props.currentMessage.video} 
      onPress={() => onPress(props.currentMessage!._id as string)}
    />
  );
};

// AUDIO: Usamos AudioPlayer (expo-audio) + Botón de expandir
export const createRenderMessageAudio = (onExpand: (id: string) => void) => (props: MessageAudioProps<IMessage>) => {
    if (!props.currentMessage?.audio) return null;
    return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <AudioPlayer uri={props.currentMessage.audio} minimal />
            
            <TouchableOpacity 
              onPress={() => onExpand(props.currentMessage!._id as string)} 
              style={{padding: 10}}
            >
                <Ionicons name="expand-outline" size={20} color="#666" />
            </TouchableOpacity>
        </View>
    );
};

// --- Estilos ---

export const chatStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  inputToolbar: { backgroundColor: '#F2F2F2', borderTopWidth: 0, paddingVertical: 6, paddingHorizontal: 6 },
  textInput: {
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
    marginRight: 10, borderWidth: 1, borderColor: '#E8E8E8', color: '#333', flex: 1, height: 40, lineHeight: 20
  },
  actionsContainer: { marginBottom: 0, marginLeft: 0, marginRight: 8, justifyContent: 'center', alignItems: 'center', height: 40 },
  sendButton: { backgroundColor: materialColors.schemes.light.primary, borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  mediaThumb: { width: 200, height: 150, borderRadius: 13, margin: 3, resizeMode: 'cover' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1 }
});

const styles = chatStyles;