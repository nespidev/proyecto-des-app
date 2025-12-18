import { StyleSheet } from "react-native";
import { materialColors } from "@/utils/colors";

export const styles = StyleSheet.create({
  // --- LAYOUT GENERAL ---
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
    marginBottom: 40
  },
  
  // --- HEADER DE PERFIL ---
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

  // --- ELEMENTOS COMPARTIDOS ---
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

  // --- CLIENTE (STATS) ---
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    fontWeight: 'bold',
    marginTop: 5
  },

  // --- PROFESIONAL (BIO) ---
  bioContainer: {
    marginTop: 10
  },
  bioText: {
    marginTop: 6,
    color: '#444',
    lineHeight: 22,
    fontStyle: 'italic'
  },
  servicesSection: {
    marginBottom: 25,
  },

  // --- TARJETAS DE SERVICIOS (NUEVOS ESTILOS) ---
  
  // Tarjeta de Servicio Disponible
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16, // Más padding para aire
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0', // Borde sutil
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  // Tarjeta de Servicio Activo (Contratado)
  serviceCardActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: materialColors.schemes.light.secondaryContainer, // Fondo tintado
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: materialColors.schemes.light.outlineVariant
  },

  // Textos del Servicio
  serviceTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    flexWrap: 'wrap'
  },
  serviceDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18
  },
  servicePrice: {
    fontWeight: 'bold',
    fontSize: 16,
    color: materialColors.schemes.light.primary,
    marginBottom: 6
  },
  
  // Metadatos (Iconos pequeños debajo del precio)
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 11,
    color: '#555',
    marginLeft: 4,
    fontWeight: '500',
  },

  // Metadatos simples (usados en la tarjeta activa)
  serviceMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  serviceMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  // --- BADGES DE MODALIDAD (NUEVOS) ---
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  
  // Variantes de color para Badge
  badgePresencial: {
    backgroundColor: '#E3F2FD', // Azul muy claro
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  badgeTextPresencial: {
    color: '#1565C0',
  },
  badgeRemoto: {
    backgroundColor: '#F3E5F5', // Violeta muy claro
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  badgeTextRemoto: {
    color: '#7B1FA2',
  },

  // --- BOTONES ---
  hireButton: {
    minWidth: 90,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 0,
    borderRadius: 8,
  },
  chatButton: {
    backgroundColor: materialColors.schemes.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginLeft: 8
  },
  
  // --- ESTADOS ---
  emptyStateText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  }
});