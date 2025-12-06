import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { materialColors } from "@/utils/colors";
import { globalStyles } from "@/utils/globalStyles";
import Button from "@/components/Button";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";
import { supabase } from "@/utils/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function Entrenar() {
  const { state, dispatch } = useContext<any>(AuthContext);
  const user = state.user;

  const [peso, setPeso] = useState(user?.peso?.toString() || "");
  const [altura, setAltura] = useState(user?.altura?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Para habilitar/deshabilitar edición

  useEffect(() => {
    if (user) {
      setPeso(user.peso?.toString() || "");
      setAltura(user.altura?.toString() || "");
    }
  }, [user]);

  const handleUpdateMetrics = async () => {
    if (!user) return;
    
    if (isNaN(Number(peso)) || isNaN(Number(altura))) {
      Alert.alert("Error", "El peso y la altura deben ser números válidos");
      return;
    }

    try {
      setLoading(true);
      const fechaActual = new Date().toISOString();

      // Actualizar en supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          peso: parseFloat(peso),
          altura: parseFloat(altura),
          fecha_actualizacion_peso: fechaActual
        })
        .eq('id', user.id);

      if (error) throw error;

      // Actualizar contexto global
      const updatedUser = {
        ...user,
        peso: parseFloat(peso),
        altura: parseFloat(altura),
        fecha_actualizacion_peso: fechaActual
      };

      dispatch({
        type: AUTH_ACTIONS.LOGIN,
        payload: {
          user: updatedUser,
          token: state.token,
        }
      });

      Alert.alert("¡Actualizado!", "Tus datos físicos se han guardado correctamente.");
      setIsEditing(false); // Salir del modo edición

    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "No se pudieron actualizar los datos");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={globalStyles.title}>Mi Entrenamiento</Text>
          <Text style={globalStyles.subtitle}>Gestiona tu progreso físico</Text>
        </View>

        {/* TARJETA DE DATOS FÍSICOS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Mis Métricas</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <MaterialIcons 
                name={isEditing ? "close" : "edit"} 
                size={24} 
                color={materialColors.schemes.light.primary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            {/* Input Peso */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
                editable={isEditing}
                placeholder="0.0"
              />
            </View>

            {/* Input Altura */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={altura}
                onChangeText={setAltura}
                keyboardType="numeric"
                editable={isEditing}
                placeholder="0"
              />
            </View>
          </View>
          
          {/* Fecha de ultima actualización */}
          <Text style={styles.lastUpdate}>
            Última actualización: {formatDate(user?.fecha_actualizacion_peso)}
          </Text>

          {/* Botón Guardar - solo visible al editar */}
          {isEditing && (
            <View style={{marginTop: 16}}>
              {loading ? (
                <ActivityIndicator color={materialColors.schemes.light.primary} />
              ) : (
                <Button title="Guardar Cambios" onPress={handleUpdateMetrics} />
              )}
            </View>
          )}
        </View>

        {/* Seccion placeholder para futuras rutinas */}
        <View style={styles.rutinaSection}>
          <Text style={styles.sectionTitle}>Rutina Activa</Text>
          <View style={styles.emptyState}>
            <MaterialIcons name="fitness-center" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No tienes una rutina asignada todavía.</Text>
            <Text style={styles.emptySubText}>Contacta a un profesional para comenzar.</Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20,
    backgroundColor: materialColors.schemes.light.surface,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center'
  },
  card: {
    backgroundColor: materialColors.schemes.light.surfaceContainer,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: materialColors.schemes.light.onSurface
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333'
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: 'transparent',
    color: '#555'
  },
  lastUpdate: {
    marginTop: 12,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  rutinaSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: materialColors.schemes.light.onSurface
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed'
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  emptySubText: {
    marginTop: 4,
    fontSize: 14,
    color: '#999'
  }
});