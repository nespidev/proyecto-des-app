import React, { useState, useCallback, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { materialColors } from "@/utils/colors";
import { globalStyles } from "@/utils/globalStyles";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import PlanPreview from "@/components/PlanPreview";
import Card from "@/components/Card";

export default function PlanificacionScreen() {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;
  const navigation = useNavigation<any>();
   
  const handleViewHistory = () => {
    navigation.navigate('PlanHistory', { clientId: user.id });
  };

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

  useFocusEffect(
    useCallback(() => {
      fetchMyPlans();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyPlans(); 
    setRefreshing(false);
  };

  const EmptyPlanState = ({ icon, text }: { icon: any, text: string }) => (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={48} color="#E0E0E0" style={{ marginBottom: 8 }} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );

  return (
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
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
            <Text style={globalStyles.title}>Planificación Actual</Text>
            
            <TouchableOpacity 
              onPress={handleViewHistory}
              style={styles.historyLinkContainer}
              activeOpacity={0.6}
            >
              <Text style={styles.historyLinkText}>Ver Historial</Text>
            </TouchableOpacity>
        </View>

        <Text style={globalStyles.subtitle}>Tus rutinas y dietas activas</Text>
      </View>
       
      {loadingPlans ? (
        <ActivityIndicator size="large" color={materialColors.schemes.light.primary} style={{marginTop: 40}} />
      ) : (
        <View style={styles.plansSection}>
           
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
                <Card>
                  <PlanPreview 
                    plan={activeWorkout} 
                    maxDays={7} 
                    maxItemsPerDay={10} 
                  />
                </Card>
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
                <Card>
                  <PlanPreview 
                    plan={activeDiet} 
                    maxDays={7} 
                    maxItemsPerDay={10} 
                  />
                </Card>
              </>
            ) : (
              <EmptyPlanState 
                icon="nutrition-outline" 
                text="No tienes una dieta asignada todavía." 
              />
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20,
    backgroundColor: materialColors.schemes.light.surface,
    paddingBottom: 60
  },
  headerContainer: { 
    marginBottom: 30, 
  },
  

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4 
  },
  historyLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4
  },
  historyLinkText: {
    color: materialColors.schemes.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  plansSection: {
    width: '100%'
  },
  planWrapper: {
    marginBottom: 32,
  },
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
    elevation: 2,
    shadowColor: "#000",
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