import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
// Importa AuthContext para usarlo con useContext
import { AuthContext } from '@/shared/context/auth-context'; 
import { ClientsStackParamList } from './clients-stack';
import { materialColors } from '@/utils/colors';
import { IService } from '@/shared/models'

type NavigationProp = NativeStackNavigationProp<ClientsStackParamList>;

export default function ServicesList() {
  // CORRECCIÓN AQUÍ:
  // Extraemos 'state' del contexto, y luego sacamos 'user' del state.
  const { state } = useContext(AuthContext);
  const user = state?.user; 

  const navigation = useNavigation<NavigationProp>();
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);

const fetchServices = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.log('Usuario no autenticado (State vacío)');
        setLoading(false);
        return;
      }

      console.log('Buscando servicios para profesional ID:', user.id);

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', user.id)
        // CAMBIO: Quitamos .order('created_at'...) porque no existe.
        // Opcional: Ordenamos alfabéticamente por título para mantener el orden.
        .order('title', { ascending: true }); 

      if (error) {
        console.error('Error Supabase:', error);
        throw error;
      }

      console.log('Servicios encontrados:', data?.length);
      setServices(data || []);

    } catch (error: any) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [user]) // Re-ejecutar si el user cambia (ej. login tardío)
  );

  const renderItem = ({ item }: { item: IService }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ServiceEditor', { serviceId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: item.is_active ? '#E8F5E9' : '#FFEBEE' }]}>
          <Text style={[styles.badgeText, { color: item.is_active ? '#2E7D32' : '#C62828' }]}>
            {item.is_active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {item.description || 'Sin descripción'}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.metaRow}>
            <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{item.duration_minutes} min</Text>
            </View>
            {item.total_sessions && (
                <View style={[styles.metaItem, { marginLeft: 10 }]}>
                    <MaterialCommunityIcons name="cached" size={16} color="#666" />
                    <Text style={styles.metaText}>{item.total_sessions} ses.</Text>
                </View>
            )}
        </View>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={materialColors.coreColors.primary} />
          <Text style={{marginTop: 10, color: '#666'}}>Cargando servicios...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchServices} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="dumbbell" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No tienes servicios creados.</Text>
              <Text style={styles.emptySubtext}>Crea uno para empezar a vender.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ServiceEditor', { serviceId: undefined })}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 8 },
  description: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  metaRow: { flexDirection: 'row' },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: 4, color: '#666', fontSize: 14 },
  price: { fontSize: 18, fontWeight: 'bold', color: materialColors.coreColors.primary || '#4A90E2' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#444', marginTop: 10 },
  emptySubtext: { fontSize: 14, color: '#888', marginTop: 8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: materialColors.coreColors.primary || '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
});