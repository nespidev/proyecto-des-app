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
import { globalStyles } from '@/utils/globalStyles';

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
      style={styles.menuItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icono con fondo circular */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}> 
        <Ionicons name={icon} size={24} color={color} />
      </View>

      {/* Textos */}
      <View style={styles.textContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>

      {/* Flecha indicadora */}
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={materialColors.schemes.light.background} />
      
      <View style={styles.header}>
        <Text style={globalStyles.title}>Zona de Entrenamiento</Text>
        <Text style={globalStyles.subtitle}>Gestiona tu progreso y rutinas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        
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
    backgroundColor: materialColors.schemes.light.background,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: materialColors.schemes.light.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: materialColors.schemes.light.onSurface,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
  }
});