import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  onPress: () => void;
}

const ChatHeader = ({ name, avatarUrl, onPress }: ChatHeaderProps) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={avatarUrl ? { uri: avatarUrl } : require('@/assets/user-predetermiando.png')}
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.cta}>Ver perfil</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginLeft: 4 , color: materialColors.coreColors.secondary}} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // Ajustes para que se vea bien en iOS y Android dentro del Header
    paddingVertical: 5,
    paddingRight: 10, 
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#e1e1e1',
  },
  textContainer: {
    justifyContent: 'center',
    maxWidth: 200, 
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  cta: {
    fontSize: 11,
    color: '#666',
  },
});

export default ChatHeader;