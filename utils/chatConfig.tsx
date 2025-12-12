import React from "react";
import { StyleSheet, TouchableOpacity, Image, View, Linking, Text } from "react-native";
import { 
  Bubble, InputToolbar, Send, Actions, Time,
  BubbleProps, IMessage, InputToolbarProps, TimeProps,
  MessageImageProps, MessageVideoProps, MessageAudioProps
} from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";
import { materialColors } from "@/utils/colors";
import AudioPlayer from "@/components/AudioPlayer";
import VideoThumbnail from "@/components/VideoThumbnail";

// --- Renderizadores Estáticos ---

export const renderBubble = (props: BubbleProps<IMessage>) => (
  <Bubble
    {...props}
    wrapperStyle={{
      right: { 
        backgroundColor: materialColors.schemes.light.primary,
        marginBottom: 2
      },
      left: { 
        backgroundColor: materialColors.schemes.light.secondaryContainer, 
        marginBottom: 2
      },
    }}
    textStyle={{
      right: { color: materialColors.schemes.light.onPrimary },
      left: { color: materialColors.schemes.light.onSecondaryContainer },
    }}
  />
);

export const renderTime = (props: TimeProps<IMessage>) => (
  <Time 
    {...props} 
    timeTextStyle={{ 
      right: { color: materialColors.schemes.light.onPrimary, opacity: 0.8 }, 
      left: { color: materialColors.schemes.light.onSecondaryContainer, opacity: 0.6 } 
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
      <Ionicons name="send" size={18} color={materialColors.schemes.light.onPrimary} />
    </View>
  </Send>
);

// --- Renderizadores Dinámicos ---

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

export const createRenderMessageVideo = (onPress: (id: string) => void) => (props: MessageVideoProps<IMessage>) => {
  if (!props.currentMessage?.video) return null;
  return (
    <VideoThumbnail 
      uri={props.currentMessage.video} 
      onPress={() => onPress(props.currentMessage!._id as string)}
    />
  );
};

// CORRECCIÓN AQUÍ: Usamos 'any' en el tipo de props para evitar el conflicto,
// o simplemente extendemos la interfaz internamente.
export const createRenderMessageAudio = (onExpand: (id: string) => void) => 
  (props: MessageAudioProps<IMessage>) => { // Firma estándar
    
    if (!props.currentMessage?.audio) return null;
    
    // Hacemos el cast aquí para acceder a 'position' sin que TS se queje en la definición
    const { position } = props as any; 
    const isMyMessage = position === 'right';

    // CONFIGURACIÓN DE COLORES
    const playerBg = isMyMessage 
        ? materialColors.schemes.light.primaryContainer 
        : materialColors.schemes.light.surface;

    const textColor = isMyMessage 
        ? materialColors.schemes.light.onPrimaryContainer 
        : materialColors.schemes.light.onSurface;

    const activeTrack = isMyMessage 
        ? materialColors.schemes.light.onPrimaryContainer 
        : materialColors.schemes.light.primary;

    const inactiveTrack = isMyMessage 
        ? materialColors.schemes.light.onPrimary 
        : materialColors.schemes.light.outlineVariant;

    const btnBg = isMyMessage 
        ? materialColors.schemes.light.onPrimary 
        : materialColors.schemes.light.surface;
    
    const btnIconColor = isMyMessage
        ? materialColors.schemes.light.primary 
        : materialColors.schemes.light.onSurfaceVariant;

    return (
        <View style={{flexDirection: 'row', alignItems: 'center', minWidth: 220, padding: 4}}>
            <View style={{flex: 1}}>
                <AudioPlayer 
                    uri={props.currentMessage.audio} 
                    minimal 
                    backgroundColor={playerBg}
                    textColor={textColor}
                    activeTrackColor={activeTrack}
                    inactiveTrackColor={inactiveTrack}
                />
            </View>
            
            <TouchableOpacity 
              onPress={() => onExpand(props.currentMessage!._id as string)} 
              style={{
                  width: 40, height: 40,
                  backgroundColor: btnBg, 
                  borderRadius: 12, 
                  marginLeft: 6, 
                  justifyContent: 'center', 
                  alignItems: 'center'
              }}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
                <Ionicons name="expand-outline" size={20} color={btnIconColor} />
            </TouchableOpacity>
        </View>
    );
};

// --- RENDERIZADOR CUSTOM PARA ARCHIVOS (PDFs) ---
export const renderCustomView = (props: any) => {
    if (props.currentMessage.file) {
        const { url, name } = props.currentMessage.file;
        const isMyMessage = props.position === 'right';
        const iconColor = isMyMessage ? '#fff' : '#333';
        const textColor = isMyMessage ? '#fff' : '#333';

        return (
            <TouchableOpacity 
                onPress={() => Linking.openURL(url)} 
                style={{
                    flexDirection: 'row', alignItems: 'center', padding: 10,
                    minWidth: 150, maxWidth: 250
                }}
            >
                <View style={{
                    backgroundColor: isMyMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                    padding: 8, borderRadius: 8, marginRight: 8
                }}>
                    <Ionicons name="document-text" size={30} color={iconColor} />
                </View>
                <View style={{flex: 1}}>
                    <Text style={{color: textColor, fontWeight: 'bold'}} numberOfLines={1}>
                        {name || "Documento"}
                    </Text>
                    <Text style={{color: textColor, fontSize: 10, opacity: 0.8}}>
                        Toca para abrir
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
    return null;
};

export const chatStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: materialColors.schemes.light.background },
  inputToolbar: { 
      backgroundColor: materialColors.schemes.light.surface, 
      borderTopWidth: 1, 
      borderTopColor: materialColors.schemes.light.outlineVariant, 
      paddingVertical: 6, 
      paddingHorizontal: 6 
  },
  textInput: {
    backgroundColor: materialColors.schemes.light.surfaceContainerHigh,
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingTop: 8, 
    paddingBottom: 8,
    marginRight: 10, 
    borderWidth: 0,
    color: materialColors.schemes.light.onSurface, 
    flex: 1, 
    height: 40, 
    lineHeight: 20
  },
  actionsContainer: { marginBottom: 0, marginLeft: 0, marginRight: 8, justifyContent: 'center', alignItems: 'center', height: 40 },
  sendButton: { 
      backgroundColor: materialColors.schemes.light.primary, 
      borderRadius: 20, 
      width: 36, 
      height: 36, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginRight: 4 
  },
  mediaThumb: { width: 200, height: 150, borderRadius: 13, margin: 3, resizeMode: 'cover' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1 }
});

const styles = chatStyles;