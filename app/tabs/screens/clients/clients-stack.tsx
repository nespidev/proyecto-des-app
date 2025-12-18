import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientsListScreen from './clients-list';
import ClientDashboardScreen from './client-dashboard';
import PlanEditorScreen from '@/components/PlanEditorScreen';
import PlanHistoryScreen from '../plan-history';
import { materialColors } from '@/utils/colors';

// Definición de tipos para la navegación
export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientDashboard: { clientId: string; clientName: string };
  PlanEditor: { clientId: string; planType: 'workout' | 'diet'; existingPlan?: any };
  PlanHistory: { clientId: string };
};

export default function ClientsStack() {
const Stack = createNativeStackNavigator<ClientsStackParamList>();

return (
    <Stack.Navigator
      initialRouteName="ClientsList"
      screenOptions={{
        headerStyle: { backgroundColor: materialColors.schemes.light.surfaceContainer },
        headerTitleStyle: { color: materialColors.schemes.light.onPrimaryContainer },
        headerTintColor: materialColors.schemes.light.onPrimaryContainer,
        contentStyle: { backgroundColor: materialColors.schemes.light.background },
      }}
    >
      <Stack.Screen 
        name="ClientsList" 
        component={ClientsListScreen} 
        options={{ 
          headerShown: false //  Ocultar el header del Stack
        }} 
      />
      
      <Stack.Screen 
        name="ClientDashboard" 
        component={ClientDashboardScreen}
        options={({ route }) => ({ 
          headerShown: true, // que se vea la barra
          title: route.params.clientName // Usamor el nombre que pasamos al navegar
        })}
      />

      <Stack.Screen 
        name="PlanEditor" 
        component={PlanEditorScreen} 
        options={{ 
          presentation: 'modal', 
          title: 'Gestión de Plan' 
        }} 
      />
      <Stack.Screen 
        name="PlanHistory" 
        component={PlanHistoryScreen} 
        options={{ title: 'Historial' }} 
      />
    </Stack.Navigator>
  );
}