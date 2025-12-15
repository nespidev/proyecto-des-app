import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';
import Button from '@/components/Button';

interface LocationData {
  latitud: number;
  longitud: number;
  direccion: string; // Calle y número
  ciudad: string;    // Solo la ciudad/barrio
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: LocationData) => void;
  initialLocation?: { lat: number; lng: number; address?: string };
}

export default function LocationPickerModal({ visible, onClose, onConfirm, initialLocation }: Props) {
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.lat || -34.6037, // Default Buenos Aires
    longitude: initialLocation?.lng || -58.3816,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [loading, setLoading] = useState(false);
  const [markerCoords, setMarkerCoords] = useState({
    latitude: initialLocation?.lat || -34.6037,
    longitude: initialLocation?.lng || -58.3816,
  });

  // Al abrir, pedir permisos y centrar en ubicación actual si no hay inicial
  useEffect(() => {
    if (visible && !initialLocation) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No podemos acceder a tu ubicación');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      
      updateLocationState(newRegion.latitude, newRegion.longitude);
      setRegion(newRegion);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función central para actualizar coordenadas y buscar la dirección (Reverse Geocoding)
  const updateLocationState = async (lat: number, lng: number) => {
    setMarkerCoords({ latitude: lat, longitude: lng });
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (reverseGeocode.length > 0) {
        const item = reverseGeocode[0];
        
        // 1. Detectamos las partes
        const cityName = item.city || item.subregion || item.district || ''; // Ej: Posadas
        const regionName = item.region || ''; // Ej: Misiones

        // 2. CONSTRUCCIÓN ESTRICTA DE "CIUDAD" (Ciudad, Provincia)
        let ciudadFormatted = '';
        
        if (cityName && regionName) {
            // Evitar duplicados si se llaman igual (ej: Buenos Aires, Buenos Aires)
            if (cityName === regionName) {
                ciudadFormatted = cityName;
            } else {
                ciudadFormatted = `${cityName}, ${regionName}`;
            }
        } else {
            // Si falta alguno, usamos el que esté disponible
            ciudadFormatted = cityName || regionName || '';
        }

        // 3. Construcción de Dirección Legible (Calle + Ciudad Formateada)
        let fullAddress = '';
        if (item.street) {
             // Ej: Calle Falsa 123
            fullAddress = `${item.street} ${item.streetNumber || ''}`.trim();
        } else {
            fullAddress = item.name || ''; 
        }

        setAddress(fullAddress.trim());
        
        // RETORNAMOS EL FORMATO SOLICITADO
        return { 
            direccion: fullAddress.trim(), // Ej: "San Martín 123, Posadas, Misiones"
            ciudad: ciudadFormatted        // Ej: "Posadas, Misiones"
        };
      }
    } catch (error) {
      console.log("Error reverse geocoding", error);
    }
    return null;
};

  // Buscar dirección por texto (Geocoding)
  const handleSearchAddress = async () => {
    if (!address.trim()) return;
    setLoading(true);
    try {
      const geocode = await Location.geocodeAsync(address);
      if (geocode.length > 0) {
        const { latitude, longitude } = geocode[0];
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05, // Zoom un poco más lejos para ver la ciudad
          longitudeDelta: 0.05,
        };
        setRegion(newRegion);
        
        // IMPORTANTE: Llamamos a esto para que el texto se actualice 
        // de "Calle 123" a "Ciudad, Provincia" automáticamente
        updateLocationState(latitude, longitude); 
        
      } else {
        Alert.alert("No encontrado", "No pudimos encontrar esa dirección.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    // Si el usuario movió el mapa, recalculamos para asegurar tener la ciudad separada
    const locationData = await updateLocationState(markerCoords.latitude, markerCoords.longitude);
    
    onConfirm({
      latitud: markerCoords.latitude,
      longitud: markerCoords.longitude,
      direccion: address, // Lo que está escrito en el input
      ciudad: locationData?.ciudad || '' // La ciudad detectada
    });
    onClose();
};

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.container}>
          
          {/* Header del Modal */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Seleccionar Ubicación</Text>
            <TouchableOpacity onPress={getCurrentLocation}>
              <Ionicons name="locate" size={24} color={materialColors.schemes.light.primary} />
            </TouchableOpacity>
          </View>

          {/* Barra de Búsqueda Manual */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu dirección o ciudad..."
              value={address}
              onChangeText={setAddress}
              onSubmitEditing={handleSearchAddress}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearchAddress} style={styles.searchBtn}>
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Mapa */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              showsUserLocation={true} 
              
              // Opcional: Ocultamos el botón nativo de Google/Apple porque ya creamos uno personalizado en el header
              showsMyLocationButton={false}

              onRegionChangeComplete={(reg) => {
                 // Opción: Actualizar solo al soltar para no saturar
                 // Aquí podrías actualizar marker si quieres que el pin esté fijo al centro
              }}
              onPress={(e) => {
                // Mover marcador al tocar el mapa
                updateLocationState(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude);
              }}
            >
              <Marker 
                coordinate={markerCoords} 
                draggable 
                onDragEnd={(e) => updateLocationState(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}
              />
            </MapView>
            {loading && (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
              </View>
            )}
          </View>

          {/* Footer Confirmación */}
          <View style={styles.footer}>
            <Text style={styles.addressLabel} numberOfLines={1}>
                {address || "Selecciona un punto en el mapa"}
            </Text>
            <Button title="Confirmar Ubicación" onPress={handleConfirm} />
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50 },
  title: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: { padding: 8 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 12, fontSize: 16 },
  searchBtn: { backgroundColor: materialColors.schemes.light.primary, padding: 12, borderRadius: 8, justifyContent: 'center' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { width: '100%', height: '100%' },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)' },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  addressLabel: { fontSize: 14, color: '#666', marginBottom: 10, textAlign: 'center' }
});