import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from "react-native";
import { globalStyles } from "@/utils/globalStyles";
import { materialColors } from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import { useProfessionals } from "@/app/tabs/screens/busqueda-perfiles/hooks/useProfesionals";
import ProfessionalCardItem from "@/components/ProfessionalCard";
import SearchFilterModal from "@/components/SearchFilterModal";
import { FilterState } from "@/app/tabs/screens/busqueda-perfiles/types";
export default function BusquedaPerfiles() {
  const { filteredList, loading, applyFilters, userLocationAvailable } = useProfessionals();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    modalidad: [],
    maxDistancia: "",
    maxPrecio: "",
    minRating: 0,
    profesion: ""
  });

  useEffect(() => {
    applyFilters(searchQuery, filters);
  }, [searchQuery, filters]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.searchHeader}>
        <Text style={globalStyles.title}>Explorar</Text>
        <View style={styles.headerRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="gray" style={{marginRight: 8}} />
            <TextInput 
              placeholder="Buscar..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, (filters.modalidad || filters.maxDistancia || filters.maxPrecio || filters.minRating > 0 || filters.profesion) && styles.filterButtonActive]} 
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={24} color={materialColors.schemes.light.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL */}
      <SearchFilterModal 
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => setShowFilterModal(false)}
        onClear={() => setFilters({modalidad: [], maxDistancia: "", maxPrecio: "", minRating: 0, profesion: ""})}
        userLocationAvailable={userLocationAvailable}
      />

      {/* LISTA */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProfessionalCardItem item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{color: 'gray', marginTop: 20}}>No se encontraron profesionales.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  searchHeader: { padding: 16, paddingTop: 10, backgroundColor: materialColors.schemes.light.surface, elevation: 2, zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  filterButton: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 12 },
  filterButtonActive: { backgroundColor: materialColors.schemes.light.primaryContainer, borderWidth: 1, borderColor: materialColors.schemes.light.primary },
  listContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }
});