import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROOT_ROUTES } from "@/utils/constants";
import { View, ActivityIndicator } from "react-native";

import TabsScreen from "@/app/tabs";
import AuthStackScreen from "@/app/auth";
import { AuthContext } from "@/shared/context/auth-context";
import PerfilUsuario from "@/app/tabs/screens/perfil-usuario/perfil-usuario";
import PerfilEntrenador from "@/app/tabs/screens/perfil-usuario/perfil-entrenador";
import Chat from "@/app/tabs/screens/chat";
import { materialColors } from "@/utils/colors";

const Stack = createNativeStackNavigator();

export default function Root() {
  const { state } = useContext(AuthContext);

  // Pantalla de carga mientras Supabase verifica si hay usuario guardado
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
              name={ROOT_ROUTES.PERFIL_ENTRENADOR}
              component={PerfilEntrenador}
              options={{ title: "Perfil Entrenador" }}
            />
            <Stack.Screen
              name={ROOT_ROUTES.CHAT}
              component={Chat}
              options={{ title: "Chat" }}
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