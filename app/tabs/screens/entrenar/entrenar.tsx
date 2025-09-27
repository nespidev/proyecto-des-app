import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles"; 
import { materialColors } from "@/utils/colors";

export default function Entrenar() {
  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>ENTRENAR</Text>
      <Text style={globalStyles.subtitle}>Pantalla de Entrenamiento</Text>
      <Button
        title="Rutinas"
        onPress={() => console.log("Rutinas presionado")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20,
      backgroundColor: materialColors.schemes.light.surface,
    },
})