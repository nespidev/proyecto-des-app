import React, { useEffect, useState, useContext } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { supabase } from "@/utils/supabase";
import { materialColors } from "@/utils/colors";
import { AuthContext } from "@/shared/context/auth-context";
import { ROOT_ROUTES } from "@/utils/constants";
import { addMinutes } from "date-fns";
import BookingModal from "@/components/BookingModal";

import { styles } from "./styles";
import { Service } from "./types";
import PerfilPublicoCliente from "./perfil-publico-cliente";
import PerfilPublicoProfesional from "./perfil-publico-profesional";

type ParamList = {
  PerfilPublico: {
    userId: string;
    hideContactButton?: boolean; 
  };
};

export default function PerfilPublico() {
  const route = useRoute<RouteProp<ParamList, 'PerfilPublico'>>();
  const navigation = useNavigation<any>();
  const { userId } = route.params;

  const { state } = useContext<any>(AuthContext);
  const currentUser = state?.user; 

  const [profile, setProfile] = useState<any>(null);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [myContractIds, setMyContractIds] = useState<Set<string>>(new Set());
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfileData(); }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (userError) throw userError;
      setProfile(userData);

      if (userData.rol === 'professional') {
        const { data: proData } = await supabase.from('professionals').select('*').eq('id', userId).single();
        if (proData) setProfessionalData(proData);

        const { data: servicesData } = await supabase.from('services').select('*').eq('professional_id', userId).eq('is_active', true);
        if (servicesData) setServices(servicesData);

        if (currentUser) {
            const { data: contractsData } = await supabase.from('contracts').select('service_id')
                .eq('client_id', currentUser.id).eq('professional_id', userId).eq('status', 'active');
            if (contractsData) setMyContractIds(new Set(contractsData.map((c: any) => c.service_id)));

            const { data: chatData } = await supabase.from('conversations_view').select('id').eq('other_user_id', userId).maybeSingle();
            if (chatData) setConversationId(chatData.id);
        }
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleBuyService = (service: Service) => {
    if (!currentUser) return Alert.alert("Error", "Debes iniciar sesión.");
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (selectedSlots: string[]) => {
    setShowBookingModal(false);
    if (!selectedService || !currentUser) return;

    try {
        setLoading(true);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (selectedService.validity_days || 30));

        const { data: contractData, error: contractError } = await supabase.from('contracts').insert({
            client_id: currentUser.id, professional_id: userId, service_id: selectedService.id,
            start_date: startDate.toISOString(), end_date: endDate.toISOString(),
            total_credits: selectedService.total_sessions, used_credits: selectedSlots.length, status: 'active'
        }).select('id').single();

        if (contractError) throw contractError;

        const appointments = selectedSlots.map(slot => ({
            contract_id: contractData.id, client_id: currentUser.id, professional_id: userId,
            start_time: new Date(slot).toISOString(),
            end_time: addMinutes(new Date(slot), selectedService.duration_minutes).toISOString(),
            status: 'scheduled'
        }));

        const { error: appError } = await supabase.from('appointments').insert(appointments);
        if (appError) throw appError;

        Alert.alert("Éxito", "Servicio contratado.");
        fetchProfileData();
        getOrCreateConversation(); 
    } catch (e: any) { Alert.alert("Error", e.message); } 
    finally { setLoading(false); setSelectedService(null); }
  };

  const getOrCreateConversation = async () => {
    if (conversationId) return navigateToChat(conversationId);
    try {
        setChatLoading(true);
        const { data: exist } = await supabase.from('conversations_view').select('id').eq('other_user_id', userId).maybeSingle();
        if (exist) return navigateToChat(exist.id);

        const { data: newChat, error } = await supabase.from('conversations')
            .insert({ client_id: currentUser.id, professional_id: userId }).select('id').single();
        if (error) throw error;
        if (newChat) navigateToChat(newChat.id);
    } catch (e) { Alert.alert("Error chat"); } finally { setChatLoading(false); }
  };

  const navigateToChat = (convId: string) => {
    navigation.navigate(ROOT_ROUTES.CHAT_ROOM, { 
        conversationId: convId, otherUserId: userId,           
        userName: `${profile.nombre} ${profile.apellido}`, avatarUrl: profile.avatar_url
    });
  };

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={materialColors.schemes.light.primary} /></View>;
  if (!profile) return <View style={[styles.container, styles.center]}><Text>Usuario no encontrado</Text></View>;

  const isProfessional = profile.rol === 'professional';
  const hiredServices = services.filter(s => myContractIds.has(s.id));
  const availableServices = services.filter(s => !myContractIds.has(s.id));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Header Común */}
        <View style={styles.header}>
          <Image source={profile.avatar_url ? { uri: profile.avatar_url } : require("@/assets/user-predetermiando.png")} style={styles.avatar} />
          <Text style={styles.nombre}>{profile.nombre} {profile.apellido}</Text>
          <Text style={styles.rolLabel}>{isProfessional && professionalData ? professionalData.titulo : "Cliente"}</Text>
        </View>

        <View style={styles.infoRow}>
            <Text style={styles.label}>Ciudad:</Text>
            <Text style={styles.value}>{profile.ciudad || "No especificada"}</Text>
        </View>

        {/* Renderizado Condicional */}
        {isProfessional && professionalData ? (
          <PerfilPublicoProfesional
             professionalData={professionalData}
             hiredServices={hiredServices}
             availableServices={availableServices}
             onBuyService={handleBuyService}
             onOpenChat={getOrCreateConversation}
             chatLoading={chatLoading}
          />
        ) : (
          <PerfilPublicoCliente profile={profile} />
        )}
      </View>

      {selectedService && (
        <BookingModal 
          visible={showBookingModal} onClose={() => setShowBookingModal(false)}
          service={selectedService} professionalId={userId} onConfirm={handleConfirmBooking}
        />
      )}
    </ScrollView>
  );
}