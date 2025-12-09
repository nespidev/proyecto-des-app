import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Calendar as RNCalendar, LocaleConfig } from "react-native-calendars"; // Alias para evitar choque de nombres
import { materialColors } from "@/utils/colors";
import { globalStyles } from "@/utils/globalStyles";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Configuración de idioma
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function Calendar() {
  const { state } = useContext<any>(AuthContext);
  const user = state.user;

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appointments, setAppointments] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    fetchMonthAvailability();
  }, [user]);

  useEffect(() => {
    fetchAppointmentsForDay(selectedDate);
  }, [selectedDate]);

  const fetchMonthAvailability = async () => {
    const column = user.rol === 'professional' ? 'professional_id' : 'client_id';
    const { data } = await supabase
      .from('appointments')
      .select('start_time')
      .eq(column, user.id)
      .eq('status', 'scheduled');

    if (data) {
      const marks: any = {};
      data.forEach((app: any) => {
        const dateKey = app.start_time.split('T')[0];
        marks[dateKey] = { marked: true, dotColor: materialColors.schemes.light.primary };
      });
      setMarkedDates(marks);
    }
  };

  const fetchAppointmentsForDay = async (date: string) => {
    const column = user.rol === 'professional' ? 'professional_id' : 'client_id';
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contracts ( services ( title ) ),
        other_user:profiles!${user.rol === 'professional' ? 'client_id' : 'professional_id'}(nombre, apellido)
      `)
      .eq(column, user.id)
      .eq('status', 'scheduled')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .order('start_time');

    if (error) console.error(error);
    setAppointments(data || []);
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.title, styles.headerTitle]}>Mi Calendario</Text>
      
      <View style={styles.calendarContainer}>
        <RNCalendar
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={{
            ...markedDates,
            [selectedDate]: { 
              selected: true, 
              selectedColor: materialColors.schemes.light.primary, 
              marked: markedDates[selectedDate]?.marked 
            }
          }}
          theme={{
            todayTextColor: materialColors.schemes.light.primary,
            arrowColor: materialColors.schemes.light.primary,
            textDayFontWeight: '600',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: 'bold'
          }}
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          Turnos del {format(new Date(selectedDate), "d 'de' MMMM", { locale: es })}:
        </Text>

        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay actividades para este día.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>
                  {format(new Date(item.start_time), 'HH:mm')}
                </Text>
                <Text style={styles.durationText}>
                   {format(new Date(item.end_time), 'HH:mm')}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoColumn}>
                <Text style={styles.serviceTitle}>
                  {item.contracts?.services?.title || "Sesión"}
                </Text>
                <Text style={styles.userName}>
                  con {item.other_user?.nombre} {item.other_user?.apellido}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  headerTitle: { marginBottom: 16, marginTop: 10 },
  calendarContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 20,
    backgroundColor: '#fff'
  },
  listContainer: { flex: 1 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 10 },
  emptyText: { color: '#999', fontStyle: 'italic', marginTop: 20, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  timeColumn: { alignItems: 'center', minWidth: 50 },
  timeText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  durationText: { fontSize: 12, color: '#888' },
  divider: { width: 1, height: '100%', backgroundColor: '#eee', marginHorizontal: 16 },
  infoColumn: { flex: 1 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: materialColors.schemes.light.primary },
  userName: { fontSize: 14, color: '#555', marginTop: 2 },
});