import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/app/navigation/RootNavigation";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";

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
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20  },
})