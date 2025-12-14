import React, { useState, useEffect, useContext } from "react";
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Calendar as RNCalendar, DateData } from "react-native-calendars";
import { materialColors } from "@/utils/colors";
import { supabase } from "@/utils/supabase";
import { AuthContext } from "@/shared/context/auth-context";
import { format, addMinutes, startOfMonth, endOfMonth, isBefore, startOfDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import Button from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

// --- INTERFACES ---
interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  service: any;
  professionalId: string;
  onConfirm: (selectedSlots: string[]) => void;
}

// --- CONSTANTES ---
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 20;

// --- HELPER: DETECCION DE SOLAPAMIENTO DE RANGOS ---
// Retorna true si el rango A se cruza con el rango B
const isOverlapping = (startA: Date, endA: Date, startB: Date, endB: Date) => {
  return startA < endB && endA > startB;
};

export default function BookingModal({ visible, onClose, service, professionalId, onConfirm }: BookingModalProps) {
  const { state } = useContext<any>(AuthContext);
  const currentUser = state.user;

  // Estados de Calendario y Selección
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Estados de Datos (Slots y Disponibilidad)
  const [daySlots, setDaySlots] = useState<any[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [monthAvailability, setMonthAvailability] = useState<any>({});
  
  // Estados de Carga
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // 1. Cargar disponibilidad visual (puntos verdes) al cambiar de mes
  useEffect(() => {
    if (visible && service) {
      fetchMonthAvailability(currentMonth);
    }
  }, [currentMonth, visible, service]);

  // 2. Cargar horarios detallados al seleccionar un día
  useEffect(() => {
    if (visible && service && selectedDate) {
      setDaySlots([]); // Limpiar lista anterior para evitar "parpadeo" de datos viejos
      fetchDaySlots(selectedDate);
    }
  }, [selectedDate, visible, service]);

  // --- LÓGICA 1: DISPONIBILIDAD MENSUAL (Puntos en el Calendario) ---
  const fetchMonthAvailability = async (dateRef: Date) => {
    setLoadingCalendar(true);
    const startMonth = startOfMonth(dateRef).toISOString();
    const endMonth = endOfMonth(dateRef).toISOString();

    try {
        // Traer TODOS los turnos del mes (Profesional Y Cliente)
        const [proResponse, clientResponse] = await Promise.all([
            supabase.from('appointments').select('start_time, end_time')
                .eq('professional_id', professionalId).eq('status', 'scheduled')
                .gte('start_time', startMonth).lte('start_time', endMonth),
            supabase.from('appointments').select('start_time, end_time')
                .eq('client_id', currentUser.id).eq('status', 'scheduled')
                .gte('start_time', startMonth).lte('start_time', endMonth)
        ]);

        // Unificar lista de ocupados
        const allBusy = [...(proResponse.data || []), ...(clientResponse.data || [])];
        
        const availabilityMap: any = {};
        let runner = startOfMonth(dateRef);
        const endRunner = endOfMonth(dateRef);
        const today = startOfDay(new Date());

        // Barrer día por día
        while (runner <= endRunner) {
            const dateStr = format(runner, 'yyyy-MM-dd');
            
            // A. Días pasados -> Deshabilitados
            if (isBefore(runner, today)) {
                availabilityMap[dateStr] = { 
                    disabled: true, 
                    disableTouchEvent: true, 
                    textColor: '#ccc' 
                };
            } else {
                // B. Chequear si el día tiene huecos reales
                const hasFreeSlot = checkDayAvailability(runner, allBusy);
                
                if (hasFreeSlot) {
                     // ✅ DISPONIBLE: Texto normal + Punto Verde
                     availabilityMap[dateStr] = { 
                         textColor: '#333',
                         marked: true,
                         dotColor: '#4CAF50' 
                     }; 
                } else {
                     // ⛔️ LLENO: Texto gris + Deshabilitado
                     availabilityMap[dateStr] = { 
                         disabled: true, 
                         disableTouchEvent: true, 
                         textColor: '#ccc' 
                     };
                }
            }
            runner = addDays(runner, 1);
        }
        setMonthAvailability(availabilityMap);

    } catch (e) {
        console.error("Error loading month:", e);
    } finally {
        setLoadingCalendar(false);
    }
  };

  // Helper para verificar si un día tiene al menos UN slot válido
  const checkDayAvailability = (dayDate: Date, allBusyApps: any[]) => {
      let currentTime = new Date(dayDate);
      currentTime.setHours(WORK_START_HOUR, 0, 0, 0);
      const endTimeLimit = new Date(dayDate);
      endTimeLimit.setHours(WORK_END_HOUR, 0, 0, 0);

      // Convertir turnos a objetos Date (Optimización)
      const busyIntervals = allBusyApps.map(a => ({
          start: new Date(a.start_time),
          end: new Date(a.end_time)
      }));

      while (currentTime < endTimeLimit) {
        const slotStart = new Date(currentTime);
        const slotEnd = addMinutes(slotStart, service.duration_minutes);
        
        // Si el servicio termina después del cierre, paramos
        if (slotEnd > endTimeLimit) break;

        // Verificar choque de rangos
        const isBusy = busyIntervals.some(busy => 
            isOverlapping(slotStart, slotEnd, busy.start, busy.end)
        );

        if (!isBusy) return true; // ¡Encontré un hueco!
        
        // Avanzar
        currentTime = addMinutes(currentTime, service.duration_minutes);
      }
      return false;
  };

  // --- LÓGICA 2: CARGAR HORARIOS DEL DÍA SELECCIONADO ---
  const fetchDaySlots = async (dateStr: string) => {
    // Si el día está marcado como no disponible en el mapa visual, no cargamos nada
    if (monthAvailability[dateStr]?.disabled) return;

    setLoadingSlots(true);
    const startOfDayStr = `${dateStr}T00:00:00`;
    const endOfDayStr = `${dateStr}T23:59:59`;

    try {
      // Fetch preciso para el día (Profesional y Cliente)
      const { data: proApps } = await supabase.from('appointments').select('start_time, end_time')
          .eq('professional_id', professionalId).eq('status', 'scheduled')
          .gte('start_time', startOfDayStr).lte('start_time', endOfDayStr);
          
      const { data: myApps } = await supabase.from('appointments').select('start_time, end_time')
          .eq('client_id', currentUser.id).eq('status', 'scheduled')
          .gte('start_time', startOfDayStr).lte('start_time', endOfDayStr);
      
      // Combinar y convertir a objetos Date
      const busyIntervals = [...(proApps || []), ...(myApps || [])].map(a => ({
          start: new Date(a.start_time),
          end: new Date(a.end_time)
      }));
      
      // Generar Grid de Slots
      const slots = [];
      let currentTime = new Date(`${dateStr}T${WORK_START_HOUR.toString().padStart(2, '0')}:00:00`);
      const endTimeLimit = new Date(`${dateStr}T${WORK_END_HOUR.toString().padStart(2, '0')}:00:00`);
      const now = new Date();

      while (currentTime < endTimeLimit) {
        const slotStart = new Date(currentTime);
        const slotEnd = addMinutes(slotStart, service.duration_minutes);
        const timeIso = slotStart.toISOString();

        // Validaciones
        const isPast = slotStart < now;
        const exceedsWorkDay = slotEnd > endTimeLimit;
        
        // Detección de Colisión REAL (Rango vs Rango)
        const isBusy = busyIntervals.some(busy => 
            isOverlapping(slotStart, slotEnd, busy.start, busy.end)
        );

        if (!isPast && !exceedsWorkDay) {
            slots.push({
                time: slotStart,
                iso: timeIso,
                available: !isBusy,
                selected: selectedSlots.includes(timeIso)
            });
        }
        // Avanzamos intervalo
        currentTime = addMinutes(currentTime, service.duration_minutes);
      }
      setDaySlots(slots);

    } catch (error) {
        console.error("Error fetching day slots:", error);
    } finally {
        setLoadingSlots(false);
    }
  };

  // --- HANDLERS ---
  const handleSlotPress = (isoDate: string) => {
    if (selectedSlots.includes(isoDate)) {
      // Deseleccionar
      setSelectedSlots(prev => prev.filter(d => d !== isoDate));
    } else {
      // Seleccionar (validando límite)
      if (selectedSlots.length >= service.total_sessions) {
        Alert.alert("Límite alcanzado", `Este servicio incluye ${service.total_sessions} sesiones.`);
        return;
      }
      setSelectedSlots(prev => [...prev, isoDate]);
    }
    // Actualización visual local optimista
    setDaySlots(prev => prev.map(s => s.iso === isoDate ? { ...s, selected: !s.selected } : s));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Agendar {service?.title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="close-circle" size={30} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Barra de Progreso */}
        <View style={styles.progress}>
             <Text style={styles.progressText}>
                Sesiones seleccionadas: {selectedSlots.length} / {service?.total_sessions}
             </Text>
             <View style={styles.progressBarBg}>
                <View style={[
                    styles.progressBarFill, 
                    { width: `${(selectedSlots.length / (service?.total_sessions || 1)) * 100}%` }
                ]} />
             </View>
        </View>

        {/* Calendario */}
        <View style={{ height: 360 }}> 
            {loadingCalendar && (
                <ActivityIndicator 
                    style={styles.calendarLoader} 
                    size="large" 
                    color={materialColors.schemes.light.primary} 
                />
            )}
            
            <RNCalendar
                key={currentMonth.toISOString()} 
                current={format(currentMonth, 'yyyy-MM-dd')}
                
                onMonthChange={(date: DateData) => setCurrentMonth(new Date(date.dateString))}
                
                onDayPress={(day: any) => {
                    if (!monthAvailability[day.dateString]?.disabled) {
                        setSelectedDate(day.dateString);
                    }
                }}
                
                markedDates={{
                    ...monthAvailability,
                    [selectedDate]: { 
                        selected: true, 
                        selectedColor: materialColors.schemes.light.primary,
                        disabled: monthAvailability[selectedDate]?.disabled,
                        marked: monthAvailability[selectedDate]?.marked,
                        dotColor: monthAvailability[selectedDate]?.marked ? '#fff' : undefined // Punto blanco si está seleccionado
                    }
                }}
                
                theme={{
                    arrowColor: materialColors.schemes.light.primary,
                    todayTextColor: materialColors.schemes.light.primary,
                    textDayFontWeight: '500',
                    textDisabledColor: '#d9e1e8',
                    selectedDayBackgroundColor: materialColors.schemes.light.primary,
                    selectedDayTextColor: '#ffffff'
                }}
            />
        </View>

        {/* Lista de Horarios */}
        <Text style={styles.subTitle}>
            Horarios: {format(new Date(selectedDate), "EEEE d 'de' MMMM", { locale: es })}
        </Text>

        {loadingSlots ? (
          <ActivityIndicator color={materialColors.schemes.light.primary} style={{marginTop: 20}} />
        ) : (
          <FlatList
            data={daySlots}
            keyExtractor={item => item.iso}
            numColumns={4}
            contentContainerStyle={styles.slotsGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.slotItem,
                  !item.available && styles.slotDisabled,
                  item.selected && styles.slotSelected
                ]}
                disabled={!item.available}
                onPress={() => handleSlotPress(item.iso)}
              >
                <Text style={[
                  styles.slotText,
                  !item.available && styles.slotTextDisabled,
                  item.selected && styles.slotTextSelected
                ]}>
                  {format(item.time, 'HH:mm')}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
                <View style={{alignItems: 'center', marginTop: 10}}>
                    <Text style={styles.emptyText}>
                        {monthAvailability[selectedDate]?.disabled 
                            ? "Día completo o no disponible." 
                            : "No hay horarios para mostrar."}
                    </Text>
                </View>
            }
          />
        )}

        {/* Footer Confirmación */}
        <View style={styles.footer}>
           <Button 
             title={selectedSlots.length === service?.total_sessions 
                ? "Finalizar Contratación" 
                : `Seleccionar (${selectedSlots.length}/${service?.total_sessions})`}
             onPress={() => onConfirm(selectedSlots)}
             disabled={selectedSlots.length === 0}
           />
        </View>
      </View>
    </Modal>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 10 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  progress: { paddingHorizontal: 20, marginBottom: 5 },
  progressText: { fontSize: 12, color: '#666', marginBottom: 5 },
  progressBarBg: { height: 4, backgroundColor: '#eee', borderRadius: 2 },
  progressBarFill: { height: 4, backgroundColor: materialColors.schemes.light.primary, borderRadius: 2 },
  
  calendarLoader: { 
    position: 'absolute', 
    zIndex: 10, 
    alignSelf:'center', 
    top: 150 
  },
  
  subTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 20, 
    marginTop: 5, 
    marginBottom: 10, 
    color: '#444',
    textTransform: 'capitalize' 
  },
  slotsGrid: { paddingHorizontal: 10, paddingBottom: 20 },
  slotItem: {
    flex: 1,
    margin: 4,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  slotDisabled: { backgroundColor: '#f9f9f9', borderColor: '#eee' },
  slotSelected: { backgroundColor: materialColors.schemes.light.primary, borderColor: materialColors.schemes.light.primary },
  slotText: { fontWeight: '600', fontSize: 12, color: '#333' },
  slotTextDisabled: { color: '#ddd' },
  slotTextSelected: { color: '#fff' },
  emptyText: { textAlign: 'center', color: '#999', fontStyle: 'italic' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' }
});