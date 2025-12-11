import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from "@expo/vector-icons";

interface Props {
  uri: string;
  onPress: () => void;
}

export default function VideoThumbnail({ uri, onPress }: Props) {
  const player = useVideoPlayer(uri, player => {
    player.loop = false;
    player.muted = true;
    player.pause();
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      {/* pointerEvents="none" hace que este View y sus hijos (el Video)
         ignoren los toques permitiendo que el TouchableOpacity los reciba
      */}
      <View style={styles.videoWrapper} pointerEvents="none">
        <VideoView 
          style={styles.video} 
          player={player} 
          nativeControls={false}
        />
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