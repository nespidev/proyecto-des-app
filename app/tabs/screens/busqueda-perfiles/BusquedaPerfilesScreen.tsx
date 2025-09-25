import React from "react";
import { View, Text, StyleSheet, FlatList, } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/app/navigation/RootNavigation";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";
import trainers from "./trainersDePrueba";
type Props = NativeStackScreenProps<RootStackParamList, "BusquedaPerfiles">;

export default function BusquedaPerfilesScreen({ navigation }: Props) {
  
  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>BUSQUEDA DE PERFILES</Text>
      <Text style={globalStyles.subtitle}>Pantalla de Busqueda de perfiles</Text>
      <FlatList
        data={ trainers }
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.especialidad}>{item.especialidad}</Text>
            <Text>{item.descripcion}</Text>
            <Text>📧 {item.correo}</Text>
            <Text>📞 {item.telefono}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
  },
  especialidad: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 6,
  },
});
