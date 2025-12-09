import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { materialColors } from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigation } from "@react-navigation/native";
import { ROOT_ROUTES } from "@/utils/constants";

export default function AppointmentWidget() {
  const { state } = useContext<any>(AuthContext);
  const viewMode = state.viewMode; // 'client' o 'professional'
  const user = state.user;
  const navigation = useNavigation<any>();
  
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchNextAppointment();
  }, [user, viewMode]);

  const fetchNextAppointment = async () => {
    setLoading(true); // loading true al cambiar de modo
    try {
      const now = new Date().toISOString();
      
      // Si soy pro busco donde yo soy el professional_id
      // Si soy cliente busco donde yo soy el client_id
      const column = viewMode === 'professional' ? 'professional_id' : 'client_id';
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          contracts ( services ( title ) )
        `)
        .eq(column, user.id)
        .eq('status', 'scheduled')
        .gt('start_time', now)
        .order('start_time', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setNextAppointment(data);
    } catch (err) {
      setNextAppointment(null); // Limpiamos si no hay turno
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    navigation.navigate(ROOT_ROUTES.CALENDAR_SCREEN); 
  };

  if (loading) return <ActivityIndicator color={materialColors.schemes.light.primary} style={{marginVertical: 20}} />;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Próximo Turno ({viewMode === 'professional' ? 'Como Pro' : 'Como User'})</Text>
        <Ionicons name="calendar" size={20} color={materialColors.schemes.light.primary} />
      </View>

      {nextAppointment ? (
        <View style={styles.content}>
          <Text style={styles.serviceTitle}>
            {nextAppointment.contracts?.services?.title || "Sesión Agendada"}
          </Text>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={16} color="#666" style={{marginRight: 4}} />
            <Text style={styles.dateText}>
              {format(new Date(nextAppointment.start_time), "EEEE d 'de' MMMM, HH:mm'hs'", { locale: es })}
            </Text>
          </View>
          <Text style={styles.cta}>Ver calendario completo →</Text>
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>No tienes turnos próximos.</Text>
          <Text style={styles.cta}>Ir al calendario →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: materialColors.schemes.light.primary
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase'
  },
  content: { marginTop: 4 },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  dateText: {
    fontSize: 15,
    color: '#555',
    textTransform: 'capitalize'
  },
  emptyContent: { paddingVertical: 10 },
  emptyText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4
  },
  cta: {
    fontSize: 14,
    fontWeight: '600',
    color: materialColors.schemes.light.primary,
    marginTop: 4
  }
});