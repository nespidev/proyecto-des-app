import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { materialColors } from './colors';

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

// cancelar notificaciones si se cancela el turno
export async function cancelAppointmentNotifications(appointmentId: string) {
    // Nota: Para cancelar específicamente por ID, necesitaríamos guardar el ID de la notif
    // que devuelve scheduleNotificationAsync. 
    // Por simplicidad inicial esta función cancela todas y reprograma, 
    // o se puede implementar un mapeo local.
    // Para v1: Queda pendiente la cancelación fina o usamos cancelAllScheduledNotificationsAsync() si el usuario limpia su agenda.
}