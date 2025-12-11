import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from "@expo/vector-icons";

interface Props {
  uri: string;
  onPress: () => void;
}

export default function VideoThumbnail({ uri, onPress }: Props) {
  // Creamos un reproductor "ligero" para la miniatura
  const player = useVideoPlayer(uri, player => {
    player.loop = false;
    player.muted = true; // Silenciado
    player.pause();      // Pausado para no gastar batería
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.videoWrapper}>
        <VideoView 
          style={styles.video} 
          player={player} 
          nativeControls={false} // Sin controles nativos
          allowsFullscreen={false} // No permitir pantalla completa aquí
        />
        {/* Icono de Play superpuesto */}
        <View style={styles.overlay}>
          <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.8)" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 5 },
  videoWrapper: { 
    position: 'relative', 
    width: 200, 
    height: 150, 
    borderRadius: 13, 
    overflow: 'hidden', 
    backgroundColor: '#000' 
  },
  video: { width: '100%', height: '100%' },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});