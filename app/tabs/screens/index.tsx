import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { materialColors } from "@/utils/colors";
// import { handleLogout } from "@/utils/auth";
import HomeScreen from "./home";
import EntrenarScreen from "./entrenar";
import ChatScreen from "./chat";
import PerfilUsuarioScreen from "./perfil-usuario";
import BusquedaPerfilesScreen from "./busqueda-perfiles";

const Tab = createBottomTabNavigator();

export default function TabsScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Entrenar") {
            iconName = "barbell";
          } else if (route.name === "Chat") {
            iconName = "chatbubbles";
          } else if (route.name === "PerfilUsuario") {
            iconName = "person-circle";
          } else if (route.name === "BusquedaPerfiles") {
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
          <TouchableOpacity onPress={() => {}}>
            <Ionicons
              name="person-circle"
              size={38}
              color={materialColors.schemes.light.onPrimaryContainer}
              style={{
                marginRight: 10,
                borderColor: materialColors.schemes.light.onPrimaryContainer,
                padding: 1,
              }}
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
      <Tab.Screen name="Entrenar" component={EntrenarScreen} options={{ title: "Entrenar" }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: "Chat" }} />
      <Tab.Screen name="PerfilUsuario" component={PerfilUsuarioScreen} options={{ title: "Perfil" }} />
      <Tab.Screen name="BusquedaPerfiles" component={BusquedaPerfilesScreen} options={{ title: "Buscar" }} />
    </Tab.Navigator>
  );
}
