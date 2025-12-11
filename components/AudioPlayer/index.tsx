import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from "@expo/vector-icons";

interface Props {
  uri: string;
  minimal?: boolean; // Para vista compacta en el chat
  big?: boolean;     // Para vista grande en el modal
}

export default function AudioPlayer({ uri, minimal, big }: Props) {
  // Hook de la nueva librería
  const player = useAudioPlayer(uri);

  const togglePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const iconName = player.playing ? "pause-circle" : "play-circle";

  // Diseño Grande (Para el Modal)
  if (big) {
    return (
      <TouchableOpacity onPress={togglePlay} style={{marginTop: 20, alignItems: 'center'}}>
        <Ionicons name={iconName} size={80} color="#fff" />
        <Text style={{color: '#fff', marginTop: 10}}>
            {player.playing ? "Pausar" : "Reproducir Audio"}
        </Text>
      </TouchableOpacity>
    );
  }

  // Diseño Compacto (Para la Burbuja)
  return (
    <View style={styles.audioContainer}>
      <TouchableOpacity onPress={togglePlay}>
        <Ionicons name={iconName} size={36} color="#444" />
      </TouchableOpacity>
      {!minimal && (
        <Text style={styles.audioText}>
            {player.playing ? "Reproduciendo..." : "Mensaje de voz"}
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
    minWidth: 150, 
    backgroundColor: '#eee', 
    borderRadius: 10, 
    margin: 5 
  },
  audioText: { marginLeft: 10, fontSize: 14, color: '#333' }
});