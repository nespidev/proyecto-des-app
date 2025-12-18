import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientsList from './clients-list';
import ClientDashboard from './client-dashboard';
import PlanEditor from '../plan-editor'; // Asumiendo que está fuera de la carpeta clients
import PlanHistoryScreen from '../plan-history'; // Asumiendo que está fuera de la carpeta clients
import ManagementMenu from './management-menu';
import ServicesList from './services-list';
import ServiceEditor from '../service-editor/service-editor';
import { materialColors } from '@/utils/colors';

// Definimos los tipos de navegación
export type ClientsStackParamList = {
  ManagementMenu: undefined;
  ClientsList: undefined;
  ClientDashboard: { clientId: string };
  PlanEditor: { planId?: string; clientId: string; type: 'workout' | 'diet' };
  PlanHistory: { clientId: string };
  ServicesList: undefined;
  ServiceEditor: { serviceId?: string };
};

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export default function ClientsStack() {
  return (
    <Stack.Navigator
      initialRouteName="ManagementMenu"
      screenOptions={{
        // Estilos Globales para todos los headers del stack
        headerStyle: { backgroundColor: materialColors.schemes.light.surfaceContainer },
        headerTitleStyle: { color: materialColors.schemes.light.onPrimaryContainer },
        headerTintColor: materialColors.schemes.light.onPrimaryContainer, // Color de la flecha y texto
        contentStyle: { backgroundColor: materialColors.schemes.light.background },
        headerShown: true, // Por defecto visible para todos
      }}
    >
      {/* MENU: Sin Header (porque ya tiene el Tab bar abajo y es la raiz) */}
      <Stack.Screen 
        name="ManagementMenu" 
        component={ManagementMenu} 
        options={{ headerShown: false }} 
      />
      
      {/* LISTAS: Con Header y Flecha (automática al navegar desde Menu) */}
      <Stack.Screen 
        name="ClientsList" 
        component={ClientsList} 
        options={{ headerTitle: 'Mis Alumnos' }}
      />
      
      <Stack.Screen 
        name="ServicesList" 
        component={ServicesList} 
        options={{ headerTitle: 'Mis Servicios' }} 
      />

      {/* PANTALLAS DE DETALLE: Heredan el estilo por defecto (Header visible) */}
      <Stack.Screen 
        name="ClientDashboard" 
        component={ClientDashboard} 
        options={{ headerTitle: 'Panel del Alumno' }}
      />
      
      <Stack.Screen 
        name="PlanEditor" 
        component={PlanEditor} 
        options={{ headerTitle: 'Editor de Plan' }}
      />
      
      <Stack.Screen 
        name="PlanHistory" 
        component={PlanHistoryScreen}
        options={{ headerTitle: 'Historial' }}
      />

      {/* EDITORES CON HEADER PERSONALIZADO: Ocultamos el del stack */}
      <Stack.Screen 
        name="ServiceEditor" 
        component={ServiceEditor} 
        options={{ headerShown: false }} // ServiceEditor tiene su propio header custom
      />
      
    </Stack.Navigator>
  );
}