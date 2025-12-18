import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';
import Button from '@/components/Button';

interface LocationData {
  latitud: number;
  longitud: number;
  direccion: string; 
  ciudad: string;    
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
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [markerCoords, setMarkerCoords] = useState({
    latitude: initialLocation?.lat || -34.6037,
    longitude: initialLocation?.lng || -58.3816,
  });

  // Al abrir, si no hay ubicación inicial, buscamos la actual
  useEffect(() => {
    if (visible && !initialLocation) {
      handleGoToMyLocation();
    }
  }, [visible]);

  // LOGICA DE GEOLOCALIZACION
  const handleGoToMyLocation = async () => {
    setGpsLoading(true);
    try {
      // Validar Permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Se requiere permiso de ubicación.");
        return;
      }

      // Obtener ubicación con patrón seguro (evita timeouts en Android)
      const location = await getSingleLocation();

      if (location) {
        const { latitude, longitude } = location.coords;
        
        const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };

        // Actualizar UI
        updateLocationState(latitude, longitude);
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      }

    } catch (error: any) {
      console.log("Error GPS:", error);
      Alert.alert("Ubicación no disponible", "Verifica que tu GPS esté activo e inténtalo de nuevo.");
    } finally {
      setGpsLoading(false);
    }
  };


  // Helper para esperar la señal GPS sin timeouts agresivos
  const getSingleLocation = async (): Promise<Location.LocationObject> => {
    return new Promise(async (resolve, reject) => {
      let subscription: Location.LocationSubscription | null = null;
      
      const timer = setTimeout(() => {
        if (subscription) subscription.remove();
        reject(new Error("Tiempo de espera agotado obteniendo GPS"));
      }, 10000); // 10 seg de paciencia máxima

      try {
        subscription = await Location.watchPositionAsync(
          { 
            accuracy: Location.Accuracy.High,
            distanceInterval: 1 
          },
          (location) => {
            clearTimeout(timer);
            subscription?.remove();
            resolve(location);
          }
        );
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  };

  const updateLocationState = async (lat: number, lng: number) => {
    setMarkerCoords({ latitude: lat, longitude: lng });
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (reverseGeocode.length > 0) {
        const item = reverseGeocode[0];
        
        // FORMATEO (ciudad/provincia)
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

        const finalAddress = fullAddress.trim() || "Ubicación seleccionada";
        setAddress(finalAddress);
        
        return { 
            direccion: finalAddress, 
            ciudad: ciudadFormatted        
        };
      }
    } catch (error) {
      console.log("Error reverse geocoding", error);
      setAddress("Ubicación seleccionada");
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
      Alert.alert("Error", "Ocurrió un error al buscar.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    // Aseguramos tener el dato geocodificado más reciente
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
            showsMyLocationButton={false} 
            onPress={(e) => {
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

            {/* Input Row Unificado */}
            <View style={styles.inputRow}>
                <TouchableOpacity onPress={handleSearchAddress}>
                    <Ionicons name="search" size={20} color={materialColors.schemes.light.primary} />
                </TouchableOpacity>
                
                <TextInput
                    style={styles.input}
                    placeholder="Buscar dirección (ej. Calle 123)"
                    value={address}
                    onChangeText={setAddress}
                    onSubmitEditing={handleSearchAddress}
                    returnKeyType="search"
                />
                
                {loading && <ActivityIndicator size="small" color={materialColors.schemes.light.primary} style={{marginRight: 8}}/>}

                <View style={styles.dividerVertical} />

                <TouchableOpacity 
                    style={styles.gpsButton} 
                    onPress={handleGoToMyLocation}
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
    shadowOffset: {width: 0, height: 4},
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
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center'
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
    shadowOffset: {width: 0, height: 4},
    elevation: 5
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    paddingHorizontal: 8
  },
  addressLabel: { 
    fontSize: 15, 
    color: '#333', 
    fontWeight: '600', 
    flex: 1,
    textAlign: 'center',
    marginLeft: 4
  }
});