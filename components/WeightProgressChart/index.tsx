import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { materialColors } from "@/utils/colors";

const screenWidth = Dimensions.get("window").width;

interface Props {
  data: any[];
  loading: boolean;
  chartKey: number;
}

export default function WeightProgressChart({ data, loading, chartKey }: Props) {
  return (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>Evolución</Text>
      {loading ? (
        <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
      ) : data.length > 1 ? (
        <View style={styles.chartContainer}>
          <LineChart
            key={chartKey}
            data={data}
            color={materialColors.schemes.light.primary}
            thickness={3}
            dataPointsColor={materialColors.schemes.light.primary}
            textColor={materialColors.schemes.light.onSurface}
            xAxisColor={materialColors.schemes.light.outline}
            yAxisColor={materialColors.schemes.light.outline}
            width={screenWidth - 80}
            height={220}
            spacing={40}
            initialSpacing={20}
            hideRules
            yAxisOffset={10}
            curved
            isAnimated
            scrollToEnd
          />
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Registra más pesos para ver tu evolución.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chartSection: { 
    width: '100%', 
    marginTop: 10 
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: '#333' },
  
  chartContainer: { 
    alignItems: 'center', 
    paddingVertical: 10, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 10,
    overflow: 'hidden'
  },
  emptyChart: { alignItems: 'center', padding: 30, backgroundColor: '#f9f9f9', borderRadius: 12 },
  emptyText: { color: '#888' }
});