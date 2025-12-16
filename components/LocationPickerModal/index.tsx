import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';
import Button from '@/components/Button';

interface LocationData {
  latitud: number;
  longitud: number;
  direccion: string; // Calle y numero
  ciudad: string;    // la ciudad/barrio
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: LocationData) => void;
  initialLocation?: { lat: number; lng: number; address?: string };
}

export default function LocationPickerModal({ visible, onClose, onConfirm, initialLocation }: Props) {
  
  const mapRef = useRef<MapView>(null);
  
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.lat || -34.6037, 
    longitude: initialLocation?.lng || -58.3816,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [loading, setLoading] = useState(false); // Busqueda global
  const [gpsLoading, setGpsLoading] = useState(false); // Especifico para boton GPS
  
  const [markerCoords, setMarkerCoords] = useState({
    latitude: initialLocation?.lat || -34.6037,
    longitude: initialLocation?.lng || -58.3816,
  });

  // Al abrir si no hay ubicacion inicial, buscar la actual
  useEffect(() => {
    if (visible && !initialLocation) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No podemos acceder a tu ubicación');
        setGpsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      // Actualizar estado
      updateLocationState(latitude, longitude);
      setRegion(newRegion);
      
      // Animar mapa
      mapRef.current?.animateToRegion(newRegion, 1000);

    } catch (error) {
      console.error(error);
    } finally {
      setGpsLoading(false);
    }
  };

  const updateLocationState = async (lat: number, lng: number) => {
    setMarkerCoords({ latitude: lat, longitude: lng });
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (reverseGeocode.length > 0) {
        const item = reverseGeocode[0];
        
        // --- FORMATEO (ciudad/provincia) ---
        const cityName = item.city || item.subregion || item.district || ''; 
        const regionName = item.region || ''; 

        let ciudadFormatted = '';
        if (cityName && regionName) {
            if (cityName === regionName) {
                ciudadFormatted = cityName;
            } else {
                ciudadFormatted = `${cityName}, ${regionName}`;
            }
        } else {
            ciudadFormatted = cityName || regionName || '';
        }

        let fullAddress = '';
        if (item.street) {
            fullAddress = `${item.street} ${item.streetNumber || ''}`.trim();
        } else {
            fullAddress = item.name || ''; 
        }
        // ------------------------------------------------

        setAddress(fullAddress.trim());
        
        return { 
            direccion: fullAddress.trim(), 
            ciudad: ciudadFormatted        
        };
      }
    } catch (error) {
      console.log("Error reverse geocoding", error);
    }
    return null;
  };

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
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        
        setRegion(newRegion);
        updateLocationState(latitude, longitude);
        mapRef.current?.animateToRegion(newRegion, 1000);
        
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
    const locationData = await updateLocationState(markerCoords.latitude, markerCoords.longitude);
    onConfirm({
      latitud: markerCoords.latitude,
      longitud: markerCoords.longitude,
      direccion: address, 
      ciudad: locationData?.ciudad || '' 
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          
          {/* 1. MAPA FULL SCREEN */}
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={false} // boton custom
            onPress={(e) => {
                // Mover marcador al tocar mapa
                updateLocationState(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude);
            }}
          >
            <Marker 
                coordinate={markerCoords} 
                draggable 
                onDragEnd={(e) => updateLocationState(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}
            />
          </MapView>

          {/* TARJETA SUPERIOR (Buscador y GPS) */}
          <View style={styles.topCard}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Seleccionar Ubicación</Text>
                <View style={{width: 24}} /> 
            </View>

            {/* Input Row con Buscador y GPS integrados */}
            <View style={styles.inputRow}>
                <TouchableOpacity onPress={handleSearchAddress}>
                    <Ionicons name="search" size={20} color={materialColors.schemes.light.primary} />
                </TouchableOpacity>
                
                <TextInput
                    style={styles.input}
                    placeholder="Buscar dirección..."
                    value={address}
                    onChangeText={setAddress}
                    onSubmitEditing={handleSearchAddress}
                    returnKeyType="search"
                />
                
                {loading && <ActivityIndicator size="small" color={materialColors.schemes.light.primary} style={{marginRight: 8}}/>}

                <View style={styles.dividerVertical} />

                <TouchableOpacity 
                    style={styles.gpsButton} 
                    onPress={getCurrentLocation}
                    disabled={gpsLoading}
                >
                    {gpsLoading ? (
                        <ActivityIndicator size="small" color={materialColors.schemes.light.primary} />
                    ) : (
                        <MaterialIcons name="my-location" size={22} color="#555" />
                    )}
                </TouchableOpacity>
            </View>
          </View>

          {/* TARJETA INFERIOR (Confirmar) */}
          <View style={styles.bottomCard}>
            <View style={styles.addressContainer}>
                <Ionicons name="location-sharp" size={24} color={materialColors.schemes.light.error} style={{marginRight: 8}}/>
                <Text style={styles.addressLabel} numberOfLines={2}>
                    {address || "Toca el mapa para definir ubicación"}
                </Text>
            </View>
            <Button title="Confirmar Ubicación" onPress={handleConfirm} style={{marginTop: 16}} />
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  topCard: {
    position: 'absolute', 
    top: 50, 
    left: 20, 
    right: 20,
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 16,
    shadowColor: "#000", 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 5,
    zIndex: 10
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  closeBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    borderRadius: 12, 
    paddingHorizontal: 12,
    height: 50
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#333',
    marginLeft: 8,
    marginRight: 8
  },
  dividerVertical: {
    width: 1,
    height: '60%',
    backgroundColor: '#ddd',
    marginHorizontal: 8
  },
  gpsButton: {
    padding: 4
  },

  bottomCard: {
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20,
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 20,
    shadowColor: "#000", 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 5
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  addressLabel: { 
    fontSize: 15, 
    color: '#333', 
    fontWeight: '500', 
    flex: 1,
    textAlign: 'center'
  }
});