import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { supabase } from "@/utils/supabase";
import { materialColors } from "@/utils/colors";
import Button from "@/components/Button"; 
import { AuthContext } from "@/shared/context/auth-context";
import { ROOT_ROUTES } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";

type ParamList = {
  PerfilPublico: {
    userId: string; // ID del Profesional
    hideContactButton?: boolean; 
  };
};

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  total_sessions: number;
  validity_days: number;
  is_active: boolean;
}

export default function PerfilPublico() {
  const route = useRoute<RouteProp<ParamList, 'PerfilPublico'>>();
  const navigation = useNavigation<any>();
  const { userId } = route.params; // ID del profesional que estamos visitando

  const { state } = useContext<any>(AuthContext);
  const currentUser = state?.user; 

  // Estados de datos
  const [profile, setProfile] = useState<any>(null);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [myContractIds, setMyContractIds] = useState<Set<string>>(new Set());
  
  // Estado para el chat
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // 1. Datos personales (Tabla profiles)
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setProfile(userData);

      // 2. Si es profesional, buscamos sus datos específicos
      if (userData.rol === 'professional') {
        // A. Perfil Profesional
        const { data: proData } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', userId)
          .single();
        if (proData) setProfessionalData(proData);

        // B. Servicios Activos
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', userId)
          .eq('is_active', true);
        if (servicesData) setServices(servicesData);

        // C. Datos del Usuario Actual (Cliente)
        if (currentUser) {
            // C.1 Buscar Contratos Activos
            const { data: contractsData } = await supabase
                .from('contracts')
                .select('service_id')
                .eq('client_id', currentUser.id)
                .eq('professional_id', userId)
                .eq('status', 'active');
            
            if (contractsData) {
                const ids = new Set(contractsData.map((c: any) => c.service_id));
                setMyContractIds(ids);
            }

            // C.2 Intentar pre-cargar la conversación si existe
            // Usamos la vista 'conversations_view' que filtra por seguridad
            const { data: chatData } = await supabase
                .from('conversations_view')
                .select('id')
                .eq('other_user_id', userId)
                .maybeSingle();

            if (chatData) {
                setConversationId(chatData.id);
            }
        }
      }

    } catch (error) {
      console.error("Error cargando perfil público:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyService = async (service: Service) => {
    if (!currentUser) {
        Alert.alert("Error", "Debes iniciar sesión para contratar.");
        return;
    }

    Alert.alert(
      "Confirmar Contratación",
      `¿Deseas adquirir "${service.title}" por $${service.price}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: async () => {
            // Calcular fechas de vigencia
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + (service.validity_days || 30));

            // Insertar contrato en Supabase
            const { error } = await supabase
              .from('contracts')
              .insert({
                client_id: currentUser.id,
                professional_id: userId,
                service_id: service.id,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                total_credits: service.total_sessions,
                used_credits: 0,
                status: 'active'
              });

            if (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo procesar la contratación.");
            } else {
              Alert.alert("¡Éxito!", "Servicio contratado correctamente.");
              fetchProfileData(); // Recargar datos para actualizar la UI
              
              // Crear chat automaticamente al contratar
              getOrCreateConversation(); 
            }
          }
        }
      ]
    );
  };

  // --- LÓGICA CRÍTICA DEL CHAT ---
  const getOrCreateConversation = async () => {
    if (conversationId) {
        navigateToChat(conversationId);
        return;
    }

    try {
        setChatLoading(true);

        // 1. Reintentar buscar en la vista por si acaso
        const { data: existingChat } = await supabase
            .from('conversations_view')
            .select('id')
            .eq('other_user_id', userId)
            .maybeSingle();

        if (existingChat) {
            setConversationId(existingChat.id);
            navigateToChat(existingChat.id);
            return;
        }

        // 2. Si no existe, CREAR la conversación.
        const { data: newChat, error: createError } = await supabase
            .from('conversations')
            .insert({
                client_id: currentUser.id,
                professional_id: userId,
                // Puedes agregar un mensaje inicial o status si tu esquema lo requiere
            })
            .select('id')
            .single();

        if (createError) throw createError;

        if (newChat) {
            setConversationId(newChat.id);
            navigateToChat(newChat.id);
        }

    } catch (error) {
        console.error("Error al iniciar chat:", error);
        Alert.alert("Error", "No se pudo iniciar la conversación.");
    } finally {
        setChatLoading(false);
    }
  };

  const navigateToChat = (convId: string) => {
    navigation.navigate(ROOT_ROUTES.CHAT_ROOM, { 
        conversationId: convId, 
        otherUserId: userId,           
        userName: `${profile.nombre} ${profile.apellido}`,
        avatarUrl: profile.avatar_url,
        isActive: true // Asumimos activo si acabamos de entrar
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
      </View>
    );
  }

  if (!profile) return <View style={[styles.container, styles.center]}><Text>Usuario no encontrado</Text></View>;

  const isProfessional = profile.rol === 'professional';
  
  // Filtros de servicios
  const hiredServices = services.filter(s => myContractIds.has(s.id));
  const availableServices = services.filter(s => !myContractIds.has(s.id));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <Image
            source={profile.avatar_url ? { uri: profile.avatar_url } : require("@/assets/user-predetermiando.png")}
            style={styles.avatar}
          />
          <Text style={styles.nombre}>{profile.nombre} {profile.apellido}</Text>
          <Text style={styles.rolLabel}>
            {isProfessional && professionalData ? professionalData.titulo : "Usuario"}
          </Text>
        </View>

        {/* --- DATOS GENERALES --- */}
        <View style={styles.infoRow}>
            <Text style={styles.label}>Ubicación:</Text>
            <Text style={styles.value}>{profile.direccion_legible || "No especificada"}</Text>
        </View>

        {/* --- LÓGICA PROFESIONAL --- */}
        {isProfessional && professionalData && (
          <>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Información Profesional</Text>

            <View style={styles.infoRow}><Text style={styles.label}>Especialidad:</Text><Text style={styles.value}>{professionalData.especialidad}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Precio Base:</Text><Text style={styles.value}>${professionalData.precio}</Text></View>
            <View style={styles.bioContainer}>
                <Text style={styles.label}>Sobre mí:</Text>
                <Text style={styles.bioText}>{professionalData.bio}</Text>
            </View>

            <View style={styles.separator} />

            {/* --- SECCIÓN 1: SERVICIOS CONTRATADOS (Permiten ir al Chat) --- */}
            {hiredServices.length > 0 && (
                <View style={styles.servicesSection}>
                    <Text style={[styles.sectionTitle, { color: materialColors.schemes.light.primary }]}>
                        <Ionicons name="checkmark-circle" size={18} /> Mis Servicios Activos
                    </Text>
                    {hiredServices.map(service => (
                        <View key={service.id} style={styles.serviceCardActive}>
                            <View style={{flex: 1}}>
                                <Text style={styles.serviceTitle}>{service.title}</Text>
                                <Text style={styles.serviceDesc}>
                                    {service.total_sessions} sesiones • {service.validity_days} días vigencia
                                </Text>
                            </View>
                            
                            {/* Botón Ir al Chat */}
                            <TouchableOpacity 
                                style={styles.chatButton}
                                onPress={getOrCreateConversation}
                                disabled={chatLoading}
                            >
                                {chatLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="chatbubbles-outline" size={18} color="#fff" style={{marginRight: 4}}/>
                                        <Text style={{color: '#fff', fontWeight: '600'}}>Chat</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* --- SECCIÓN 2: SERVICIOS DISPONIBLES (Para contratar) --- */}
            <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
            
            {availableServices.length > 0 ? (
                availableServices.map(service => (
                    <View key={service.id} style={styles.serviceCard}>
                        <View style={{flex: 1, paddingRight: 10}}>
                            <Text style={styles.serviceTitle}>{service.title}</Text>
                            <Text style={styles.serviceDesc}>{service.description}</Text>
                            <Text style={styles.servicePrice}>${service.price}</Text>
                            <Text style={styles.serviceMeta}>
                                ⏱ {service.duration_minutes} min | 🔄 {service.total_sessions} sesiones
                            </Text>
                        </View>
                        <Button 
                            title="Contratar" 
                            onPress={() => handleBuyService(service)}
                            style={{ minWidth: 100, paddingVertical: 10, paddingHorizontal: 10, marginVertical: 0 }}
                        />
                    </View>
                ))
            ) : (
                <Text style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', marginVertical: 10 }}>
                    {hiredServices.length > 0 
                        ? "Ya has contratado todos los servicios disponibles." 
                        : "Este profesional no tiene más servicios publicados."}
                </Text>
            )}
          </>
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
    marginBottom: 40 // Espacio extra al final
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
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8
  },
  bioContainer: {
    marginTop: 10
  },
  bioText: {
    marginTop: 6,
    color: '#444',
    lineHeight: 22,
    fontStyle: 'italic'
  },
  // ESTILOS DE SERVICIOS
  servicesSection: {
    marginBottom: 25,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  serviceCardActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: materialColors.schemes.light.secondaryContainer, // Color suave del tema
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: materialColors.schemes.light.outlineVariant
  },
  serviceTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4
  },
  serviceDesc: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4
  },
  servicePrice: {
    fontWeight: 'bold',
    fontSize: 15,
    color: materialColors.schemes.light.primary,
    marginBottom: 2
  },
  serviceMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  },
  chatButton: {
    backgroundColor: materialColors.schemes.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginLeft: 8
  }
});