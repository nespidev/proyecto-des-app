import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigation";
import Button from "../../../components/Button";
import { globalStyles } from "../../../utils/globalStyles";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Bienvenidos a la App</Text>
      <Text style={globalStyles.subtitle}>Pantalla de Inicio</Text>
      <Button
        title="Ir a Login"
        onPress={() => navigation.navigate("Login")}
      />
      <Button
        title="Ir a Registro"
        onPress={() => navigation.navigate("Register")}
      />
      <Button
        title="Entrenar"
        onPress={() => navigation.navigate("Entrenar")}
      />
      <Button
        title="Chat"
        onPress={() => navigation.navigate("Chat")}
      />
      <Button
        title="Perfil Usuario"
        onPress={() => navigation.navigate("PerfilUsuario")}
      />
      <Button
        title="Busqueda Perfiles"
        onPress={() => navigation.navigate("BusquedaPerfiles")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20  },
})