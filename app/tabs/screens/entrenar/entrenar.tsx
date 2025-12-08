import React from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { materialColors } from "@/utils/colors";
import { globalStyles } from "@/utils/globalStyles";
import { useWeightMetrics } from "./hooks/useWeightMetrics";
import MetricsCard from "@/components/MetricsCard";
import WeightProgressChart from "@/components/WeightProgressChart";

export default function Entrenar() {
  const { 
    peso, setPeso, altura, changeWeight, 
    handleSaveWeight, handleSaveHeight, 
    weightHistory, loading, loadingHistory, chartKey, lastUpdate 
  } = useWeightMetrics();

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
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
          loading={loading}
          lastUpdate={lastUpdate}
        />

        <WeightProgressChart 
          data={weightHistory} 
          loading={loadingHistory}
          chartKey={chartKey}
        />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20,
    backgroundColor: materialColors.schemes.light.surface,
    paddingBottom: 40
  },
  headerContainer: { marginBottom: 20, alignItems: 'center' },
});