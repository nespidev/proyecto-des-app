import { StyleSheet } from "react-native";
import { materialColors } from "@/utils/colors";

export const styles = StyleSheet.create({
  // --- LAYOUT ---
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
  
  // --- HEADER COMÚN ---
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

  // --- ESPECÍFICOS DE CLIENTE (STATS) ---
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

  // --- ESPECÍFICOS DE PROFESIONAL (SERVICIOS) ---
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
    backgroundColor: materialColors.schemes.light.secondaryContainer,
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