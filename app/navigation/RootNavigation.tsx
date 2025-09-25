
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "@/app/tabs/screens/home/HomeScreen";
import LoginScreen from "@/app/auth/screens/LoginScreen";
import RegisterScreen from "@/app/auth/screens/RegisterScreen";
import EntrenarScreen from "@/app/tabs/screens/entrenar/EntrenarScreen";
import ChatScreen from "@/app/tabs/screens/chat/ChatScreen";
import PerfilUsuarioScreen from "@/app/tabs/screens/perfil-usuario/perfilUsuarioScreen";
import BusquedaPerfilesScreen from "@/app/tabs/screens/busqueda-perfiles/BusquedaPerfilesScreen";

import TabsScreen from "@/app/tabs/screens";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Entrenar: undefined;
  Chat: undefined;
  PerfilUsuario: undefined;
  BusquedaPerfiles: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }}  />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
        <Stack.Screen name="Entrenar" component={EntrenarScreen} options={{ title: 'Entrenar' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
        <Stack.Screen name="PerfilUsuario" component={PerfilUsuarioScreen} options={{ title: 'PerfilUsuario' }} />
        <Stack.Screen name="BusquedaPerfiles" component={BusquedaPerfilesScreen} options={{ title: 'BusquedaPerfiles' }} /> */}
        <Stack.Screen name="Home" component={TabsScreen} options={{ title: 'Inicio' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
