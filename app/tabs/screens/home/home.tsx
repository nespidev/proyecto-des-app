import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "@/components/Button";
import { globalStyles } from "@/utils/globalStyles";
import { ScrollView } from "react-native";
import MockCard from "@/components/MockCard";
import Card from "@/components/Card";
import { SafeAreaView } from "react-native-safe-area-context";
import { materialColors } from "@/utils/colors";

const dataMockUp = [
  { id: "1", titulo: "Mock 1" },
  { id: "2", titulo: "Mock 2" },
  { id: "3", titulo: "Mock 3" },
];

export default function Home() {
  return (
      <ScrollView>
        <View style={styles.mainContainer}>
          <View style={styles.container}>
            <Text style={[globalStyles.title, {textAlign: "center"}]}>Bienvenidos a la App</Text>
            <Text style={[globalStyles.subtitle, {textAlign: "center"}]}>Pantalla de Inicio</Text>
          </View>

          <View style={styles.container}>
            <MockCard titulo="Card de Ejemplo" />
            <Text style={styles.sectionTitle}>Novedades</Text>
          </View>

          <View>
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
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
    mainContainer: {
    flex: 1,
    backgroundColor: materialColors.schemes.light.surface,
  },
    container: {
    flex: 1,
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