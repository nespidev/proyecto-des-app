import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";
import { materialColors } from "@/utils/colors";
import { useContext } from "react";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";

const usuarioPrueba = {
  nombre: "Lucas Coquet",
  edad: 21,
  peso: "80kg",
  objetivo: "Fuerza",
  correo: "lucasscoquet@gmail.com",
  tel: "123456789",
};

export default function PerfilUsuario() {
    const {dispatch} = useContext(AuthContext)
    const handleLogout = () => {
    dispatch({type: AUTH_ACTIONS.LOGOUT})
  }
  return (
    <ScrollView style={styles.container}>
      <Text style={[globalStyles.title, { textAlign: "center", marginVertical: 12 }]}>
        Perfil Usuario
      </Text>
      <Text style={[globalStyles.subtitle, { textAlign: "center", marginBottom: 16 }]}>
        Pantalla del Usuario
      </Text>

      <View style={styles.card}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/user-predetermiando.png")}
            style={styles.avatar}
          />
          <Text style={styles.nombre}>{usuarioPrueba.nombre}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Edad:</Text>
          <Text style={styles.value}>{usuarioPrueba.edad}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Correo:</Text>
          <Text style={styles.value}>{usuarioPrueba.correo}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tel:</Text>
          <Text style={styles.value}>{usuarioPrueba.tel}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Peso:</Text>
          <Text style={styles.value}>{usuarioPrueba.peso}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Objetivo:</Text>
          <Text style={styles.value}>{usuarioPrueba.objetivo}</Text>
        </View>
      </View>
      <Button
        title="Salir de la cuenta"
        style={styles.exitButton}
        onPress={handleLogout}
      />
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
  exitButton: { backgroundColor: materialColors.coreColors.error,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 100,
    alignSelf: "center",
  }
})
