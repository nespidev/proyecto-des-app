import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Modal, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { materialColors } from '@/utils/colors';
import { ROOT_ROUTES } from '@/utils/constants';
import { AuthContext } from "@/shared/context/auth-context";

// --- REUTILIZACIÓN: Importamos tu componente de gráfico existente ---
import WeightProgressChart from '@/components/WeightProgressChart'; 

export default function ClientDashboardScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { state } = useContext<any>(AuthContext);
  const { clientId, clientName } = route.params;

  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [activeDiet, setActiveDiet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS NUEVOS PARA EL MODAL DE PESO ---
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [loadingWeight, setLoadingWeight] = useState(false);

  // 1. Cargar Planes (Lógica existente)
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

  // --- 2. NUEVA LÓGICA: Cargar Historial de Peso del Cliente ---
  const fetchClientWeightHistory = async () => {
    setLoadingWeight(true);
    setShowWeightModal(true); // Abrimos el modal

    const { data, error } = await supabase
      .from('weight_logs')
      .select('weight, recorded_at')
      .eq('user_id', clientId) // Importante: ID del cliente, no el mío
      .order('recorded_at', { ascending: true });

    if (!error && data) {
      // Formateamos igual que en tu hook useWeightMetrics
      const formatted = data.map((log: any) => ({
        value: log.weight,
        date: new Date(log.recorded_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        label: new Date(log.recorded_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      }));
      setWeightHistory(formatted);
    }
    setLoadingWeight(false);
  };

// --- 3. LÓGICA CORREGIDA: Usando la VISTA para buscar ---
  const handleMessageClient = async () => {
    if (!state.user) return;
    
    try {
      // PASO 1: Buscar si ya existe el chat usando la VISTA (conversations_view)
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

      // PASO 2: Si NO existe, intentamos crearlo
      if (!conversationId) {
        // NOTA: Si la tabla 'conversations' no tiene professional_id/client_id,
        // verifica cómo se crean los chats en tu DB. Asumimos este esquema por ahora:
        const { data: newChat, error: createError } = await supabase
          .from('conversations')
          .insert({
            professional_id: state.user.id, // <--- Verifica que estos nombres sean correctos en tu DB
            client_id: clientId
          })
          .select()
          .single();
        
        if (createError) {
           // Si falla aquí, es probable que debas usar una función RPC existente
           // ej: await supabase.rpc('get_or_create_conversation', { ... })
           throw createError;
        }
        conversationId = newChat.id;
      }

      // PASO 3: Navegar
      navigation.navigate(ROOT_ROUTES.CHAT_ROOM, {
        conversationId: conversationId,
        otherUserId: clientId,
        userName: clientName, 
        isActive: true, 
        avatarUrl: avatarToUse 
      });

    } catch (err: any) {
      console.error("Error accediendo al chat:", err.message);
      // Feedback más amigable si falla la creación por estructura de tabla
      if (err.code === '42703') {
        Alert.alert("Error de Configuración", "No se pudo crear el chat. Verifica las columnas de la tabla 'conversations'.");
      } else {
        Alert.alert("Error", "No se pudo abrir el chat.");
      }
    }
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

  // --- RENDERIZADO (Componente PlanCard igual que antes) ---
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
          <Text style={styles.planDate}>Actualizado: {new Date(plan.updated_at || plan.recorded_at).toLocaleDateString()}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => navigateToEditor(type, plan)}>
              <Text style={styles.editButtonText}>Editar</Text>
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
        {/* Secciones de Planes */}
        <Text style={styles.sectionTitle}>Gestión de Planes</Text>
        <PlanCard title="Rutina de Entrenamiento" icon="barbell" plan={activeWorkout} type="workout" />
        <PlanCard title="Plan de Nutrición" icon="restaurant" plan={activeDiet} type="diet" />

        {/* Acciones Rápidas Actualizadas */}
        <Text style={styles.sectionTitle}>Datos del Alumno</Text>
        <View style={styles.quickActions}>
           
           {/* BOTÓN VER PROGRESO (Abre Modal) */}
           <TouchableOpacity style={styles.actionItem} onPress={fetchClientWeightHistory}>
              <Ionicons name="stats-chart" size={28} color="#555" />
              <Text style={styles.actionText}>Ver Progreso</Text>
           </TouchableOpacity>
           
           {/* BOTÓN VER FICHA (Perfil Público) */}
           <TouchableOpacity style={styles.actionItem} onPress={handleGoToProfile}>
              <Ionicons name="person" size={28} color="#555" />
              <Text style={styles.actionText}>Ver Ficha</Text>
           </TouchableOpacity>

           {/* BOTÓN MENSAJE (Redirección Chat) */}
           <TouchableOpacity style={styles.actionItem} onPress={handleMessageClient}>
              <Ionicons name="chatbubble-ellipses" size={28} color="#555" />
              <Text style={styles.actionText}>Mensaje</Text>
           </TouchableOpacity>
        </View>
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
                {/* REUTILIZACIÓN: Tu componente Chart */}
                <WeightProgressChart 
                   data={weightHistory} 
                   loading={false} 
                   chartKey={1} // Key única para evitar bugs de renderizado
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
  
  // Estilos del Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' }
});