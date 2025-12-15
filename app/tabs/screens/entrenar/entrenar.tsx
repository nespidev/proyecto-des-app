import React, { useState, useCallback, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  RefreshControl, 
  ActivityIndicator 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { materialColors } from "@/utils/colors";
import { globalStyles } from "@/utils/globalStyles";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";

// Componentes
import MetricsCard from "@/components/MetricsCard"; //
import WeightProgressChart from "@/components/WeightProgressChart"; //
import PlanPreview from "@/components/PlanPreview"; //
import { useWeightMetrics } from "./hooks/useWeightMetrics"; //

export default function Entrenar() {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;

  // Hook de metricas
  const { 
    peso, setPeso, altura, changeWeight, 
    handleSaveWeight, handleSaveHeight, 
    weightHistory, loading: loadingMetrics, loadingHistory, chartKey, lastUpdate 
  } = useWeightMetrics();

  // Estados locales para Planes
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [activeDiet, setActiveDiet] = useState<any>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar planes activos
  const fetchMyPlans = async () => {
    if (!user) return;
    try {
      setLoadingPlans(true);
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('client_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      if (data) {
        setActiveWorkout(data.find((p: any) => p.type === 'workout') || null);
        setActiveDiet(data.find((p: any) => p.type === 'diet') || null);
      }
    } catch (err) {
      console.error("Error cargando planes:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Recargar al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchMyPlans();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Recargamos planes y se podria disparar recarga de metricas si expongo esa funcion en el hook
    await fetchMyPlans(); 
    setRefreshing(false);
  };

  // Componente auxiliar para Estado Vacío (Empty State)
  const EmptyPlanState = ({ icon, text }: { icon: any, text: string }) => (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={48} color="#E0E0E0" style={{ marginBottom: 8 }} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[materialColors.schemes.light.primary]} 
          />
        }
      >
        {/* --- SECCION: METRICAS --- */}
        <View style={styles.headerContainer}>
          <Text style={globalStyles.title}>Mi Progreso</Text>
          <Text style={globalStyles.subtitle}>Controla tus métricas</Text>
        </View>

        <MetricsCard 
          peso={peso}
          setPeso={setPeso}
          altura={altura}
          onSaveWeight={handleSaveWeight}
          onSaveHeight={handleSaveHeight}
          changeWeight={changeWeight}
          loading={loadingMetrics}
          lastUpdate={lastUpdate}
        />

        <WeightProgressChart 
          data={weightHistory} 
          loading={loadingHistory}
          chartKey={chartKey}
        />

        <View style={styles.divider} />

        {/* --- SECCION PLANES ACTIVOS --- */}
        <View style={styles.plansSection}>
          <Text style={[globalStyles.title, styles.mainSectionTitle]}>Planificación Actual</Text>
          
          {loadingPlans ? (
            <ActivityIndicator size="large" color={materialColors.schemes.light.primary} style={{marginTop: 20}} />
          ) : (
            <>
              {/* TARJETA DE RUTINA */}
              <View style={styles.planWrapper}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="barbell" size={20} color="white" />
                  </View>
                  <Text style={styles.sectionTitleText}>Rutina de Entrenamiento</Text>
                </View>

                {activeWorkout ? (
                  <>
                    <Text style={styles.planSubtitle}>{activeWorkout.title}</Text>
                    <PlanPreview 
                      plan={activeWorkout} 
                      maxDays={7} 
                      maxItemsPerDay={10} 
                    />
                  </>
                ) : (
                  <EmptyPlanState 
                    icon="fitness-outline" 
                    text="No tienes una rutina asignada todavía." 
                  />
                )}
              </View>

              {/* TARJETA DE DIETA */}
              <View style={styles.planWrapper}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconBadge}> 
                    <Ionicons name="restaurant" size={20} color="white" />
                  </View>
                  <Text style={styles.sectionTitleText}>Plan Nutricional</Text>
                </View>

                {activeDiet ? (
                  <>
                    <Text style={styles.planSubtitle}>{activeDiet.title}</Text>
                    <PlanPreview 
                      plan={activeDiet} 
                      maxDays={7} 
                      maxItemsPerDay={10} 
                    />
                  </>
                ) : (
                  <EmptyPlanState 
                    icon="nutrition-outline" 
                    text="No tienes una dieta asignada todavía." 
                  />
                )}
              </View>
            </>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20,
    backgroundColor: materialColors.schemes.light.surface, //
    paddingBottom: 60
  },
  headerContainer: { marginBottom: 20, alignItems: 'center' },
  
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 30,
    width: '100%'
  },
  
  plansSection: {
    width: '100%'
  },
  mainSectionTitle: {
    marginBottom: 20,
    color: materialColors.schemes.light.onSurface,
    textAlign: 'left' // Alineado a la izquierda para diferenciar del header principal
  },

  // Wrapper de cada plan
  planWrapper: {
    marginBottom: 32, // Espacio amplio entre rutina y dieta
  },
  
  // Header de cada tarjeta (Icono + Texto)
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconBadge: {
    backgroundColor: materialColors.schemes.light.primary,
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
    elevation: 2, // Sombra sutil en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  planSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
    fontStyle: 'italic'
  },

  // Estilos del Estado Vacío
  emptyContainer: {
    backgroundColor: '#F5F5F5',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderStyle: 'dashed'
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center'
  }
});