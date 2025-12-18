import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { materialColors } from "@/utils/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { ProfesionalCard } from "@/app/tabs/screens/busqueda-perfiles/types";

interface Props {
  item: ProfesionalCard;
  onPress: () => void;
}

export default function ProfessionalCardItem({ item, onPress }: Props) {
  
  const renderModalityTags = (modalidad: string) => (
    <View style={styles.tagsContainer}>
      {(modalidad === 'Remoto' || modalidad === 'Híbrido') && (
        <View style={[styles.tag, styles.tagRemoto]}>
          <Text style={[styles.tagText, styles.textRemoto]}>Remoto</Text>
        </View>
      )}
      {(modalidad === 'Presencial' || modalidad === 'Híbrido') && (
        <View style={[styles.tag, styles.tagPresencial]}>
          <Text style={[styles.tagText, styles.textPresencial]}>Presencial</Text>
        </View>
      )}
    </View>
  );

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Image 
          source={item.avatar_url ? { uri: item.avatar_url } : require("@/assets/user-predetermiando.png")} 
          style={styles.avatar} 
        />
        <View style={styles.headerInfo}>
          <View style={styles.rowBetween}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <View style={styles.ratingBadge}>
              <MaterialIcons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.puntuacion}</Text>
            </View>
          </View>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.especialidad}>• {item.especialidad}</Text>
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
      {renderModalityTags(item.modalidad)}
      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={16} color="gray" />
          <Text style={styles.footerText}>{item.ciudad}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>desde</Text>
          <Text style={styles.priceText}>${item.precio}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee', marginRight: 14 },
  headerInfo: { flex: 1, justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#F9A825', marginLeft: 4 },
  titulo: { fontSize: 14, color: materialColors.schemes.light.primary, fontWeight: '600', marginTop: 2 },
  especialidad: { fontSize: 13, color: '#666', marginTop: 2, fontStyle: 'italic' },
  bio: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  tagRemoto: { backgroundColor: '#E3F2FD' },
  tagPresencial: { backgroundColor: '#E8F5E9' },
  tagText: { fontSize: 12, fontWeight: '600' },
  textRemoto: { color: '#1565C0' },
  textPresencial: { color: '#2E7D32' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 12, color: 'gray', marginLeft: 4 },
  footerLabel: { fontSize: 12, color: '#888', marginRight: 4, fontStyle: 'italic' },
  priceText: { fontSize: 18, fontWeight: 'bold', color: materialColors.coreColors.primary || '#4A90E2' }
});