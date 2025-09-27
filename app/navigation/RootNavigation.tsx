import React, { useEffect, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROOT_ROUTES } from "@/utils/constants";
import { View, StyleSheet } from "react-native";

import TabsScreen from "@/app/tabs";
import AuthStackScreen from "@/app/auth";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";
import { getUser } from "@/utils/secure-store";
import PerfilUsuario from "../tabs/screens/perfil-usuario/perfil-usuario";
import PerfilEntrenador from "../tabs/screens/perfil-usuario/perfil-entrenador";
import Chat from "../tabs/screens/chat";
import { materialColors } from "@/utils/colors";

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const { state, dispatch } = useContext(AuthContext);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  useEffect(() => {
    if (state?.user) {
      setIsSignedIn(true);
    } else {
      setIsSignedIn(false);
    }
  }, [state]);

  useEffect(() => {
    getUser().then(user => {
      if (user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: { user } });
        setIsSignedIn(true);
      }
    });
  }, []);

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
        {isSignedIn ? (
          <>
            <Stack.Screen
              name={ROOT_ROUTES.TABS}
              component={TabsScreen}
              options={{ headerShown: false }} // el header de tabs maneja su propio estilo
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

const styles = StyleSheet.create({
  backgroundContainer: {
    backgroundColor: materialColors.schemes.light.surface,
    flex: 1,
  },
});
