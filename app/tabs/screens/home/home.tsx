import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";
import { ScrollView } from "react-native";
import MockCard from "@/components/MockCard";
import { SafeAreaView } from "react-native-safe-area-context";

const dataMockUp = [
  { id: "1", titulo: "Mock 1" },
  { id: "2", titulo: "Mock 2" },
  { id: "3", titulo: "Mock 3" },
];

export default function Home() {
  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Text style={[globalStyles.title, {textAlign: "center"}]}>Bienvenidos a la App</Text>
          <Text style={[globalStyles.subtitle, {textAlign: "center"}]}>Pantalla de Inicio</Text>

          <MockCard titulo="Card de Ejemplo" />
            <Text style={styles.sectionTitle}>Novedades</Text>
            <FlatList
              data={dataMockUp}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MockCard style={styles.horizontalCard} titulo={item.titulo} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              nestedScrollEnabled
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
  },
  horizontalList: {
    paddingBottom: 8,
    paddingLeft: 8,
  },
  horizontalCard: {
    width: 250,
    marginRight: 12,
  },
  containerButtons: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20  },
})