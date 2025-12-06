import React from "react";
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { materialColors } from "@/utils/colors";
import { FilterState } from "@/app/tabs/screens/busqueda-perfiles/types";

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onApply: () => void;
  onClear: () => void;
  userLocationAvailable: boolean;
}

export default function SearchFilterModal({ 
  visible, onClose, filters, setFilters, onApply, onClear, userLocationAvailable 
}: Props) {
  
  // Función auxiliar para manejar la selección múltiple
  const toggleModalidad = (option: string) => {
    const current = filters.modalidad;
    if (current.includes(option)) {
      // Si ya está, lo sacamos
      setFilters({ ...filters, modalidad: current.filter(m => m !== option) });
    } else {
      // Si no está, lo agregamos
      setFilters({ ...filters, modalidad: [...current, option] });
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar Búsqueda</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Modalidad (Selección Múltiple) */}
            <Text style={styles.filterLabel}>Modalidad</Text>
            <View style={styles.filterChipsRow}>
                {['Remoto', 'Presencial'].map((mod) => {
                const isSelected = filters.modalidad.includes(mod);
                return (
                  <TouchableOpacity
                    key={mod}
                    style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                    onPress={() => toggleModalidad(mod)}
                  >
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                      {mod}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={materialColors.schemes.light.onSecondaryContainer} style={{marginLeft: 4}}/>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Rating */}
            <Text style={styles.filterLabel}>Puntuación Mínima</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setFilters({...filters, minRating: star})}>
                  <MaterialIcons name={star <= filters.minRating ? "star" : "star-border"} size={32} color="#FFD700" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Precios */}
            <Text style={styles.filterLabel}>Precio Máximo</Text>
            <TextInput
              style={styles.filterInput}
              keyboardType="numeric"
              placeholder="Ej: 20000"
              value={filters.maxPrecio}
              onChangeText={(t) => setFilters({...filters, maxPrecio: t})}
            />

            {/* Distancia */}
            <Text style={styles.filterLabel}>Distancia (km)</Text>
            <View>
              <TextInput
                style={styles.filterInput}
                keyboardType="numeric"
                placeholder="Ej: 10"
                value={filters.maxDistancia}
                onChangeText={(t) => setFilters({...filters, maxDistancia: t})}
                editable={userLocationAvailable}
              />
              {!userLocationAvailable && (
                <Text style={styles.warningText}>* Necesitas ubicación en perfil.</Text>
              )}
            </View>

            {/* Profesión */}
            <Text style={styles.filterLabel}>Profesión</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Ej: Nutricionista"
              value={filters.profesion}
              onChangeText={(t) => setFilters({...filters, profesion: t})}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={onClear}>
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onApply}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalScrollView: { flex: 1 },
  modalScrollContent: { padding: 20, paddingBottom: 40 },
  filterLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10, marginTop: 10 },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: 'transparent' },
  filterChipSelected: { backgroundColor: materialColors.schemes.light.secondaryContainer, borderColor: materialColors.schemes.light.secondary },
  filterChipText: { color: '#666' },
  filterChipTextSelected: { color: materialColors.schemes.light.onSecondaryContainer, fontWeight: 'bold' },
  starsRow: { flexDirection: 'row', gap: 5 },
  filterInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 16 },
  modalFooter: { flexDirection: 'row', padding: 20, paddingBottom: 30, gap: 10, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  clearButton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  clearButtonText: { color: '#666', fontWeight: '600' },
  applyButton: { flex: 2, backgroundColor: materialColors.schemes.light.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  warningText: { color: materialColors.schemes.light.error, fontSize: 12, marginTop: 4 }
});