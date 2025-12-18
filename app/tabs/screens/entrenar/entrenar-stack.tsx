import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { materialColors } from '@/utils/colors';
import EntrenarListScreen from './entrenar-list';
import MiPesoScreen from './mi-peso';
import PlanificacionScreen from './planificacion';
import PlanEditorScreen from '@/app/tabs/screens/plan-editor';
import PlanHistoryScreen from '../plan-history';

// Definición de tipos para la navegación
export type EntrenarStackParamList = {
  EntrenarList: undefined;
  MiPeso: undefined;
  Planificacion: undefined;
  PlanEditor: { clientId?: string; planType: 'workout' | 'diet'; existingPlan?: any };
  PlanHistory: { clientId?: string };
};

const Stack = createNativeStackNavigator<EntrenarStackParamList>();

export default function EntrenarStack() {
  return (
    <Stack.Navigator
      initialRouteName="EntrenarList"
      screenOptions={{
        headerStyle: { backgroundColor: materialColors.schemes.light.surfaceContainer },
        headerTitleStyle: { color: materialColors.schemes.light.onPrimaryContainer },
        headerTintColor: materialColors.schemes.light.onPrimaryContainer,
        contentStyle: { backgroundColor: materialColors.schemes.light.background },
      }}
    >
      {/* MENU PRINCIPAL */}
      <Stack.Screen 
        name="EntrenarList" 
        component={EntrenarListScreen} 
        options={{ 
          headerShown: false
        }} 
      />
      
      <Stack.Screen 
        name="MiPeso" 
        component={MiPesoScreen}
        options={{ 
          title: 'Mi Peso' 
        }}
      />

      <Stack.Screen 
        name="Planificacion" 
        component={PlanificacionScreen}
        options={{ 
          title: 'Planificación' 
        }}
      />

      <Stack.Screen 
        name="PlanEditor" 
        component={PlanEditorScreen} 
        options={{ 
          presentation: 'modal', 
          title: 'Editor de Plan' 
        }} 
      />
      
      <Stack.Screen 
        name="PlanHistory" 
        component={PlanHistoryScreen} 
        options={{ 
          title: 'Historial' 
        }} 
      />
    </Stack.Navigator>
  );
}