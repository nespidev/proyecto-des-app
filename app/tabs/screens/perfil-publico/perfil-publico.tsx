import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { supabase } from "@/utils/supabase";
import { materialColors } from "@/utils/colors";
import { globalStyles } from "@/utils/globalStyles";
import Button from "@/components/Button"; // Asumo que tienes este componente

// Definimos los parámetros que espera recibir esta pantalla
type ParamList = {
  PerfilPublico: {
    userId: string; // El ID del usuario que queremos ver
    hideContactButton?: boolean; // Opcional: Para ocultar el botón si ya vienes del chat
  };
};

export default function PerfilPublico() {
  const route = useRoute<RouteProp<ParamList, 'PerfilPublico'>>();
  const { userId, hideContactButton } = route.params;

  const [profile, setProfile] = useState<any>(null);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // 1. Buscar datos base (Tabla profiles)
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setProfile(userData);

      // 2. Si es profesional, buscar datos extra (Tabla professionals)
      if (userData.rol === 'professional') {
        const { data: proData, error: proError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (!proError) setProfessionalData(proData);
      }

    } catch (error) {
      console.error("Error cargando perfil público:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Usuario no encontrado</Text>
      </View>
    );
  }

  const isProfessional = profile.rol === 'professional';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Image
            source={profile.avatar_url ? { uri: profile.avatar_url } : require("@/assets/user-predetermiando.png")}
            style={styles.avatar}
          />
          <Text style={styles.nombre}>{profile.nombre} {profile.apellido}</Text>
          
          {/* Etiqueta de Rol */}
          <Text style={styles.rolLabel}>
            {isProfessional && professionalData ? professionalData.titulo : "Usuario"}
          </Text>
        </View>

        {/* --- DATOS GENERALES (Se ven siempre) --- */}
        <View style={styles.infoRow}>
            <Text style={styles.label}>Ubicación:</Text>
            <Text style={styles.value}>{profile.direccion_legible || "No especificada"}</Text>
        </View>

        {/* --- DATOS EXCLUSIVOS DE PROFESIONAL (Solo si es Pro) --- */}
        {isProfessional && professionalData && (
          <>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Información Profesional</Text>

            <View style={styles.infoRow}>
                <Text style={styles.label}>Especialidad:</Text>
                <Text style={styles.value}>{professionalData.especialidad}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.label}>Modalidad:</Text>
                <Text style={styles.value}>{professionalData.modalidad}</Text>
            </View>
             <View style={styles.infoRow}>
                <Text style={styles.label}>Precio:</Text>
                <Text style={styles.value}>${professionalData.precio} /mes</Text>
            </View>
            
            <View style={styles.bioContainer}>
                <Text style={styles.label}>Sobre mí:</Text>
                <Text style={styles.bioText}>{professionalData.bio}</Text>
            </View>
          </>
        )}

        {/* --- BOTÓN DE ACCIÓN (Condicional) --- */}
        {/* Si venimos de la búsqueda, mostramos "Contactar". Si venimos del chat, no mostramos nada. */}
        {!hideContactButton && (
            <View style={{ marginTop: 20 }}>
                <Button 
                    title="Enviar Mensaje" 
                    onPress={() => {
                        // Aquí iría la lógica para navegar al chat con este usuario
                        console.log("Ir al chat con:", profile.id);
                    }} 
                />
            </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: materialColors.schemes.light.surface,
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#eee'
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: 'center'
  },
  rolLabel: {
    fontSize: 14,
    color: materialColors.schemes.light.primary,
    marginTop: 4,
    fontWeight: "600"
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8
  },
  label: {
    fontWeight: "bold",
    color: "#555",
    fontSize: 15
  },
  value: {
    color: "#333",
    fontSize: 15,
    maxWidth: '60%',
    textAlign: 'right'
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: materialColors.schemes.light.primary,
    marginBottom: 15
  },
  bioContainer: {
    marginTop: 10
  },
  bioText: {
    marginTop: 6,
    color: '#444',
    lineHeight: 22,
    fontStyle: 'italic'
  }
});