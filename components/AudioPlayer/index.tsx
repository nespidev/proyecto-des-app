import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from 'expo-av';
import { Ionicons } from "@expo/vector-icons";

interface Props {
  uri: string;
}

export default function AudioPlayer({ uri }: Props) {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);

  async function playSound() {
    if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
        } else {
            await sound.playAsync();
            setIsPlaying(true);
        }
    } else {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        await newSound.playAsync();
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(false);
                newSound.setPositionAsync(0);
            }
        });
    }
  }

  useEffect(() => {
    return () => { sound?.unloadAsync(); };
  }, [sound]);

  return (
    <View style={styles.audioContainer}>
      <TouchableOpacity onPress={playSound}>
        <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={36} color="#444" />
      </TouchableOpacity>
      <Text style={styles.audioText}>Mensaje de voz</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  audioContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, minWidth: 150, backgroundColor: '#eee', borderRadius: 10, margin: 5 },
  audioText: { marginLeft: 10, fontSize: 14, color: '#333' }
});