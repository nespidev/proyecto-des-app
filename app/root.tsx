import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROOT_ROUTES } from "@/utils/constants";
import { View, ActivityIndicator } from "react-native";
import { registerForPushNotificationsAsync } from "@/utils/notification-helper";
import TabsScreen from "@/app/tabs";
import AuthStackScreen from "@/app/auth";
import { AuthContext } from "@/shared/context/auth-context";
import PerfilUsuario from "@/app/tabs/screens/perfil-usuario/perfil-usuario";
import PerfilPublico from "@/app/tabs/screens/perfil-publico/perfil-publico";
import CalendarScreen from "@/app/tabs/screens/calendar";
import ChatRoomScreen from "@/app/tabs/screens/chat-room";
import ContactsListScreen from "./tabs/screens/contacts-list"; // Ajusta ruta si es necesario
import { materialColors } from "@/utils/colors";

const Stack = createNativeStackNavigator();

export default function Root() {
  const { state } = useContext(AuthContext);

  useEffect(() => {
    // Solo intentamos registrar si ya dejó de cargar y hay un usuario
    if (!state.isLoading && state.user) {
      registerForPushNotificationsAsync();
    }
  }, [state.isLoading, state.user]); // Dependencias explícitas

  // Pantalla de carga mientras Supabase verifica
  if (state.isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: materialColors.schemes.light.surfaceContainer,
          },
          headerTitleStyle: {
            color: materialColors.schemes.light.onPrimaryContainer,
          },
          headerTintColor: materialColors.schemes.light.onPrimaryContainer,
        }}
      >
        {state.user ? (
          <>
            <Stack.Screen
              name={ROOT_ROUTES.TABS}
              component={TabsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={ROOT_ROUTES.PERFIL}
              component={PerfilUsuario}
              options={{ title: "Perfil" }}
            />
            <Stack.Screen
              name={ROOT_ROUTES.PERFIL_PUBLICO}
              component={PerfilPublico}
              options={{ title: "Perfil Público" }}
            />
            <Stack.Screen
              name={ROOT_ROUTES.CHAT_ROOM}
              component={ChatRoomScreen}
              options={{ title: "Chat Room" }}
            />
             <Stack.Screen 
              name={ROOT_ROUTES.CALENDAR_SCREEN} 
              component={CalendarScreen} 
              options={{ title: 'Mi Calendario' }} 
            />
             <Stack.Screen 
              name={ROOT_ROUTES.CONTACTS_LIST} 
              component={ContactsListScreen} 
              options={{ title: 'Contactos' }} 
            />
          </>
        ) : (
          <Stack.Screen
            name={ROOT_ROUTES.AUTH}
            component={AuthStackScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}