import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "@/utils/globalStyles";
import { materialColors } from "@/utils/colors";
import { useChatList } from "./hooks/useChatList";
import { ROOT_ROUTES } from "@/utils/constants";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons"; // Importamos el ícono

const defaultAvatar = require("@/assets/user-predetermiando.png");

export default function ChatList() {
  const { chats, loading, refreshChats } = useChatList();
  const navigation = useNavigation<any>();

  const handlePress = (chat: any) => {
    navigation.navigate(ROOT_ROUTES.CHAT_ROOM, { 
      conversationId: chat.id,
      otherUserId: chat.other_user_id,
      userName: `${chat.other_user_nombre} ${chat.other_user_apellido}`,
      isActive: chat.is_chat_active,
      avatarUrl: chat.other_user_avatar
    });
  };

  // Función para ir a contactos
  const handleNewChat = () => {
    navigation.navigate(ROOT_ROUTES.CONTACTS_LIST);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.card, !item.is_chat_active && styles.cardInactive]} 
      onPress={() => handlePress(item)}
    >
      <Image 
        source={item.other_user_avatar ? { uri: item.other_user_avatar } : defaultAvatar} 
        style={[styles.avatar, !item.is_chat_active && styles.avatarInactive]} 
      />
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name}>{item.other_user_nombre} {item.other_user_apellido}</Text>
          <Text style={styles.date}>
            {item.last_message_at ? format(new Date(item.last_message_at), 'dd/MM') : ''}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {item.last_message || "Iniciar conversación..."}
          </Text>
          {!item.is_chat_active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Finalizado</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header con botón de Nuevo Chat */}
      <View style={styles.headerContainer}>
        <Text style={globalStyles.title}>Mensajes</Text>
        <TouchableOpacity onPress={handleNewChat} style={styles.addButton}>
          <Ionicons name="add-circle" size={36} color={materialColors.schemes.light.primary} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={materialColors.schemes.light.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes conversaciones activas.</Text>
              <Text style={styles.emptySubText}>Toca el botón + para iniciar un chat con tus contactos.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  
  // Nuevo estilo para el header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10
  },
  addButton: {
    padding: 4, // Área de toque extra
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  cardInactive: {
    backgroundColor: '#f9f9f9', 
    opacity: 0.8
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  avatarInactive: { opacity: 0.5 },
  info: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#999' },
  lastMsg: { fontSize: 14, color: '#666', marginTop: 4, flex: 1 },
  
  inactiveBadge: {
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8
  },
  inactiveText: { fontSize: 10, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' },

  // Estilos para estado vacío
  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', color: '#888', fontSize: 16, fontWeight: '600' },
  emptySubText: { textAlign: 'center', color: '#aaa', marginTop: 8, fontSize: 14 }
});