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
import ContactsListScreen from "./tabs/screens/contacts-list";
import BusquedaPerfilesScreen from "./tabs/screens/busqueda-perfiles/busqueda-perfiles";
import { materialColors } from "@/utils/colors";

const Stack = createNativeStackNavigator();

export default function Root() {
  const { state } = useContext(AuthContext);
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
            <Stack.Screen 
              name={ROOT_ROUTES.BUSQUEDA_PERFILES} 
              component={BusquedaPerfilesScreen} 
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