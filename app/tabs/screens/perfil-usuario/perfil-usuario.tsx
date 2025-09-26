import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";


export default function PerfilUsuario() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={globalStyles.title}>Perfil</Text>
      <Text style={globalStyles.subtitle}>Pantalla de Perfil</Text>
      <Button
        title="Detalles Perfil"
        onPress={() => console.log("Detalles Perfil presionado")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20  },
})