import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker'; 
import Button from "@/components/Button";
import { materialColors } from "@/utils/colors";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";

const defaultImage = require("@/assets/user-predetermiando.png");

export default function PerfilUsuario() {
  const { state, dispatch } = useContext<any>(AuthContext);
  const [image, setImage] = useState<string | null>(null);

  // Obtenemos el usuario del estado global
  const user = state.user;

  const handleLogout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería para cambiar la foto.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true, 
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // TODO: Aquí iría la lógica para subir a Supabase Storage
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Cargando perfil...</Text>
        <Button title="Cerrar Sesión (Forzado)" onPress={handleLogout} />
      </View>
    );
  }


  const rolLabel = user.rol === 'professional' ? 'Profesional' : 'Usuario';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                image ? { uri: image } 
                : (user.avatar_url ? { uri: user.avatar_url } : defaultImage)
              }
              style={styles.avatar}
            />
            <View style={styles.editIconBadge}>
               <Text style={{fontSize: 12}}>✏️</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.nombre}>{user.nombre} {user.apellido}</Text>
          <Text style={styles.rol}>{rolLabel}</Text>
        </View>

        {/* --- SECCION PARA PROFESIONALES --- */}
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

        {/* --- DATOS GENERALES --- */}
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
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: materialColors.schemes.light.primary,
    backgroundColor: '#e1e1e1'
  },
  editIconBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 6,
    elevation: 4
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