import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/app/navigation/RootNavigation";
import { globalStyles } from "@/utils/globalStyles";

type Props = NativeStackScreenProps<RootStackParamList, "PerfilUsuario">;

const usuarioPrueba = {
  nombre: "Lucas Coquet",
  edad: 21,
  peso: "80kg",
  objetivo: "fuerza",
  correo: "lucasscoquet@gmail.com",
  tel: "123456789"
};

export default function PerfilUsuarioScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Perfil</Text>
      <Text style={globalStyles.subtitle}>Pantalla de Perfil</Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.info}>{usuarioPrueba.nombre}</Text>
        <Image source={require("../../../assets/user-predetermiando.png")} style={{ width: 120, height: 120, borderRadius: 60 }}  />
        <Text style={styles.info}>Edad: {usuarioPrueba.edad}</Text>
        <Text style={styles.info}>Corre: {usuarioPrueba.correo}</Text>
        <Text style={styles.info}>Peso: {usuarioPrueba.peso}</Text>
        <Text style={styles.info}>Tel: {usuarioPrueba.tel}</Text>
        <Text style={styles.info}>Objetivo: {usuarioPrueba.objetivo}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center", // centra vertical
    alignItems: "center",     // centra horizontal
    padding: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
});

