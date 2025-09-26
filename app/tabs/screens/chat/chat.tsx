import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/app/navigation/RootNavigation";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";

export default function Chat() {
  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>CHAT</Text>
      <Text style={globalStyles.subtitle}>Pantalla de Chat</Text>
      <Button
        title="Chatear"
        onPress={() => console.log("Chatear presionado")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20  },
})