import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientsListScreen from './clients-list';
import ClientDashboardScreen from './client-dashboard';
import PlanEditorScreen from './plan-editor';
import PlanHistoryScreen from '../plan-history';
import { materialColors } from '@/utils/colors';

// Definición de tipos para la navegación
export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientDashboard: { clientId: string; clientName: string };
  PlanEditor: { clientId: string; planType: 'workout' | 'diet'; existingPlan?: any };
  PlanHistory: { clientId: string };
};

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export default function ClientsStack() {
  return (
    <Stack.Navigator
      initialRouteName="ClientsList"
      screenOptions={{
        headerStyle: { backgroundColor: materialColors.schemes.light.surfaceContainer },
        headerTintColor: materialColors.schemes.light.onSurface,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: materialColors.schemes.light.background },
      }}
    >
      <Stack.Screen 
        name="ClientsList" 
        component={ClientsListScreen} 
        options={{ title: 'Mis Alumnos' }} 
      />
      
      <Stack.Screen 
        name="ClientDashboard" 
        component={ClientDashboardScreen} 
        options={({ route }) => ({ title: route.params.clientName })} 
      />

      {/* El Editor se abre como Modal para diferenciar el contexto de "Edición" */}
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