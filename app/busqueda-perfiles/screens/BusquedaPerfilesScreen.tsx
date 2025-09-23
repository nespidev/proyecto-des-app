import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/app/navigation/RootNavigation";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";

type Props = NativeStackScreenProps<RootStackParamList, "BusquedaPerfiles">;

export default function BusquedaPerfilesScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>BUSQUEDA PERFILES</Text>
      <Text style={globalStyles.subtitle}>Pantalla de Busqueda de perfiles</Text>
      <Button
        title="Buscar"
        onPress={() => console.log("Buscar presionado")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20  },
})