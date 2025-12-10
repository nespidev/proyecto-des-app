import React from "react";
import { View, Modal, Image, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

interface MediaViewerProps {
  visible: boolean;
  media: { uri: string, type: 'image' | 'video' } | null;
  onClose: () => void;
}

export default function MediaViewerModal({ visible, media, onClose }: MediaViewerProps) {
  if (!media) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>
        
        {media.type === 'image' && (
          <Image source={{ uri: media.uri }} style={styles.fullMedia} resizeMode="contain" />
        )}

        {media.type === 'video' && (
          <Video
              style={styles.fullMedia}
              source={{ uri: media.uri }}
              useNativeControls={true}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              isLooping={false}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  fullMedia: { width: width, height: '80%' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
});