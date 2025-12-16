import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';
import Button from '@/components/Button';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (distancia: string, location?: LocationData) => void;
  initialDistancia: string;
  initialLocation?: { latitude: number; longitude: number };
}

export default function RangeMapSelector({ 
  visible, onClose, onConfirm, initialDistancia, initialLocation 
}: Props) {
  
  const mapRef = useRef<MapView>(null); // Referencia para mover el mapa programaticamente
  const [distancia, setDistancia] = useState(initialDistancia);
  
  // Coordenadas del PIN
  const [coords, setCoords] = useState(initialLocation || { latitude: -34.6037, longitude: -58.3816 });
  
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);

  // Al abrir, buscamos la dirección inicial
  useEffect(() => {
    if (visible && initialLocation) {
        getAddress(initialLocation.latitude, initialLocation.longitude);
    }
  }, [visible, initialLocation]);

  const getAddress = async (lat: number, lon: number) => {
    setLoadingAddress(true);
    try {
      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (result.length > 0) {
        const item = result[0];
        // Construimos dirección priorizando nombre de calle o ciudad
        const street = item.street ? `${item.street} ${item.streetNumber || ''}`.trim() : '';
        const area = item.city || item.subregion || item.district || '';
        
        // Lógica: Si hay calle, muestra calle + ciudad. Si no, muestra Ciudad, Provincia.
        let finalText = street ? `${street}, ${area}` : area;
        
        // Si no encontró nada legible, usamos coordenadas como fallback
        if (!finalText.replace(/,/g, '').trim()) {
            finalText = `Lat: ${lat.toFixed(3)}, Long: ${lon.toFixed(3)}`;
        }

        setAddress(finalText);
      }
    } catch (e) {
      console.log("Error geocoding:", e);
      setAddress("Ubicación personalizada");
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapPress = (e: any) => {
    const newCoords = e.nativeEvent.coordinate;
    setCoords(newCoords);
    getAddress(newCoords.latitude, newCoords.longitude);
  };

  const handleGoToMyLocation = async () => {
    setLoadingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Actualizar estado
      setCoords({ latitude, longitude });
      getAddress(latitude, longitude);

      //  Mover camara del mapa
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No pudimos obtener tu ubicación actual.");
    } finally {
      setLoadingGPS(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(distancia, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: address
    });
    onClose();
  };

  const radiusMeters = (parseFloat(distancia) || 1) * 1000;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        
        <MapView
          ref={mapRef} // Conectamar la referencia
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          onPress={handleMapPress}
          showsUserLocation={true} // Muestra el punto azul
          showsMyLocationButton={false} // Ocultar nativo para usar el custom
        >
          <Marker coordinate={coords} />
          
          <Circle 
            center={coords}
            radius={radiusMeters}
            fillColor="rgba(66, 133, 244, 0.2)"
            strokeColor="rgba(66, 133, 244, 0.5)"
          />
        </MapView>

        {/* Panel superior */}
        <View style={styles.topCard}>
          <View style={styles.headerRow}>
             <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="arrow-back" size={24} color="#333" />
             </TouchableOpacity>
             <Text style={styles.title}>Definir Rango</Text>
             {/* Boton vacio para equilibrar header */}
             <View style={{width: 24}} /> 
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="location-sharp" size={20} color={materialColors.schemes.light.primary} />
            
            <Text style={styles.addressText} numberOfLines={1}>
                {loadingAddress ? "Buscando dirección..." : (address || "Toca el mapa para ubicar")}
            </Text>

            {/* boton mi Ubicación */}
            <TouchableOpacity 
                style={styles.gpsButton} 
                onPress={handleGoToMyLocation}
                disabled={loadingGPS}
            >
                {loadingGPS ? (
                    <ActivityIndicator size="small" color={materialColors.schemes.light.primary} />
                ) : (
                    <MaterialIcons name="my-location" size={22} color="#555" />
                )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Panel inferior */}
        <View style={styles.bottomCard}>
            <Text style={styles.label}>Distancia (km)</Text>
            <View style={styles.sliderContainer}>
                <TouchableOpacity 
                    style={styles.adjustBtn} 
                    onPress={() => setDistancia((prev) => Math.max(1, (parseFloat(prev)||0) - 1).toString())}
                >
                    <Ionicons name="remove" size={24} color="#333"/>
                </TouchableOpacity>
                
                <TextInput 
                    style={styles.distInput}
                    keyboardType="numeric"
                    value={distancia}
                    onChangeText={setDistancia}
                />
                
                <TouchableOpacity 
                    style={styles.adjustBtn} 
                    onPress={() => setDistancia((prev) => ((parseFloat(prev)||0) + 1).toString())}
                >
                    <Ionicons name="add" size={24} color="#333"/>
                </TouchableOpacity>
            </View>
            
            <Button title="Confirmar Zona" onPress={handleConfirm} style={{marginTop: 16}} />
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topCard: {
    position: 'absolute', top: 50, left: 20, right: 20,
    backgroundColor: 'white', borderRadius: 12, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, elevation: 5
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  closeBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: 'bold' },
  
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    padding: 10, 
    borderRadius: 8, 
    gap: 8 
  },
  addressText: { flex: 1, color: '#333', fontSize: 14 },
  
  gpsButton: {
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },

  bottomCard: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    backgroundColor: 'white', borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, elevation: 5
  },
  label: { fontSize: 14, color: '#666', marginBottom: 8, textAlign: 'center' },
  sliderContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  adjustBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  distInput: { 
    width: 80, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', 
    textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: materialColors.schemes.light.primary 
  }
});