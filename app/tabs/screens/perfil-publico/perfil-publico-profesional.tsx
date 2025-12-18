import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';
import Button from "@/components/Button";
import { styles } from './styles'; 
import { IService } from '@/shared/models';

interface Props {
  professionalData: any;
  hiredServices: IService[];
  availableServices: IService[];
  onOpenChat: () => void;
  onBuyService: (service: IService) => void;
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

  // Helper para renderizar el Badge
  const renderModalityBadge = (modality?: string) => {
    const isPresencial = modality === 'Presencial';
    
    // Configuración visual según tipo
    const config = isPresencial ? {
      text: 'PRESENCIAL',
      icon: 'map-marker-radius' as const,
      style: styles.badgePresencial,
      textStyle: styles.badgeTextPresencial,
      iconColor: '#1565C0'
    } : {
      text: 'REMOTO',
      icon: 'laptop' as const,
      style: styles.badgeRemoto,
      textStyle: styles.badgeTextRemoto,
      iconColor: '#7B1FA2'
    };

    return (
      <View style={[styles.badgeContainer, config.style, { marginBottom: 0 }]}> 
        <MaterialCommunityIcons 
          name={config.icon} 
          size={14} 
          color={config.iconColor} 
          style={{ marginRight: 4 }} 
        />
        <Text style={[styles.badgeText, config.textStyle]}>
          {config.text}
        </Text>
      </View>
    );
  };

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
                
                {/* Info Metadatos */}
                <View style={[styles.metaRow, { marginBottom: 6 }]}>
                   <MaterialCommunityIcons name="calendar-clock" size={14} color="#666" />
                   <Text style={styles.serviceMetaText}>
                      {service.total_sessions} sesiones • {service.validity_days} días
                   </Text>
                </View>

                {/* Badge de Modalidad REUTILIZADO */}
                <View style={{ flexDirection: 'row' }}>
                  {renderModalityBadge(service.modality)}
                </View>

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
              
              {/* Header: Título y Badge */}
              <View style={styles.serviceHeader}>
                <Text style={[styles.serviceTitle, { flex: 1 }]}>{service.title}</Text>
              </View>
              
              {/* Badge usando el helper */}
              <View style={{ marginBottom: 8, flexDirection: 'row' }}>
                 {renderModalityBadge(service.modality)}
              </View>

              <Text style={styles.serviceDesc}>{service.description}</Text>
              <Text style={styles.servicePrice}>${service.price}</Text>
              
              <View style={styles.metaContainer}>
                <View style={styles.metaBadge}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#555" />
                    <Text style={styles.metaBadgeText}>{service.duration_minutes} min</Text>
                </View>
                <View style={styles.metaBadge}>
                    <MaterialCommunityIcons name="refresh" size={14} color="#555" />
                    <Text style={styles.metaBadgeText}>{service.total_sessions} sesiones</Text>
                </View>
              </View>

            </View>
            <Button
              title="Contratar"
              onPress={() => onBuyService(service)}
              style={styles.hireButton}
            />
          </View>
        ))
      ) : (
        <Text style={styles.emptyStateText}>
          No hay servicios disponibles para contratar.
        </Text>
      )}
    </>
  );
}