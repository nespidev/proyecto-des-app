import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker'; // Importamos la librería oficial
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";
import { materialColors } from "@/utils/colors";
import { useContext } from "react";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";

// Imagen por defecto si no hay una seleccionada
const defaultImage = require("@/assets/user-predetermiando.png");

const usuarioPrueba = {
  nombre: "Lucas Coquet",
  edad: 21,
  peso: "80kg",
  objetivo: "Fuerza",
  correo: "lucasscoquet@gmail.com",
  tel: "123456789",
};

export default function PerfilUsuario() {
  const { dispatch } = useContext(AuthContext);
  // Estado para guardar la URI de la imagen seleccionada
  const [image, setImage] = useState<string | null>(null);

  const handleLogout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }
// Función para seleccionar imagen
  const pickImage = async () => {
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería para cambiar la foto.");
      return;
    }

    // 2. Abrir la galería
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      
      allowsEditing: true, 
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={[globalStyles.title, { textAlign: "center", marginVertical: 12 }]}>
        Perfil Usuario
      </Text> */}

      <View style={styles.card}>
        <View style={styles.header}>
          {/* Imagen se puede tocar */}
          <TouchableOpacity onPress={pickImage}>
            <Image
              // Si hay imagen en el estado la usa. Si no usa la default.
              source={image ? { uri: image } : defaultImage}
              style={styles.avatar}
            />
            {/* Un indicador visual de edicion */}
            <View style={styles.editIconBadge}>
               <Text style={{fontSize: 12}}>✏️</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.nombre}>{usuarioPrueba.nombre}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Edad:</Text>
          <Text style={styles.value}>{usuarioPrueba.edad}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Correo:</Text>
          <Text style={styles.value}>{usuarioPrueba.correo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tel:</Text>
          <Text style={styles.value}>{usuarioPrueba.tel}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Peso:</Text>
          <Text style={styles.value}>{usuarioPrueba.peso}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Objetivo:</Text>
          <Text style={styles.value}>{usuarioPrueba.objetivo}</Text>
        </View>
      </View>
      
      <Button
        title="Salir de la cuenta"
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
    marginBottom: 16,
  },
  avatar: {
    width: 240,
    height: 240,
    borderRadius: 180,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: materialColors.schemes.light.primary,
  },
  editIconBadge: {
    position: 'absolute',
    right: 30,
    bottom: 22,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    elevation: 2
  },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    color: "#333",
  },
  exitButton: { 
    backgroundColor: materialColors.coreColors.error,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 100,
    alignSelf: "center",
  }
});