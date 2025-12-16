import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Switch, Alert, Button } from "react-native";
import { Calendar as RNCalendar, LocaleConfig } from "react-native-calendars";
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- Importante
import { MaterialIcons } from '@expo/vector-icons'; // Icono para configuración

import { materialColors } from "@/utils/colors";
import { globalStyles } from "@/utils/globalStyles";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NOTIFICATION_KEYS } from "@/utils/notification-helper";

import * as Notifications from 'expo-notifications';


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
  const viewMode = state.viewMode;

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appointments, setAppointments] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  // Estados para Configuracion local de notificaciones
  const [showSettings, setShowSettings] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [notifyTime, setNotifyTime] = useState(60); // Minutos

  useEffect(() => {
    fetchMonthAvailability();
    loadNotificationSettings();
  }, [user, viewMode]);

  useEffect(() => {
    fetchAppointmentsForDay(selectedDate);
  }, [selectedDate]);


  // --- Lógica de Notificaciones Local ---
  const loadNotificationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATION_KEYS.ENABLED);
      const time = await AsyncStorage.getItem(NOTIFICATION_KEYS.TIME);
      
      if (enabled !== null) setNotifyEnabled(enabled !== 'false');
      if (time !== null) setNotifyTime(parseInt(time));
    } catch (e) {
      console.error("Error cargando settings", e);
    }
  };

  const saveNotificationSettings = async (enabled: boolean, time: number) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_KEYS.ENABLED, String(enabled));
      await AsyncStorage.setItem(NOTIFICATION_KEYS.TIME, String(time));
      setNotifyEnabled(enabled);
      setNotifyTime(time);
    } catch (e) {
      console.error("Error guardando settings", e);
    }
  };
  // --------------------------------------

  const handleTestNotification = async () => {
    // Verificamos si hay turnos cargados en la fecha seleccionada
    if (appointments.length === 0) {
      Alert.alert("Sin turnos", "Selecciona un día que tenga turnos agendados para probar.");
      return;
    }

    // Tomamos el primer turno de la lista (como ya vienen ordenados por hora, es el más temprano)
    const nextAppointment = appointments[0];
    
    // Extraemos los datos reales
    const serviceName = nextAppointment.contracts?.services?.title || "Sesión";
    const professionalName = `${nextAppointment.other_user?.nombre || ''} ${nextAppointment.other_user?.apellido || ''}`.trim();
    const time = format(new Date(nextAppointment.start_time), 'HH:mm');

    // 3. Permisos
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'No tienes permisos de notificación');
      return;
    }

    // Agendamos la notificación con datos reales
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📅 Próximo turno: ${time} hs`,
        body: `Recuerda tu ${serviceName} con ${professionalName}. Toca para ver detalles.`,
        data: { appointmentId: nextAppointment.id }, // Pasamos el ID por si se quiere navegar al detalle
        sound: true,
      },
      trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2 // Dispara en 2 segundos
      },
    });
    
    setShowSettings(false); // Cerramos el modal
  };

  const fetchMonthAvailability = async () => {
    const column = viewMode === 'professional' ? 'professional_id' : 'client_id';
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
    const column = viewMode === 'professional' ? 'professional_id' : 'client_id';
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contracts ( services ( title ) ),
        other_user:profiles!${viewMode === 'professional' ? 'client_id' : 'professional_id'}(nombre, apellido)
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
      <View style={styles.headerRow}>
        <Text style={[globalStyles.title, { marginBottom: 0 }]}>Mi Calendario</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => setShowSettings(true)}
        >
          <MaterialIcons name="notifications-active" size={24} color={materialColors.coreColors.primary} />
        </TouchableOpacity>
      </View>
      
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

      {/* MODAL DE CONFIGURACION */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurar Alertas</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Recibir notificaciones</Text>
              <Switch 
                value={notifyEnabled}
                onValueChange={(val) => saveNotificationSettings(val, notifyTime)}
                trackColor={{ false: "#767577", true: materialColors.schemes.light.primary }}
              />
            </View>

            {notifyEnabled && (
              <View style={styles.timeSelectorContainer}>
                <Text style={styles.subLabel}>Avisarme antes de la sesión:</Text>
                <View style={styles.chipsContainer}>
                  {[
                    { label: '30 min', val: 30 },
                    { label: '1 hora', val: 60 },
                    { label: '24 hs', val: 1440 }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.val}
                      style={[
                        styles.chip,
                        notifyTime === option.val && styles.chipSelected
                      ]}
                      onPress={() => saveNotificationSettings(true, option.val)}
                    >
                      <Text style={[
                        styles.chipText,
                        notifyTime === option.val && styles.chipTextSelected
                      ]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeButtonText}>Listo</Text>
            </TouchableOpacity>
            <View style={{ marginVertical: 20 }}>
              <Button 
                title="Probar con Próximo Turno" 
                onPress={handleTestNotification} 
                color={materialColors.coreColors.primary}
              />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  settingsButton: { padding: 8, backgroundColor: '#fff', borderRadius: 20, elevation: 2 },
  
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

  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20
  },
  settingLabel: { fontSize: 16, color: '#444' },
  timeSelectorContainer: { width: '100%', marginBottom: 20 },
  subLabel: { fontSize: 14, color: '#666', marginBottom: 10 },
  chipsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9'
  },
  chipSelected: {
    backgroundColor: materialColors.schemes.light.primary,
    borderColor: materialColors.schemes.light.primary
  },
  chipText: { color: '#666', fontSize: 14 },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' },
  closeButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#333',
    borderRadius: 25
  },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});