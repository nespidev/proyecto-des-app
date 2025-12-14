// app/tabs/screens/perfil-publico/perfil-publico-cliente.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';
import { styles } from './styles'; // Importamos desde el archivo local

interface Props {
  profile: any;
}

export default function PerfilPublicoCliente({ profile }: Props) {
  return (
    <>
      <View style={styles.separator} />
      <Text style={styles.sectionTitle}>Ficha del Cliente</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{profile.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Teléfono:</Text>
        <Text style={styles.value}>{profile.telefono || "No registrado"}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="body-outline" size={24} color={materialColors.schemes.light.primary} />
          <Text style={styles.statLabel}>Peso</Text>
          <Text>{profile.peso ? `${profile.peso} kg` : '--'}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="resize-outline" size={24} color={materialColors.schemes.light.primary} />
          <Text style={styles.statLabel}>Altura</Text>
          <Text>{profile.altura ? `${profile.altura} cm` : '--'}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={24} color={materialColors.schemes.light.primary} />
          <Text style={styles.statLabel}>Edad</Text>
          <Text>{profile.fecha_nacimiento ? "Calc..." : '--'}</Text>
        </View>
      </View>
    </>
  );
}