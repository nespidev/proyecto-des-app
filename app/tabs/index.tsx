import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { materialColors } from "@/utils/colors";
import { useNavigation } from "@react-navigation/native";
import { ROOT_ROUTES, TAB_ROUTES } from "@/utils/constants";

import {HomeScreen, EntrenarScreen, BusquedaPerfilesScreen, ChatScreen} from "./screens";
const Tab = createBottomTabNavigator();

export default function TabsScreen() {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === TAB_ROUTES.HOME) {
            iconName = "home";
          } else if (route.name === TAB_ROUTES.ENTRENAR) {
            iconName = "barbell";
          } else if (route.name === TAB_ROUTES.CHAT) {
            iconName = "chatbubbles";
          } else if (route.name === TAB_ROUTES.BUSQUEDA_PERFILES) {
            iconName = "search";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarInactiveTintColor: "gray",
        headerTitleStyle: {
          color: materialColors.schemes.light.onPrimaryContainer,
        },
        headerStyle: {
          backgroundColor: materialColors.schemes.light.surfaceContainer,
        },
        tabBarStyle: {
          backgroundColor: materialColors.schemes.light.surfaceContainer,
        },
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
      <Tab.Screen
        name={TAB_ROUTES.HOME}
        component={HomeScreen}
        options={{ title: "Inicio" }}
      />
      <Tab.Screen
        name={TAB_ROUTES.ENTRENAR}
        component={EntrenarScreen}
        options={{ title: "Entrenar" }}
      />
      <Tab.Screen
        name={TAB_ROUTES.CHAT}
        component={ChatScreen}
        options={{ title: "Chat" }}
      />
      <Tab.Screen
        name={TAB_ROUTES.BUSQUEDA_PERFILES}
        component={BusquedaPerfilesScreen}
        options={{ title: "Buscar" }}
      />
    </Tab.Navigator>
  );
}
