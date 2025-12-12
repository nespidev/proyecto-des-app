import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

interface Props {
  uri: string;
  minimal?: boolean;
  big?: boolean;
  backgroundColor?: string;
  textColor?: string;
  activeTrackColor?: string;
  inactiveTrackColor?: string;
}

export default function AudioPlayer({ 
  uri, 
  minimal, 
  big, 
  backgroundColor = '#E0E0E0', 
  textColor = '#1D1B20',
  activeTrackColor, 
  inactiveTrackColor
}: Props) {
  const player = useAudioPlayer(uri);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Definimos colores por defecto si no vienen por props
  const trackActive = activeTrackColor || textColor;
  const trackInactive = inactiveTrackColor || '#999999';

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (player) {
      setIsReady(true);
      if (player.duration > 0) setDuration(player.duration);
    }

    const subscription = player.addListener('playbackStatusUpdate', (status: any) => {
        setIsPlaying(status.playing);
        
        if (Math.abs(player.currentTime - currentTime) > 0.1 || status.playing) {
             setCurrentTime(player.currentTime);
        }
        
        if (player.duration > 0 && duration === 0) {
            setDuration(player.duration);
        }
        
        if (status.didJustFinish) {
            player.seekTo(0);
            player.pause();
            setCurrentTime(0);
            setIsPlaying(false);
        }
    });

    return () => { subscription.remove(); };
  }, [player]);

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) player.pause();
    else player.play();
    setIsPlaying(!isPlaying);
  };

  const onSeek = (value: number) => {
      if (player) {
          player.seekTo(value);
          setCurrentTime(value);
      }
  };

  const iconName = isPlaying ? "pause-circle" : "play-circle";

  if (!isReady) {
      return (
        <View style={[styles.audioContainer, { backgroundColor }, big && styles.bigContainer]}>
            <ActivityIndicator color={textColor} />
        </View>
      );
  }

  //  VISTA GRANDE (MODAL)
  if (big) {
    return (
      <View style={styles.bigLayoutContainer}>
        <TouchableOpacity onPress={togglePlay} style={{marginBottom: 30}}>
            <Ionicons name={iconName} size={80} color="#fff" />
        </TouchableOpacity>
        
        <View style={{width: width * 0.85}}>
            <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={duration > 0 ? duration : 1}
                value={currentTime}
                onSlidingComplete={onSeek}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#555555"
                thumbTintColor="#FFFFFF"
            />
            
            <View style={styles.timeContainerBig}>
                <Text style={styles.timeTextBig}>{formatTime(currentTime)}</Text>
                <Text style={styles.timeTextBig}>{formatTime(duration)}</Text>
            </View>
        </View>
        
        <Text style={{color: '#aaa', marginTop: 20, fontSize: 14}}>
            {isPlaying ? "Reproduciendo" : "Pausado"}
        </Text>
      </View>
    );
  }

  // VISTA COMPACTA (CHAT)
  return (
    <View style={[styles.audioContainer, { backgroundColor }]}>
      <TouchableOpacity onPress={togglePlay} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Ionicons name={iconName} size={36} color={textColor} />
      </TouchableOpacity>
      
      <View style={{flex: 1, marginLeft: 10}}>
          <Slider
            style={{width: '100%', height: 20}}
            minimumValue={0}
            maximumValue={duration > 0 ? duration : 1} 
            value={currentTime}
            onSlidingComplete={onSeek}
            // Usamos colores dinamicos
            minimumTrackTintColor={trackActive}
            maximumTrackTintColor={trackInactive} 
            thumbTintColor={trackActive}
          />
          {!minimal && (
            <View style={styles.timeContainerSmall}>
                <Text style={[styles.timeText, { color: textColor }]}>{formatTime(currentTime)}</Text>
                <Text style={[styles.timeText, { color: textColor }]}>{formatTime(duration)}</Text>
            </View>
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  audioContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 12,
    margin: 2
  },
  bigContainer: {
    backgroundColor: 'transparent'
  },
  bigLayoutContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20
  },
  timeContainerBig: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 5
  },
  timeTextBig: {
    color: '#fff',
    fontSize: 14,
  },
  audioText: { marginLeft: 10, fontSize: 14 },
  timeContainerSmall: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 5
  },
  timeText: { fontSize: 10, opacity: 0.9, fontWeight: '500' } 
});