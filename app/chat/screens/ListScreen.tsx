import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/app/navigation/RootNavigation";

type Props = NativeStackScreenProps<RootStackParamList, "ChatList">;

const mockChats = [
  { id: "1", nombre: "Entrenador Juan", ultimoMensaje: "Nos vemos mañana 💪", hora: "10:30", avatar: require("../../../assets/user-predetermiando.png") },
  { id: "2", nombre: "Sofi", ultimoMensaje: "Dale, nos hablamos!", hora: "Ayer", avatar: require("../../../assets/user-predetermiando.png") },
  { id: "3", nombre: "Camila Yoga", ultimoMensaje: "La clase es a las 18hs", hora: "Domingo", avatar: require("../../../assets/user-predetermiando.png") },
  { id: "4", nombre: "Profe Ana", ultimoMensaje: "Recuerda tu rutina de hoy", hora: "09:15", avatar: require("../../../assets/user-predetermiando.png") },
  { id: "5", nombre: "Carlos", ultimoMensaje: "Voy a llegar tarde al gym", hora: "08:50", avatar: require("../../../assets/user-predetermiando.png") },
  { id: "6", nombre: "Grupo Crossfit", ultimoMensaje: "Nueva clase a las 19hs", hora: "Sábado", avatar: require("../../../assets/user-predetermiando.png") },
  { id: "7", nombre: "María", ultimoMensaje: "Gracias por el consejo!", hora: "Viernes", avatar: require("../../../assets/user-predetermiando.png") },
  { id: "8", nombre: "Entrenador Luis", ultimoMensaje: "¡Buen progreso esta semana!", hora: "07:30", avatar: require("../../../assets/user-predetermiando.png") },
  { id: "9", nombre: "Light-weight Gym", ultimoMensaje: "El primer día es gratis!", hora: "Jueves", avatar: require("../../../assets/user-predetermiando.png") },
  { id: "10", nombre: "Santiago", ultimoMensaje: "Voy por el suplemento", hora: "Miércoles", avatar: require("../../../assets/user-predetermiando.png") },
];

export default function ChatListScreen({ navigation }: Props) {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => navigation.navigate("Chat")} 
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
