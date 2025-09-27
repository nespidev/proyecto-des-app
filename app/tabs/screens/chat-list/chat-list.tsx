import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const mockImage = require("@/assets/user-predetermiando.png")
const mockChats = [
  { id: "1", nombre: "Entrenador Juan", ultimoMensaje: "Nos vemos mañana 💪", hora: "10:30", avatar: mockImage },
  { id: "2", nombre: "Sofi", ultimoMensaje: "Dale, nos hablamos!", hora: "Ayer", avatar: mockImage },
  { id: "3", nombre: "Camila Yoga", ultimoMensaje: "La clase es a las 18hs", hora: "Domingo", avatar: mockImage },
  { id: "4", nombre: "Profe Ana", ultimoMensaje: "Recuerda tu rutina de hoy", hora: "09:15", avatar: mockImage },
  { id: "5", nombre: "Carlos", ultimoMensaje: "Voy a llegar tarde al gym", hora: "08:50", avatar: mockImage },
  { id: "6", nombre: "Grupo Crossfit", ultimoMensaje: "Nueva clase a las 19hs", hora: "Sábado", avatar: mockImage },
  { id: "7", nombre: "María", ultimoMensaje: "Gracias por el consejo!", hora: "Viernes", avatar: mockImage },
  { id: "8", nombre: "Entrenador Luis", ultimoMensaje: "¡Buen progreso esta semana!", hora: "07:30", avatar: mockImage },
  { id: "9", nombre: "Light-weight Gym", ultimoMensaje: "El primer día es gratis!", hora: "Jueves", avatar: mockImage },
  { id: "10", nombre: "Santiago", ultimoMensaje: "Voy por el suplemento", hora: "Miércoles", avatar: mockImage },
];

import { useNavigation } from "@react-navigation/native";
import { ROOT_ROUTES } from "@/utils/constants";

export default function ChatList() {
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => navigation.navigate(ROOT_ROUTES.CHAT as never)} 
    >
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.mensaje}>{item.ultimoMensaje}</Text>
      </View>
      <Text style={styles.hora}>{item.hora}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <FlatList
        data={mockChats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  chatInfo: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: "bold" },
  mensaje: { fontSize: 14, color: "gray" },
  hora: { fontSize: 12, color: "gray" },
});
