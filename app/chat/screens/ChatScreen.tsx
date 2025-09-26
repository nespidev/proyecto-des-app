import React from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform
 } from "react-native";

export default function ChatScreen() {
  // mock de mensajes idénticos
  const mensajesMock = [
    { id: "1", text: "Mensaje de ejemplo", fromMe: false },
    { id: "2", text: "Mensaje de ejemplo", fromMe: true },
    { id: "3", text: "Mensaje de ejemplo", fromMe: false },
    { id: "4", text: "Mensaje de ejemplo", fromMe: true },
  ];

  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS necesita "padding", Android "height"
      keyboardVerticalOffset={90}>
        <View style={styles.container}>
          <Text style={styles.header}>Chat</Text>
          <ScrollView contentContainerStyle={styles.chatContainer}>
            {mensajesMock.map((msg) => (
              <View
                key={msg.id}
                style={[styles.mensaje, msg.fromMe ? styles.mensajeYo : styles.mensajeOtro]}
              >
                <Text style={styles.mensajeTexto}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Escribí un mensaje..." />
            <TouchableOpacity style={styles.botonEnviar}>
              <Text style={styles.textoBoton}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingBottom:2},
  header: { fontSize: 20, fontWeight: "bold", textAlign: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  chatContainer: { padding: 16 },
  mensaje: { padding: 10, borderRadius: 8, marginBottom: 10, maxWidth: "70%" },
  mensajeYo: { backgroundColor: "#ff6b6b", alignSelf: "flex-end" },
  mensajeOtro: { backgroundColor: "#eee", alignSelf: "flex-start" },
  mensajeTexto: { color: "#000" },
  inputContainer: { flexDirection: "row", padding: 12, borderTopWidth: 1, borderTopColor: "#ddd", alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  botonEnviar: { backgroundColor: "#ff6b6b", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  textoBoton: { color: "#fff", fontWeight: "bold" },
});
