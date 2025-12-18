import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';
import PlanPreview from '@/components/PlanPreview'; 
import { AuthContext } from "@/shared/context/auth-context";

interface HistoryItem {
  id: string;
  title: string;
  type: 'workout' | 'diet';
  created_at: string;
  is_active: boolean;
  content: any;
}

export default function PlanHistoryScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  
  const { state } = useContext<any>(AuthContext);
  const { clientId } = route.params;

  // --- LÓGICA DE PERMISOS ---
  // El usuario puede editar SOLO SI:
  // 1. Su rol en base de datos es 'professional'
  // 2. Y su modo de vista actual (viewMode) es 'professional'
  const canEdit = state.user?.rol === 'professional' && state.viewMode === 'professional';

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plans')
      .select('id, title, type, created_at, is_active, content') 
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (data) setHistory(data);
    setLoading(false);
  };

  const deactivatePlan = async (planId: string) => {
    if (!canEdit) return; // Protección

    const { error } = await supabase
      .from('plans')
      .update({ is_active: false })
      .eq('id', planId);

    if (error) Alert.alert("Error", "No se pudo desactivar el plan.");
    else fetchHistory();
  };

  const deletePlan = async (planId: string) => {
    if (!canEdit) return; // Protección

    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId);

    if (error) Alert.alert("Error", "No se pudo eliminar el plan.");
    else fetchHistory();
  };

  const handleOptionsPress = (item: HistoryItem) => {
    // Protección extra por si se llama manualmente
    if (!canEdit) return;

    const options = [];

    if (item.is_active) {
      options.push({
        text: "Desactivar Plan",
        onPress: () => deactivatePlan(item.id),
        style: "default"
      });
    } else {
      options.push({
        text: "Reactivar Plan",
        onPress: async () => {
            if (!canEdit) return;
            await supabase.from('plans').update({is_active: false}).eq('client_id', clientId).eq('type', item.type);
            await supabase.from('plans').update({is_active: true}).eq('id', item.id);
            fetchHistory();
        }
      });
    }

    options.push({
      text: "Eliminar Definitivamente",
      onPress: () => deletePlan(item.id),
      style: "destructive"
    });

    options.push({ text: "Cancelar", style: "cancel" });

    Alert.alert(
      "Gestionar Plan",
      `¿Qué deseas hacer con "${item.title}"?`,
      options as any
    );
  };

  const openPlanDetail = (item: HistoryItem) => {
    navigation.navigate('PlanEditor', {
       existingPlan: item, 
       clientId: clientId,
       // Si canEdit es false, pasamos readOnly: true.
       // Esto asegura que el editor no muestre botones de guardar/editar.
       readOnly: !canEdit 
    });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => openPlanDetail(item)}>
      <View style={styles.headerRow}>
        
        <View style={styles.iconAndTitle}>
            <View style={[styles.iconContainer, { backgroundColor: item.type === 'workout' ? '#E3F2FD' : '#FFF3E0' }]}>
                <Ionicons 
                  name={item.type === 'workout' ? 'barbell' : 'restaurant'} 
                  size={20} 
                  color={item.type === 'workout' ? '#1565C0' : '#EF6C00'} 
                />
            </View>
            <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </View>

        <View style={styles.rightActions}>
            {item.is_active ? (
                <View style={styles.activeBadge}><Text style={styles.activeText}>ACTIVO</Text></View>
            ) : (
                <View style={styles.inactiveBadge}><Text style={styles.inactiveText}>INACTIVO</Text></View>
            )}
            
            {/* CONDICIÓN VISUAL: Solo mostramos los 3 puntos si puede editar (canEdit) */}
            {canEdit && (
              <TouchableOpacity 
                style={styles.moreButton} 
                onPress={() => handleOptionsPress(item)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#999" />
              </TouchableOpacity>
            )}
        </View>
      </View>

      <PlanPreview plan={item} maxDays={1} maxItemsPerDay={4} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
       <Text style={styles.headerTitle}>Historial de Planes</Text>
       {loading ? (
           <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
       ) : (
           <FlatList
              data={history}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={<Text style={styles.emptyText}>No hay historial disponible.</Text>}
           />
       )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  card: {
    backgroundColor: 'white',
    padding: 14, 
    borderRadius: 12, 
    marginBottom: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee'
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  iconAndTitle: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { 
    width: 36, height: 36, borderRadius: 18, 
    justifyContent: 'center', alignItems: 'center', marginRight: 10 
  },
  title: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 11, color: '#888' },
  
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  moreButton: { marginLeft: 8, padding: 4 }, 

  activeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  activeText: { fontSize: 10, color: '#2E7D32', fontWeight: 'bold' },
  inactiveBadge: { 
    backgroundColor: materialColors.schemes.light.surfaceVariant,
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4 
  },
  inactiveText: { 
    color: materialColors.schemes.light.onSurfaceVariant,
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  emptyText: { textAlign: 'center', marginTop: 20, color: 'gray' }
});