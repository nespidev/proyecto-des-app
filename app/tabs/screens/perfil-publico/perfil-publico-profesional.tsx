// app/tabs/screens/perfil-publico/perfil-publico-profesional.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';
import Button from "@/components/Button";
import { styles } from './styles';
import { Service } from './types';

interface Props {
  professionalData: any;
  hiredServices: Service[];
  availableServices: Service[];
  onOpenChat: () => void;
  onBuyService: (service: Service) => void;
  chatLoading: boolean;
}

export default function PerfilPublicoProfesional({ 
  professionalData, 
  hiredServices, 
  availableServices, 
  onOpenChat, 
  onBuyService, 
  chatLoading 
}: Props) {
  return (
    <>
      <View style={styles.separator} />
      <Text style={styles.sectionTitle}>Información Profesional</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Especialidad:</Text>
        <Text style={styles.value}>{professionalData.especialidad}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Precio Base:</Text>
        <Text style={styles.value}>${professionalData.precio}</Text>
      </View>
      <View style={styles.bioContainer}>
        <Text style={styles.label}>Sobre mí:</Text>
        <Text style={styles.bioText}>{professionalData.bio}</Text>
      </View>

      <View style={styles.separator} />

      {/* Servicios Contratados */}
      {hiredServices.length > 0 && (
        <View style={styles.servicesSection}>
          <Text style={[styles.sectionTitle, { color: materialColors.schemes.light.primary }]}>
            <Ionicons name="checkmark-circle" size={18} /> Mis Servicios Activos
          </Text>
          {hiredServices.map(service => (
            <View key={service.id} style={styles.serviceCardActive}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDesc}>{service.total_sessions} sesiones • {service.validity_days} días vigencia</Text>
              </View>
              <TouchableOpacity style={styles.chatButton} onPress={onOpenChat} disabled={chatLoading}>
                {chatLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Ionicons name="chatbubbles-outline" size={18} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Chat</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Servicios Disponibles */}
      <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
      {availableServices.length > 0 ? (
        availableServices.map(service => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDesc}>{service.description}</Text>
              <Text style={styles.servicePrice}>${service.price}</Text>
              <Text style={styles.serviceMeta}>⏱ {service.duration_minutes} min | 🔄 {service.total_sessions} sesiones</Text>
            </View>
            <Button
              title="Contratar"
              onPress={() => onBuyService(service)}
              style={{ minWidth: 100, paddingVertical: 10, paddingHorizontal: 10, marginVertical: 0 }}
            />
          </View>
        ))
      ) : (
        <Text style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', marginVertical: 10 }}>
          No hay servicios disponibles para contratar.
        </Text>
      )}
    </>
  );
}