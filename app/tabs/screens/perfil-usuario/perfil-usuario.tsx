import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";
import { materialColors } from "@/utils/colors";
import { useContext } from "react";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";


export default function PerfilUsuario() {
    const {dispatch} = useContext(AuthContext)
    const handleLogout = () => {
    dispatch({type: AUTH_ACTIONS.LOGOUT})
  }
  return (
    <SafeAreaView style={styles.container}>
      <Text style={globalStyles.title}>Perfil</Text>
      <Text style={globalStyles.subtitle}>Pantalla de Perfil</Text>
      <Button
        title="Detalles Perfil"
        onPress={() => console.log("Detalles Perfil presionado")}
      />
      <Button
        title="Salir de la cuenta"
        style={styles.exitButton}
        onPress={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20  },
  exitButton: { backgroundColor: materialColors.coreColors.error}
})
