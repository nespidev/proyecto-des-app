import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <Text style={globalStyles.title}>CHAT</Text>
        <Text style={globalStyles.subtitle}>Pantalla de Chat</Text>
        <Button
          title="Chatear"
          onPress={() => console.log("Chatear presionado")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20  },
})