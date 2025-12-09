import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "@/utils/globalStyles";
import { materialColors } from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import { useProfessionals } from "@/app/tabs/screens/busqueda-perfiles/hooks/useProfesionals";
import ProfessionalCardItem from "@/components/ProfessionalCard";
import SearchFilterModal from "@/components/SearchFilterModal";
import { FilterState } from "@/app/tabs/screens/busqueda-perfiles/types";
import { ROOT_ROUTES } from "@/utils/constants";
export default function BusquedaPerfiles() {
  // Destructuramos las funcionalidades del hook
  const { list, loading, loadingMore, isInitialState, search, loadMore, userLocationAvailable } = useProfessionals();

  const navigation = useNavigation<any>();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    modalidad: [],
    maxDistancia: "",
    maxPrecio: "",
    minRating: 0,
    profesion: ""
  });

  // Debounce: Esperamos 500ms después de que el usuario deja de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      // Disparamos la búsqueda (Reset de página a 0)
      search(searchQuery, filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const handlePressProfessional = (id: string) => {
    // Navegamos a la pantalla de Perfil Publico pasando el ID
    navigation.navigate(ROOT_ROUTES.PERFIL_PUBLICO, { 
        userId: id,
        hideContactButton: false // Queremos ver el botón de contactar
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.searchHeader}>
        <Text style={globalStyles.title}>Explorar</Text>
        <View style={styles.headerRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="gray" style={{marginRight: 8}} />
            <TextInput 
              placeholder="Buscar por nombre, especialidad..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, (filters.modalidad.length > 0 || filters.maxDistancia || filters.maxPrecio || filters.minRating > 0 || filters.profesion) && styles.filterButtonActive]} 
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

      {/* CONTENIDO PRINCIPAL */}
      {isInitialState ? (
        // 1. ESTADO INICIAL (Vacío)
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#ddd" />
          <Text style={styles.emptyTitle}>Empieza a buscar</Text>
          <Text style={styles.emptyText}>Escribe una especialidad o usa los filtros para encontrar a tu profesional ideal.</Text>
        </View>
      ) : (
        // 2. LISTA DE RESULTADOS
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
              <ProfessionalCardItem 
              item={item} 
              onPress={() => handlePressProfessional(item.id)} 
            />)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          
          // Scroll infinito
          onEndReached={() => loadMore(searchQuery, filters)}
          onEndReachedThreshold={0.5} 
          
          // Spinner inferior al cargar más
          // Solo se muestra si estamos cargando mas y la lista YA tiene items
          ListFooterComponent={
            (loadingMore && list.length > 0) ? (
              <View style={{padding: 20}}>
                <ActivityIndicator color={materialColors.schemes.light.primary} />
              </View>
            ) : null
          }

          // Spinner central inicial o Mensaje de "No encontrado"
          ListEmptyComponent={
            loading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
              </View>
            ) : (
              <View style={styles.center}>
                <Text style={{color: 'gray', marginTop: 20}}>No se encontraron resultados.</Text>
              </View>
            )
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  
  // Estilos para el estado vacío inicial
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, opacity: 0.7 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#888', marginTop: 16 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 8, lineHeight: 22 }
});