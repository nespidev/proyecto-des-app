import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  RefreshControl
} from "react-native";
import { materialColors } from "@/utils/colors";
import { globalStyles } from "@/utils/globalStyles";
import MetricsCard from "@/components/MetricsCard";
import WeightProgressChart from "@/components/WeightProgressChart";
import { useWeightMetrics } from "./hooks/useWeightMetrics"; 

export default function MiPesoScreen() {
  // Hook de metricas
  const { 
    peso, setPeso, altura, changeWeight, 
    handleSaveWeight, handleSaveHeight, 
    weightHistory, loading: loadingMetrics, loadingHistory, chartKey, lastUpdate 
  } = useWeightMetrics();

  const [refreshing, setRefreshing] = useState(false);

  // Logica de refresco para metricas
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Aca deberia llamar a una función de "refetch" si el hook useWeightMetrics lo expone
    // Si el hook se actualiza solo al cambiar props o foco, esto es visual
    setTimeout(() => setRefreshing(false), 1000); 
  }, []);

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

        <View style={styles.chartContainer}>
           <WeightProgressChart 
             data={weightHistory} 
             loading={loadingHistory}
             chartKey={chartKey}
           />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 20, 
    alignItems: 'center' 
  },
  chartContainer: {
    marginTop: 20
  }
});