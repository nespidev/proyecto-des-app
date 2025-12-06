import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { materialColors } from "@/utils/colors";

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap; // solo nombres de iconos validos
  onPress: () => void;
  style?: ViewStyle; // Para poder moverlo con absolute, margins, etc
  disabled?: boolean;
  loading?: boolean;
  size?: number;
}

export default function CircleIconButton({ 
  icon, 
  onPress, 
  style, 
  disabled = false,
  loading = false,
  size = 40 
}: Props) {
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { width: size, height: size, borderRadius: size / 2 },
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={materialColors.schemes.light.primary} />
      ) : (
        <MaterialIcons 
          name={icon} 
          size={size * 0.5} // El icono es la mitad del botón
          color={materialColors.schemes.light.primary} 
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra predeterminada (elevation para android, shadow para ios)
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    zIndex: 10,
  }
});