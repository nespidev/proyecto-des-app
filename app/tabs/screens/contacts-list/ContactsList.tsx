import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "@/utils/globalStyles";
import { materialColors } from "@/utils/colors";
import { useContacts } from "./hooks/useContacts";
import { ROOT_ROUTES } from "@/utils/constants";

const defaultAvatar = require("@/assets/user-predetermiando.png");

export default function ContactsList() {
  const { contacts, loading, startConversation } = useContacts();
  const navigation = useNavigation<any>();

  const handleContactPress = async (contact: any) => {
    const conversationId = await startConversation(contact.id);
    if (conversationId) {
      // Reemplazamos la pantalla actual por el chat para que al volver vaya a la lista de chats
      navigation.replace(ROOT_ROUTES.CHAT_ROOM, { 
        conversationId,
        otherUserId: contact.id,
        userName: `${contact.nombre} ${contact.apellido}`
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.title, {margin: 16}]}>Nueva Conversación</Text>
      
      {loading ? (
        <ActivityIndicator color={materialColors.schemes.light.primary} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes contactos agendados aún.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleContactPress(item)}>
              <Image 
                source={item.avatar_url ? { uri: item.avatar_url } : defaultAvatar} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.name}>{item.nombre} {item.apellido}</Text>
                <Text style={styles.role}>{item.rol === 'professional' ? 'Profesional' : 'Alumno'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 1
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  role: { fontSize: 12, color: '#888', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 }
});