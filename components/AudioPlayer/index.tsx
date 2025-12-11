import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from "@expo/vector-icons";
import { materialColors } from "@/utils/colors";

interface Props {
  uri: string;
  minimal?: boolean;
  big?: boolean;
}

export default function AudioPlayer({ uri, minimal, big }: Props) {
  const player = useAudioPlayer(uri);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (player) {
      setIsReady(true);
    }

    const subscription = player.addListener('playbackStatusUpdate', (status: any) => {
        setIsPlaying(status.playing);
        
        if (status.didJustFinish) {
            player.seekTo(0);
            player.pause();
        }
    });

    return () => {
        subscription.remove();
    };
  }, [player]);

  const togglePlay = () => {
    if (!player) return;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const iconName = isPlaying ? "pause-circle" : "play-circle";

  if (!isReady) {
      return (
        <View style={[styles.audioContainer, big && styles.bigContainer]}>
            <ActivityIndicator color="#444" />
        </View>
      );
  }

  if (big) {
    return (
      <TouchableOpacity onPress={togglePlay} style={{marginTop: 20, alignItems: 'center'}}>
        <Ionicons name={iconName} size={80} color="#fff" />
        <Text style={{color: '#fff', marginTop: 10, fontWeight: 'bold'}}>
            {isPlaying ? "Pausar Audio" : "Reproducir Audio"}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.audioContainer}>
      <TouchableOpacity onPress={togglePlay} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Ionicons name={iconName} size={36} color="#444" />
      </TouchableOpacity>
      {!minimal && (
        <Text style={styles.audioText}>
            {isPlaying ? "Reproduciendo..." : "Mensaje de voz"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  audioContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    // minWidth: 150, 
    backgroundColor: materialColors.coreColors.secondary, 
    borderRadius: 10,
    margin: 5 
  },
  bigContainer: {
    backgroundColor: 'transparent'
  },
  audioText: { marginLeft: 10, fontSize: 14, color: '#333' }
});