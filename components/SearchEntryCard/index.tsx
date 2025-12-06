import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { materialColors } from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";

interface IProps {
  onPress: () => void;
}

export default function SearchEntryCard({ onPress }: IProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>Buscar Profesionales</Text>
        <Text style={styles.subtitle}>
          Encuentra entrenadores y nutricionistas cerca de ti
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <Ionicons 
          name="search" 
          size={32} 
          color={materialColors.schemes.light.onPrimaryContainer} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: materialColors.schemes.light.primaryContainer, // Color destacado pero suave
    borderRadius: 16,
    padding: 20,
    flexDirection: "row", // Elementos lado a lado
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
    // Sombra suave para darle profundidad
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: materialColors.schemes.light.onPrimaryContainer,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: materialColors.schemes.light.onPrimaryContainer,
    opacity: 0.8,
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.3)", // Círculo semitransparente detrás de la lupa
    padding: 12,
    borderRadius: 30,
  },
});