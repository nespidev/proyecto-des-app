import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { materialColors } from "@/utils/colors";

interface Props {
  peso: string;
  setPeso: (v: string) => void;
  altura: string;
  onSaveWeight: () => void;
  onSaveHeight: (h: string) => void;
  changeWeight: (amount: number) => void;
  loading: boolean;
  lastUpdate: string | null | undefined;
}

export default function MetricsCard({ peso, setPeso, altura, onSaveWeight, onSaveHeight, changeWeight, loading, lastUpdate }: Props) {
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [tempAltura, setTempAltura] = useState("");

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const saveHeight = () => {
    onSaveHeight(tempAltura);
    setIsEditingHeight(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.metricsRow}>
        
        {/* COLUMNA PESO */}
        <View style={styles.weightColumn}>
          <Text style={styles.labelMain}>PESO ACTUAL</Text>
          <View style={styles.weightControlContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.weightInput}
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
                maxLength={5}
                placeholder="0.0"
              />
              <Text style={styles.unit}>kg</Text>
            </View>
            <View style={styles.arrowsGroup}>
              <TouchableOpacity onPress={() => changeWeight(0.1)} style={styles.arrowButton}>
                <MaterialIcons name="keyboard-arrow-up" size={28} color={materialColors.schemes.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeWeight(-0.1)} style={styles.arrowButton}>
                <MaterialIcons name="keyboard-arrow-down" size={28} color={materialColors.schemes.light.primary} />
              </TouchableOpacity>
            </View>
          </View>
          {loading ? (
             <ActivityIndicator style={{marginTop: 10}} color={materialColors.schemes.light.primary}/>
          ) : (
            <TouchableOpacity style={styles.updateButton} onPress={onSaveWeight}>
              <MaterialIcons name="save" size={18} color="white" />
              <Text style={styles.updateButtonText}>Actualizar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.verticalDivider} />

        {/* COLUMNA ALTURA */}
        <View style={styles.heightColumn}>
          <Text style={styles.labelSecondary}>ALTURA</Text>
          {isEditingHeight ? (
            <View style={styles.heightEditContainer}>
              <TextInput 
                style={styles.heightInput} 
                value={tempAltura} 
                onChangeText={setTempAltura}
                keyboardType="numeric"
                placeholder={altura}
                autoFocus
              />
              <TouchableOpacity onPress={saveHeight}>
                <MaterialIcons name="check" size={24} color="green" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.heightDisplay}>
              <Text style={styles.heightValue}>{altura || "--"} <Text style={styles.unitSmall}>cm</Text></Text>
              <TouchableOpacity onPress={() => { setTempAltura(altura); setIsEditingHeight(true); }} style={styles.editIcon}>
                <MaterialIcons name="edit" size={14} color="#999" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.lastUpdate}>Última actualización: {formatDate(lastUpdate)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, marginBottom: 24 },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    weightColumn: { flex: 2, alignItems: 'center', paddingRight: 10 },
    labelMain: { fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 4, letterSpacing: 1 },
    weightControlContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', marginRight: 10 },
    weightInput: { fontSize: 42, fontWeight: 'bold', color: materialColors.schemes.light.primary, minWidth: 80, textAlign: 'right', padding: 0 },
    unit: { fontSize: 16, color: '#666', fontWeight: 'normal', marginBottom: 8, marginLeft: 4 },
    arrowsGroup: { flexDirection: 'column', gap: 4 },
    arrowButton: { backgroundColor: '#f5f5f5', borderRadius: 6, padding: 2 },
    updateButton: { flexDirection: 'row', backgroundColor: materialColors.schemes.light.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignItems: 'center', gap: 6 },
    updateButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    verticalDivider: { width: 1, height: '70%', backgroundColor: '#eee', marginHorizontal: 10 },
    heightColumn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    labelSecondary: { fontSize: 10, fontWeight: 'bold', color: '#aaa', marginBottom: 6, letterSpacing: 1 },
    heightDisplay: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    heightValue: { fontSize: 22, color: '#555', fontWeight: '600' },
    unitSmall: { fontSize: 12, color: '#999' },
    editIcon: { padding: 6, backgroundColor: '#f9f9f9', borderRadius: 12 },
    heightEditContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    heightInput: { borderBottomWidth: 1, borderColor: materialColors.schemes.light.primary, width: 50, textAlign: 'center', fontSize: 18 },
    lastUpdate: { marginTop: 16, fontSize: 11, color: '#999', fontStyle: 'italic', textAlign: 'center' }
});