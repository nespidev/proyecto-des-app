import React from "react";
import { View, Modal, Image, TouchableOpacity, Text, Dimensions, StyleSheet } from "react-native";
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from "@expo/vector-icons";
import { IMessage } from "react-native-gifted-chat";
import AudioPlayer from "../AudioPlayer"; // Reutilizamos el player existente

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  currentMessage: IMessage | undefined;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  positionInfo: string; // Ej: "1 / 5"
}

export default function MediaViewerModal({ 
  visible, currentMessage, onClose, onNext, onPrev, hasNext, hasPrev, positionInfo 
}: Props) {
  if (!currentMessage) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalBtn}>
              <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>{positionInfo}</Text>
          <View style={{width: 40}} /> 
        </View>

        {/* Contenido Central */}
        <View style={styles.mediaWrapper}>
          {currentMessage.image && (
              <Image source={{ uri: currentMessage.image }} style={styles.fullMedia} resizeMode="contain" />
          )}
          {currentMessage.video && (
              <Video
                  style={styles.fullMedia}
                  source={{ uri: currentMessage.video }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  isLooping
              />
          )}
          {currentMessage.audio && (
              <View style={styles.audioFullContainer}>
                  <Ionicons name="musical-note" size={80} color="#fff" />
                  {/* Aquí podrías hacer una versión 'Big' de tu AudioPlayer o usar el mismo */}
                  <View style={{marginTop: 20}}>
                     <AudioPlayer uri={currentMessage.audio} />
                  </View>
              </View>
          )}
        </View>

        {/* Flechas de Navegación */}
        <View style={styles.navOverlay}>
          {hasPrev && (
              <TouchableOpacity onPress={onPrev} style={[styles.navBtn, {left: 10}]}>
                  <Ionicons name="chevron-back" size={40} color="#fff" />
              </TouchableOpacity>
          )}
          {hasNext && (
              <TouchableOpacity onPress={onNext} style={[styles.navBtn, {right: 10}]}>
                  <Ionicons name="chevron-forward" size={40} color="#fff" />
              </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  modalHeader: { position: 'absolute', top: 50, left: 0, right: 0, zIndex: 20, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' },
  modalBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  mediaWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullMedia: { width: width, height: '100%' },
  audioFullContainer: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  navOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'box-none' },
  navBtn: { position: 'absolute', padding: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 30 },
});