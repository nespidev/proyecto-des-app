import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { Ionicons } from "@expo/vector-icons";
import { materialColors } from "@/utils/colors";

interface Props {
  onSendAudio: (uri: string, duration: number) => void;
}

export default function AudioRecorder({ onSendAudio }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

  const handleRecordPress = async () => {
    if (isRecording) {
      // --- DETENER ---
      try {
        await recorder.stop();
        setIsRecording(false);
        
        console.log("URI obtenida:", recorder.uri); // Debug

        if (recorder.uri) {
          // Multiplicamos por 1000 porque currentTime suele estar en segundos
          const durationMs = (recorder.currentTime || 0) * 1000;
          onSendAudio(recorder.uri, durationMs);
        } else {
          Alert.alert("Error", "No se generó el archivo de audio.");
        }
      } catch (e) {
        console.error("Error al detener grabación:", e);
      }
    } else {
      // --- INICIAR ---
      try {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        
        if (permission.status !== 'granted') {
          Alert.alert("Permiso requerido", "Necesitamos acceso al micrófono.");
          return;
        }

        if (!recorder.isRecording) {
            // CORRECCIÓN CLAVE: Preparar explícitamente antes de grabar
            await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
            
            recorder.record();
            setIsRecording(true);
        }
      } catch (e) {
        console.error("Error al iniciar grabación:", e);
        Alert.alert("Error", "No se pudo iniciar la grabación.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handleRecordPress}
        style={[styles.button, isRecording && styles.recordingButton]}
      >
        <Ionicons 
          name={isRecording ? "stop" : "mic"} 
          size={20} 
          color="#fff" 
        />
      </TouchableOpacity>
      {isRecording && <Text style={styles.text}>Grabando...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  button: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: materialColors.schemes.light.primary,
    justifyContent: 'center', alignItems: 'center'
  },
  recordingButton: { backgroundColor: 'red' },
  text: { marginLeft: 8, color: 'red', fontSize: 12 }
});