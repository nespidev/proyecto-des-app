
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { ROOT_ROUTES, AUTH_ROUTES } from "@/utils/constants";

import HomeScreen from "@/app/tabs/screens/home/home";
import LoginScreen from "@/app/auth/screens/login";
import RegisterScreen from "@/app/auth/screens/register";
import EntrenarScreen from "@/app/tabs/screens/entrenar/entrenar";
import ChatScreen from "@/app/tabs/screens/chat/chat";
import PerfilUsuarioScreen from "@/app/tabs/screens/perfil-usuario/perfil-usuario";
import BusquedaPerfilesScreen from "@/app/tabs/screens/busqueda-perfiles/busqueda-perfiles";
import TabsScreen from "@/app/tabs/screens";
import AuthStackScreen from "@/app/auth";

const Stack = createNativeStackNavigator();

export default function RootNavigation() {

  const [isSignedIn, setIsSignedIn] = useState<boolean>(true);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isSignedIn ? ROOT_ROUTES.TABS : ROOT_ROUTES.AUTH} screenOptions={{headerShown: false}}>
        {
          isSignedIn ?
            <Stack.Screen name={ROOT_ROUTES.TABS} component={TabsScreen} options={{headerShown: false}}/>
            :
            <Stack.Screen name={ROOT_ROUTES.AUTH} component={AuthStackScreen}/>
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}
