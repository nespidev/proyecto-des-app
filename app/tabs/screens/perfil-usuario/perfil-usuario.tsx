import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import Button from "@/components/Button";
import { materialColors } from "@/utils/colors";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";
import { supabase } from "@/utils/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { selectMediaFromGallery, takePhoto, uploadFileToSupabase } from "@/utils/media-helper";
import CircleIconButton from "@/components/CircleIconButton";

const defaultImage = require("@/assets/user-predetermiando.png");

export default function PerfilUsuario() {
  const { state, dispatch } = useContext<any>(AuthContext);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const user = state.user;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Error al salir", error.message);
  };

  const handleUpdateAvatar = async (source: 'camera' | 'gallery') => {
    try {
      setLoading(true);

      // Obtener asset (camara o galeria)
      const asset = source === 'camera' 
        ? await takePhoto() 
        : await selectMediaFromGallery({ mediaType: 'Images', quality: 0.4 });

      if (!asset) {
        setLoading(false);
        return; // Usuario cancela
      }

      // Feedback visual inmediato
      setImage(asset.uri); 

      // Preparar datos
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/avatar.${fileExt}`; // Nombre fijo para sobrescribir
      
      // Subir usando el helper (FormData)
      const publicUrl = await uploadFileToSupabase(
        'profile-images', // Bucket
        path,
        asset.uri,
        'image/jpeg' // jpg/png para perfil
      );

      if (!publicUrl) throw new Error("Error al obtener URL de imagen");

      // Actualizar base de datos
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithTimestamp })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // ACTUALIZAR EL ESTADO GLOBAL (AUTH CONTEXT)
      dispatch({
        type: AUTH_ACTIONS.LOGIN,
        payload: {
          user: { ...user, avatar_url: urlWithTimestamp },
          token: state.token,
        }
      });

      Alert.alert("EXITO", "Foto actualizada correctamente");

    } catch (error: any) {
      Alert.alert("Error", error.message);
      setImage(null); // Revertir si falla
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
        <Button title="Cerrar Sesión (Forzado)" onPress={handleLogout} />
      </View>
    );
  }

  const rolLabel = user.rol === 'professional' ? 'Profesional' : 'Usuario';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          
          <View>
            <Image
              source={
                image ? { uri: image } 
                : (user.avatar_url ? { uri: user.avatar_url } : defaultImage)
              }
              style={styles.avatar}
            />
            
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}

            <CircleIconButton 
                  icon="photo-camera" 
                  onPress={() => handleUpdateAvatar('camera')} 
                  disabled={loading}
                  style={styles.cameraButton} // Solo pasamos la posición
                />
            <CircleIconButton 
                  icon="edit" 
                  onPress={() => handleUpdateAvatar('gallery')} 
                  disabled={loading}
                  style={styles.editButton} // Solo pasamos la posición
                />
          </View>
          
          <Text style={styles.nombre}>{user.nombre} {user.apellido}</Text>
          <Text style={styles.rol}>{rolLabel}</Text>
        </View>

        {user.rol === 'professional' && (
          <View style={styles.proSection}>          
            <View style={styles.infoRow}>
              <Text style={styles.label}>Profesión:</Text>
              <Text style={styles.value}>{user.titulo || "No especificado"}</Text>
            </View>
            <View style={[styles.infoRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Especialidad:</Text>
              <Text style={styles.value}>{user.especialidad || "General"}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={[styles.value, !user.telefono && styles.placeholderText]}>
            {user.telefono ? user.telefono : "No registrado"}
          </Text>
        </View>

      </View>
      
      <Button
        title="Cerrar Sesión"
        style={styles.exitButton}
        onPress={handleLogout}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: materialColors.schemes.light.surface,
    padding: 16,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 240,
    height: 240,
    borderRadius: 140,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: materialColors.schemes.light.primary,
    backgroundColor: '#e1e1e1'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 12,
    borderRadius: 140,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  editButton: {
    position: 'absolute',
    right: 20,
    bottom: 10,
  },
  cameraButton: {
    position: 'absolute',
    left: 20,
    bottom: 10,
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center"
  },
  rol: {
    fontSize: 16,
    color: materialColors.schemes.light.primary,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 6,
    letterSpacing: 1
  },
  proSection: {
    backgroundColor: materialColors.schemes.light.surfaceContainer,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: materialColors.schemes.light.outlineVariant,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  label: {
    fontWeight: "bold",
    color: "#555",
    fontSize: 16
  },
  value: {
    color: "#333",
    fontSize: 16,
    maxWidth: '60%', 
    textAlign: 'right'
  },
  placeholderText: {
    color: "#999",
    fontStyle: 'italic'
  },
  exitButton: { 
    backgroundColor: materialColors.coreColors.error,
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 100,
    alignSelf: "center",
    width: "100%"
  }
});