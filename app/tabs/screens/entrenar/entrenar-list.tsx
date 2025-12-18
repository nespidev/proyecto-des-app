import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';

export default function EntrenarList() {
  const navigation = useNavigation<any>();

  const MenuItem = ({ 
    title, 
    subtitle, 
    icon, 
    color, 
    onPress 
  }: { 
    title: string; 
    subtitle: string; 
    icon: any; 
    color: string; 
    onPress: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icono con fondo circular (Estilo Management) */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}> 
        <Ionicons name={icon} size={32} color={color} />
      </View>

      {/* Textos */}
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      {/* Flecha indicadora */}
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header estilo Management */}
      <View style={styles.header}>
        <Text style={styles.title}>Zona de Entrenamiento</Text>
        <Text style={styles.subtitle}>Gestiona tu progreso y rutinas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        
        <MenuItem 
          title="Control de Peso"
          subtitle="Registra tu peso y visualiza tu progreso"
          icon="scale-outline"
          color="#4CAF50" // Verde
          onPress={() => navigation.navigate('MiPeso')}
        />

        <MenuItem 
          title="Mis Planes"
          subtitle="Tu rutina de ejercicios y dieta actual"
          icon="calendar-outline"
          color="#2196F3" // Azul
          onPress={() => navigation.navigate('Planificacion')}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Igual a Management
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 60, // Aumentado a 60
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
  },
});