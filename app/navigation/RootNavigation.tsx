
import React, { use, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { ROOT_ROUTES, AUTH_ROUTES } from "@/utils/constants";

import TabsScreen from "@/app/tabs/screens";
import AuthStackScreen from "@/app/auth";
import { useContext } from "react";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";
import { getUser } from "@/utils/secure-store";
import PerfilUsuario from "../tabs/screens/perfil-usuario/perfil-usuario";

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const {state, dispatch} = useContext(AuthContext)
  const [isSignedIn, setIsSignedIn] = useState<boolean>(true);

  useEffect(() => {
    if (state?.user) {
      setIsSignedIn(true)
    } else {
      setIsSignedIn(false)
    }
  }, [state]);

  useEffect(() => {
    getUser().then(user => {
      if (user) {
        dispatch({type: AUTH_ACTIONS.SET_USER, payload: {user}})
        setIsSignedIn(true)
      }
      // SplashScreen.hideAsync();
    })
  }, []);

  return (
<NavigationContainer>
  <Stack.Navigator
    initialRouteName={isSignedIn ? ROOT_ROUTES.TABS : ROOT_ROUTES.AUTH}
    screenOptions={{ headerShown: false }}
  >
    {isSignedIn ? (
      <Stack.Screen
        name={ROOT_ROUTES.TABS}
        component={TabsScreen}
        options={{ headerShown: false }}
      />
    ) : (
      <Stack.Screen name={ROOT_ROUTES.AUTH} component={AuthStackScreen} />
    )}
    <Stack.Screen 
      name={ROOT_ROUTES.PERFIL} 
      component={PerfilUsuario} 
      options={{ headerShown: true, title: "Perfil" }} 
    />
  </Stack.Navigator>
</NavigationContainer>

  );
}
