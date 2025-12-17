import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { materialColors } from './colors';
import { supabase } from '@/utils/supabase';

// Configuracion global de como se ven las notificaciones cuando la app esta abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: materialColors.coreColors.primary,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permisos de notificación denegados');
      return;
    }
    
    // para Push Notifications remotas en el futuro, obtendria el token
    // token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Las notificaciones físicas requieren un dispositivo real');
  }

  return token;
}


/**
 * Programa los recordatorios para una cita
 * @param appointmentDate Objeto Date con la fecha y hora del turno
 * @param professionalName Nombre del profesional
 * @param reminderMinutesTime Tiempo de antelación configurable (ej: 60 min, 1440 min para 1 día)
 */

export const NOTIFICATION_KEYS = {
  ENABLED: 'app_notify_enabled',
  TIME: 'app_notify_time_minutes'
};

export async function scheduleAppointmentReminders(
  appointmentId: string,
  appointmentDate: Date,
  professionalName: string,
  serviceName: string,
  // Ya no recibimos reminderMinutesTime como argumento obligatorio, lo leemos del storage
) {
  const now = new Date();

  // LEER CONFIGURACION LOCAL
  const enabledStr = await AsyncStorage.getItem(NOTIFICATION_KEYS.ENABLED);
  const timeStr = await AsyncStorage.getItem(NOTIFICATION_KEYS.TIME);

  // Valores por defecto: Activado y 60 minutos
  const notificationsEnabled = enabledStr !== 'false'; 
  const reminderMinutesTime = timeStr ? parseInt(timeStr) : 60;

  if (!notificationsEnabled) {
    console.log('Notificaciones desactivadas por el usuario.');
    return;
  }

  const trigger3MinDate = new Date(appointmentDate.getTime() - 3 * 60 * 1000);
  const triggerConfigurableDate = new Date(appointmentDate.getTime() - reminderMinutesTime * 60 * 1000);

  // 1. Notificación Configurable
  if (triggerConfigurableDate > now) {
    const secondsUntilTrigger = Math.floor((triggerConfigurableDate.getTime() - now.getTime()) / 1000);
    
    if (secondsUntilTrigger > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Recordatorio de Cita',
          body: `Tu sesión de ${serviceName} con ${professionalName} es en ${reminderMinutesTime / 60} horas.`,
          data: { appointmentId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTrigger,
          repeats: false,
        },
      });
    }
  }

  // Notificación de 3 minutos (Siempre se agenda si las notificaciones están activas)
  if (trigger3MinDate > now) {
    const secondsUntil3Min = Math.floor((trigger3MinDate.getTime() - now.getTime()) / 1000);
    if (secondsUntil3Min > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏳ ¡Comienza en 3 minutos!',
          body: `Prepárate para tu sesión con ${professionalName}.`,
          data: { appointmentId },
        },
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntil3Min,
          repeats: false,
        },
      });
    }
  }
}

// AHORA RECIBIMOS 'viewMode' COMO ARGUMENTO 👇
export async function syncAppointmentsNotifications(userId: string, viewMode: string) {
  console.log(`🔄 Sincronizando notificaciones para modo: ${viewMode}...`);

  const enabledStr = await AsyncStorage.getItem(NOTIFICATION_KEYS.ENABLED);
  const timeStr = await AsyncStorage.getItem(NOTIFICATION_KEYS.TIME);
  
  if (enabledStr === 'false') {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("🔕 Notificaciones desactivadas.");
    return;
  }

  const reminderMinutes = timeStr ? parseInt(timeStr) : 60;
  const now = new Date();

  // 1. LIMPIEZA TOTAL
  // Esto es clave: Al cambiar de vista, borramos las alarmas de la vista anterior
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. CONSTRUIR LA QUERY FILTRADA
  // Preparamos la base de la consulta
  let query = supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      client_id,        
      professional_id,  
      contracts ( services ( title ) ),
      professional:profiles!professional_id ( nombre, apellido ),
      client:profiles!client_id ( nombre, apellido )
    `)
    .eq('status', 'scheduled')
    .gt('start_time', now.toISOString());

  // APLICAMOS EL FILTRO SEGÚN LA VISTA
  if (viewMode === 'professional') {
    // Si estoy trabajando, solo quiero ver donde YO soy el profesional
    query = query.eq('professional_id', userId);
  } else {
    // Si estoy como cliente, solo quiero ver donde YO soy el cliente
    query = query.eq('client_id', userId);
  }

  const { data: appointments, error } = await query;

  if (error || !appointments) {
    console.log("Error sincronizando turnos:", error);
    return;
  }

  console.log(`📅 Se encontraron ${appointments.length} turnos para modo ${viewMode}.`);

  // 3. REPROGRAMAR
  for (const item of appointments) {
    const app = item as any;
    
    const appDate = new Date(app.start_time);
    const triggerDate = new Date(appDate.getTime() - reminderMinutes * 60 * 1000);
    const secondsUntil = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

    // LÓGICA DE NOMBRE SIMPLIFICADA
    // Como ya filtramos por viewMode, sabemos exactamente quién es la "otra persona"
    let otherPersonName = "Usuario";
    
    if (viewMode === 'professional') {
       // Si estoy en modo profesional, la otra persona es SIEMPRE el cliente
       otherPersonName = `${app.client?.nombre || ''} ${app.client?.apellido || ''}`;
    } else {
       // Si estoy en modo cliente, la otra persona es SIEMPRE el profesional
       otherPersonName = `${app.professional?.nombre || ''} ${app.professional?.apellido || ''}`;
    }

    const serviceName = app.contracts?.services?.title || 'Sesión';

    // Usamos tu variable DEBUG si la tienes, o simplemente la lógica de tiempo
    const DEBUG = false; 

    if (secondsUntil > 0 || DEBUG) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Recordatorio de Turno',
          body: `Tu ${serviceName} con ${otherPersonName.trim()} es en ${reminderMinutes} minutos.`,
          data: { appointmentId: app.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: DEBUG ? 5 : secondsUntil, 
          repeats: false,
        },
      });
    }
  }
  
  console.log("✅ Sincronización completada.");
}

// cancelar notificaciones si se cancela el turno
export async function cancelAppointmentNotifications(appointmentId: string) {
    // Nota: Para cancelar específicamente por ID, necesitaríamos guardar el ID de la notif
    // que devuelve scheduleNotificationAsync. 
    // Por simplicidad inicial esta función cancela todas y reprograma, 
    // o se puede implementar un mapeo local.
    // Para v1: Queda pendiente la cancelación fina o usamos cancelAllScheduledNotificationsAsync() si el usuario limpia su agenda.
}