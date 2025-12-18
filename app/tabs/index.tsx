import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { materialColors } from "@/utils/colors";
import { useNavigation } from "@react-navigation/native";
import { ROOT_ROUTES, TAB_ROUTES } from "@/utils/constants";
import AuthContext from "@/shared/context/auth-context/auth-context";
import ClientsStack from "./screens/clients/clients-stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native"; 

import {HomeScreen, EntrenarStackScreen, BusquedaPerfilesScreen, ChatListScreen} from "./screens";

const Tab = createBottomTabNavigator();

export default function TabsScreen() {
  const navigation = useNavigation();
  const { state } = useContext(AuthContext);
  
  const isProfessionalView = state.viewMode === 'professional'

  return (
    <Tab.Navigator
      initialRouteName={TAB_ROUTES.HOME}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === TAB_ROUTES.HOME) iconName = "home";
          else if (route.name === TAB_ROUTES.ENTRENAR) iconName = "barbell";
          else if (route.name === TAB_ROUTES.CHAT_LIST) iconName = "chatbubbles";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarInactiveTintColor: "gray",
        headerTitleStyle: { color: materialColors.schemes.light.onPrimaryContainer },
        headerStyle: { backgroundColor: materialColors.schemes.light.surfaceContainer },
        tabBarStyle: { backgroundColor: materialColors.schemes.light.surfaceContainer },
        tabBarActiveTintColor: materialColors.schemes.light.onPrimaryContainer,
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate(ROOT_ROUTES.PERFIL as never)}>
            <Ionicons
              name="person-circle"
              size={38}
              color={materialColors.schemes.light.onPrimaryContainer}
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        ),
      })}
    >
      {/* Lógica Condicional */}
      {isProfessionalView ? (
        <Tab.Screen
          name="Clientes"
          component={ClientsStack}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'ClientsList';
            const showTabHeader = routeName === 'ClientsList';

            return {
              headerShown: showTabHeader,
              title: "Gestion",
              tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
              tabBarStyle: { 
                backgroundColor: materialColors.schemes.light.surfaceContainer,
                display: showTabHeader ? 'flex' : 'none'
              } 
            };
          }}
        />
      ) : (
        <Tab.Screen
          name={TAB_ROUTES.ENTRENAR}
          component={EntrenarStackScreen}
          options={({ route }) => {
            // Obtenemos la ruta actual, si es undefined, es la inicial ('EntrenarList')
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'EntrenarList';
            
            // Definimos si mostramos el header (solo en la lista principal)
            const showTabUI = routeName === 'EntrenarList';

            return { 
              title: "Entrenar",
              headerShown: showTabUI, //  Oculta el header del Tab si no es la lista
              tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} />,
              tabBarStyle: { 
                backgroundColor: materialColors.schemes.light.surfaceContainer,
                display: showTabUI ? 'flex' : 'none' //  Oculta el tab bar inferior si no es la lista
              } 
            }
          }}
        />
      )}

      <Tab.Screen
        name={TAB_ROUTES.HOME}
        component={HomeScreen}
        options={{ title: "Inicio" }}
      />
      <Tab.Screen
        name={TAB_ROUTES.CHAT_LIST}
        component={ChatListScreen}
        options={{ title: "Chats" }}
      />
      {/* <Tab.Screen
        name={TAB_ROUTES.BUSQUEDA_PERFILES}
        component={BusquedaPerfilesScreen}
        options={{ title: "Buscar" }}
      /> */}
    </Tab.Navigator>
  );
}