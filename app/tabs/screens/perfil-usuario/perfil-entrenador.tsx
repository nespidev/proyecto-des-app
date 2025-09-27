import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@/utils/globalStyles";
import { materialColors } from "@/utils/colors";
// import { RootStackParamList } from "@/app/navigation/RootNavigation";

// type Props = NativeStackScreenProps<RootStackParamList, "PerfilEntrenador">;


const entrenadorPrueba = {
  nombre: "Juan Pérez",
  edad: 35,
  especialidad: "Entrenador Personal",
  correo: "juan.perez@gym.com",
  tel: "987654321",
  experiencia: "10 años",
};

export default function PerfilEntrenador() {

  return (
    <ScrollView style={styles.container}>
        <Text style={[globalStyles.title, { textAlign: "center", marginVertical: 12 }]}>
        Perfil Entrenador
        </Text>
        <Text style={[globalStyles.subtitle, { textAlign: "center", marginBottom: 16 }]}>
        Pantalla del Entrenador
        </Text>

        <View style={styles.card}>
        <View style={styles.header}>
            <Image
            source={require("@/assets/user-predetermiando.png")}
            style={styles.avatar}
            />
            <Text style={styles.nombre}>{entrenadorPrueba.nombre}</Text>
        </View>

        <View style={styles.infoRow}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>{entrenadorPrueba.edad}</Text>
        </View>

        <View style={styles.infoRow}>
            <Text style={styles.label}>Correo:</Text>
            <Text style={styles.value}>{entrenadorPrueba.correo}</Text>
        </View>

        <View style={styles.infoRow}>
            <Text style={styles.label}>Tel:</Text>
            <Text style={styles.value}>{entrenadorPrueba.tel}</Text>
        </View>

        <View style={styles.infoRow}>
            <Text style={styles.label}>Especialidad:</Text>
            <Text style={styles.value}>{entrenadorPrueba.especialidad}</Text>
        </View>

        <View style={styles.infoRow}>
            <Text style={styles.label}>Experiencia:</Text>
            <Text style={styles.value}>{entrenadorPrueba.experiencia}</Text>
        </View>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: materialColors.schemes.light.surface,
    padding: 16,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    color: "#333",
  },
});
