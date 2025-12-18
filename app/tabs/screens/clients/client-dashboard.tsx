import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Modal, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { materialColors } from '@/utils/colors';
import { ROOT_ROUTES } from '@/utils/constants';
import { AuthContext } from "@/shared/context/auth-context";
import WeightProgressChart from '@/components/WeightProgressChart';
import PlanPreview from '@/components/PlanPreview';

export default function ClientDashboardScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { state } = useContext<any>(AuthContext);
  const { clientId, clientName } = route.params;

  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [activeDiet, setActiveDiet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [loadingWeight, setLoadingWeight] = useState(false);

  // Cargar Planes (Lógica existente)
  const fetchActivePlans = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true);

    if (data) {
      setActiveWorkout(data.find((p: any) => p.type === 'workout') || null);
      setActiveDiet(data.find((p: any) => p.type === 'diet') || null);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivePlans();
    }, [clientId])
  );

  // ---  Cargar Historial de Peso del Cliente ---
  const fetchClientWeightHistory = async () => {
    setLoadingWeight(true);
    setShowWeightModal(true); // Abrimos el modal

    const { data, error } = await supabase
      .from('weight_logs')
      .select('weight, recorded_at')
      .eq('user_id', clientId)
      .order('recorded_at', { ascending: true });

    if (!error && data) {
      // Formateamos igual que en useWeightMetrics
      const formatted = data.map((log: any) => ({
        value: log.weight,
        date: new Date(log.recorded_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        label: new Date(log.recorded_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      }));
      setWeightHistory(formatted);
    }
    setLoadingWeight(false);
  };

// Usando la VISTA para buscar
  const handleMessageClient = async () => {
    if (!state.user) return;
    
    try {
      // Buscar si ya existe el chat usando la VISTA (conversations_view)
      // Esto evita el error de columnas inexistentes en la tabla base.
      const { data: existingChatView, error: viewError } = await supabase
        .from('conversations_view')
        .select('*') // Trae id (o conversation_id), other_user_avatar, etc.
        .eq('relationship_role', 'professional') // Soy el profesional
        .eq('other_user_id', clientId) // Busco chat con este cliente
        .maybeSingle();

      if (viewError) throw viewError;

      // Detectamos si la columna ID de la vista se llama 'id' o 'conversation_id'
      // (Ajusta esto según tu vista, usualmente es 'id' o 'conversation_id')
      let conversationId = existingChatView?.id || existingChatView?.conversation_id;
      
      // Intentamos recuperar el avatar directo de la vista si existe
      let avatarToUse = existingChatView?.other_user_avatar;

      // Si no tenemos avatar de la vista, lo buscamos en profiles (backup)
      if (!avatarToUse) {
         const { data: profile } = await supabase
           .from('profiles')
           .select('avatar_url')
           .eq('id', clientId)
           .single();
         avatarToUse = profile?.avatar_url || null;
      }

      // Si no existe, intentamos crearlo
      if (!conversationId) {
        // verificar que se crean los chats en la DB
        const { data: newChat, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_a: clientId,
            participant_b: state.user.id
          })
          .select()
          .single();
        
        if (createError) {
           // Si falla aca, es probable que deba usar una función RPC existente
           // ej: await supabase.rpc('get_or_create_conversation', { ... })
           throw createError;
        }
        conversationId = newChat.id;
      }

      navigation.navigate(ROOT_ROUTES.CHAT_ROOM, {
        conversationId: conversationId,
        otherUserId: clientId,
        userName: clientName, 
        isActive: true, 
        avatarUrl: avatarToUse 
      });

    } catch (err: any) {
      console.error("Error accediendo al chat:", err.message);
      if (err.code === '42703') {
        Alert.alert("Error de Configuración", "No se pudo crear el chat. Verifica las columnas de la tabla 'conversations'.");
      } else {
        Alert.alert("Error", "No se pudo abrir el chat.");
      }
    }
  };

  const handleViewHistory = () => {
    navigation.navigate('PlanHistory', { clientId });
  };

  const navigateToEditor = (type: 'workout' | 'diet', existingPlan?: any) => {
    navigation.navigate('PlanEditor', {
      clientId,
      planType: type,
      existingPlan 
    });
  };

  const handleGoToProfile = () => {
    navigation.navigate(ROOT_ROUTES.PERFIL_PUBLICO, { userId: clientId });
  };

  const PlanCard = ({ title, icon, plan, type }: { title: string, icon: any, plan: any, type: 'workout' | 'diet' }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name={icon} size={24} color={materialColors.schemes.light.primary} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {plan && <View style={styles.badge}><Text style={styles.badgeText}>ACTIVO</Text></View>}
      </View>

      {plan ? (
        <View>
          <Text style={styles.planName}>{plan.title}</Text>
          <Text style={styles.planDate}>
             Actualizado: {new Date(plan.updated_at || plan.created_at).toLocaleDateString()}
          </Text>
          
          <PlanPreview plan={plan} maxItemsPerDay={4} maxDays={3}  />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.editButton]} 
              onPress={() => navigateToEditor(type, plan)}
            >
              <Text style={styles.editButtonText}>Editar / Ver Detalle</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay {type === 'workout' ? 'rutina' : 'dieta'} activa.</Text>
          <TouchableOpacity style={[styles.button, styles.createButton]} onPress={() => navigateToEditor(type)}>
            <Text style={styles.createButtonText}>+ Asignar {title}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchActivePlans} />}
      >
        {/* Secciones Botones */}
        <Text style={styles.sectionTitle}>Datos del Cliente</Text>
        <View style={styles.quickActions}>
           
           {/* BOTON VER PROGRESO (Abre Modal) */}
           <TouchableOpacity style={styles.actionItem} onPress={fetchClientWeightHistory}>
              <Ionicons name="stats-chart" size={28} color="#555" />
              <Text style={styles.actionText}>Ver Progreso</Text>
           </TouchableOpacity>
           
           {/* BOTON VER FICHA (Perfil Publico) */}
           <TouchableOpacity style={styles.actionItem} onPress={handleGoToProfile}>
              <Ionicons name="person" size={28} color="#555" />
              <Text style={styles.actionText}>Ver Ficha</Text>
           </TouchableOpacity>

           {/* BOTON MENSAJE (Redireccion Chat) */}
           <TouchableOpacity style={styles.actionItem} onPress={handleMessageClient}>
              <Ionicons name="chatbubble-ellipses" size={28} color="#555" />
              <Text style={styles.actionText}>Mensaje</Text>
           </TouchableOpacity>
        </View>
        {/* Secciones de Planes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gestión de Planes</Text>
          <TouchableOpacity onPress={handleViewHistory}>
            <Text style={styles.linkText}>Ver Historial</Text>
          </TouchableOpacity>
        </View>
        <PlanCard title="Rutina de Entrenamiento" icon="barbell" plan={activeWorkout} type="workout" />
        <PlanCard title="Plan de Nutrición" icon="restaurant" plan={activeDiet} type="diet" />
      </ScrollView>

      {/* --- MODAL DE HISTORIAL DE PESO --- */}
      <Modal
        visible={showWeightModal}
        animationType="slide"
        presentationStyle="pageSheet" // Estilo iOS moderno (carta arrastrable)
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
             <Text style={styles.modalTitle}>Progreso de Peso</Text>
             <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Ionicons name="close-circle" size={30} color="gray" />
             </TouchableOpacity>
          </View>
          
          {loadingWeight ? (
             <ActivityIndicator size="large" color={materialColors.schemes.light.primary} style={{ marginTop: 50 }} />
          ) : (
             <View style={{ padding: 16 }}>
                <WeightProgressChart 
                   data={weightHistory} 
                   loading={false} 
                   chartKey={1} // Key para evitar bugs de renderizado
                />
                {weightHistory.length === 0 && (
                   <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
                      El alumno aún no ha registrado datos de peso.
                   </Text>
                )}
             </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 10, color: '#333' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold' },
  planName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  planDate: { fontSize: 12, color: '#888', marginBottom: 16 },
  buttonRow: { flexDirection: 'row' },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  editButton: { backgroundColor: '#f0f0f0', flex: 1 },
  editButtonText: { color: '#333', fontWeight: '600' },
  createButton: { backgroundColor: materialColors.schemes.light.primary, width: '100%' },
  createButtonText: { color: 'white', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', paddingVertical: 10 },
  emptyText: { color: '#888', marginBottom: 12, fontStyle: 'italic' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  actionItem: { backgroundColor: 'white', flex: 1, marginHorizontal: 4, alignItems: 'center', padding: 16, borderRadius: 12, elevation: 1 },
  actionText: { marginTop: 8, fontSize: 12, color: '#555' },
  
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },

  linkText: {
    color: materialColors.schemes.light.primary,
    fontSize: 14,
    fontWeight: '600',
  }
});


const previewStyles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  dayTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  rowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 4,
    marginBottom: 4
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 2
  },
  // Columnas Rutina
  colName: { flex: 3 },
  colSets: { flex: 1, textAlign: 'center' },
  colReps: { flex: 1, textAlign: 'center' },
  
  // Columnas Dieta
  colTime: { flex: 1.5 },
  colFood: { flex: 3 },

  colText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#888'
  },
  cellText: {
    fontSize: 11,
    color: '#333'
  },
  moreText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center'
  }
});